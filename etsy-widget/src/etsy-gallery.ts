type Item = {
  id: string;
  title: string;
  price?: number;
  currency?: string;
  image?: string;
  url: string;
  available?: boolean;
};

const escapeHtml = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[c] ?? c;
  });

const money = (value: number | undefined, currency = "USD") => {
  if (typeof value !== "number") return "";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
};

class EtsyGallery extends HTMLElement {
  static observedAttributes = ["feed", "columns", "show-price", "title"];

  private root: ShadowRoot;
  private abort?: AbortController;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    this.renderSkeleton();
  }

  connectedCallback() {
    this.load();
  }

  disconnectedCallback() {
    this.abort?.abort();
  }

  attributeChangedCallback() {
    // Attribute changes can happen rapidly while editing; debounce a hair.
    queueMicrotask(() => this.load());
  }

  get feed() {
    return this.getAttribute("feed") ?? "";
  }

  get columns() {
    const n = Number(this.getAttribute("columns") ?? "3");
    return Math.max(1, Math.min(6, Number.isFinite(n) ? n : 3));
  }

  get showPrice() {
    return (this.getAttribute("show-price") ?? "true") !== "false";
  }

  get title() {
    return this.getAttribute("title") ?? "";
  }

  private renderSkeleton() {
    this.root.innerHTML = `
      <style>
        :host { display:block; }
        .wrap { }
        .header {
          display:flex;
          align-items:baseline;
          justify-content:space-between;
          margin: 0 0 12px;
        }
        .title {
          font: inherit;
          font-weight: 700;
          font-size: 18px;
          margin: 0;
        }
        .status {
          font-size: 13px;
          opacity: .75;
          margin: 0;
        }

        .grid {
          display: grid;
          gap: 16px;
        }

        .card {
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: transform .12s ease, box-shadow .12s ease;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,.12);
        }

        .imgWrap {
          position: relative;
          aspect-ratio: 1 / 1;
          background: rgba(0,0,0,.05);
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .badge {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(0,0,0,.75);
          color: #fff;
        }

        .meta {
          padding: 12px 12px 14px;
        }
        .itemTitle {
          font-size: 14px;
          line-height: 1.35;
          font-weight: 600;
          margin: 0 0 8px;
        }
        .price {
          font-size: 13px;
          margin: 0;
          opacity: .85;
        }

        .error {
          padding: 12px;
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 12px;
        }

        @media (max-width: 640px) {
          .grid { gap: 12px; }
        }
      </style>

      <div class="wrap">
        <div class="header" part="header">
          <h3 class="title" part="title"></h3>
          <p class="status" part="status"></p>
        </div>

        <div class="body" part="body">
          <div class="error" id="msg">Loading…</div>
        </div>
      </div>
    `;
  }

  private setStatus(text: string) {
    const status = this.root.querySelector(".status") as HTMLElement | null;
    if (status) status.textContent = text;
  }

  private setTitle() {
    const t = this.root.querySelector(".title") as HTMLElement | null;
    if (!t) return;

    const title = this.title.trim();
    if (title) {
      t.textContent = title;
      t.style.display = "block";
    } else {
      t.textContent = "";
      t.style.display = "none";
    }
  }

  private async load() {
    this.setTitle();

    const feedUrl = this.feed;
    const body = this.root.querySelector(".body") as HTMLElement | null;
    if (!body) return;

    this.abort?.abort();
    this.abort = new AbortController();

    if (!feedUrl) {
      body.innerHTML = `<div class="error">Missing <code>feed</code> attribute.</div>`;
      this.setStatus("");
      return;
    }

    body.innerHTML = `<div class="error">Loading…</div>`;
    this.setStatus("Fetching listings…");

    let items: Item[];
    try {
      const res = await fetch(feedUrl, {
        cache: "no-store",
        signal: this.abort.signal
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Feed must be a JSON array");
      items = data as Item[];
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      body.innerHTML = `<div class="error">Could not load feed: ${escapeHtml(e?.message ?? e)}</div>`;
      this.setStatus("");
      return;
    }

    this.setStatus(items.length ? `${items.length} items` : "No items");
    const cols = this.columns;

    const cards = items
      .map((it) => {
        const title = escapeHtml(it.title);
        const img = escapeHtml(it.image ?? "");
        const url = escapeHtml(it.url);
        const price = this.showPrice ? escapeHtml(money(it.price, it.currency)) : "";
        const sold = it.available === false;

        return `
          <a class="card" href="${url}" target="_blank" rel="noopener noreferrer">
            <div class="imgWrap">
              ${img ? `<img src="${img}" alt="${title}" loading="lazy">` : ""}
              ${sold ? `<span class="badge">Sold</span>` : ""}
            </div>
            <div class="meta">
              <p class="itemTitle">${title}</p>
              ${this.showPrice && price ? `<p class="price">${price}</p>` : ""}
            </div>
          </a>
        `;
      })
      .join("");

    body.innerHTML = `<div class="grid" style="grid-template-columns:repeat(${cols}, minmax(0, 1fr))">${cards}</div>`;
  }
}

if (!customElements.get("etsy-gallery")) {
  customElements.define("etsy-gallery", EtsyGallery);
}