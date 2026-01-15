import type { Fetcher } from "@cloudflare/workers-types";

export async function onRequestGet(context: {
  request: Request;
  env: { ASSETS: Fetcher };
}) {
  // Serve your static mock feed, but through an API-shaped endpoint.
  const url = new URL(context.request.url);
  url.pathname = "/etsy/mock-etsy.json";

  // Pages provides env.ASSETS.fetch() to retrieve static assets from your project.  [oai_citation:1‡Cloudflare Docs](https://developers.cloudflare.com/pages/functions/api-reference/?utm_source=chatgpt.com)
  const assetResp = await context.env.ASSETS.fetch(url);

  if (!assetResp.ok) {
    return new Response(
      JSON.stringify({ error: "Mock feed not found", path: url.pathname }),
      { status: 404, headers: { "content-type": "application/json" } }
    );
  }

  // Force JSON content-type + allow some caching (adjust as you like)
  const headers: Record<string, string> = {};
  assetResp.headers.forEach((value, key) => {
    headers[key] = value;
  });
  headers["content-type"] = "application/json; charset=utf-8";
  headers["cache-control"] = "public, max-age=300";
  const body = await assetResp.arrayBuffer();
  return new Response(body, { status: 200, headers });
}
