import type { D1Database } from "@cloudflare/workers-types";

type PostRow = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  contentHtml: string;
  contentText: string;
};

const isAuthorized = (request: Request, apiKey?: string) => {
  if (!apiKey) return true;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${apiKey}`;
};

export async function onRequestGet(context: {
  request: Request;
  env: { DB: D1Database; API_KEY?: string };
  params: { slug?: string };
}) {
  if (!isAuthorized(context.request, context.env.API_KEY)) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  const slug = context.params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const query = `
    SELECT id, slug, title, summary, publishedAt, contentHtml, contentText
    FROM Post
    WHERE slug = ?1
    LIMIT 1
  `;

  try {
    const result = await context.env.DB.prepare(query).bind(slug).first<PostRow>();
    if (!result) {
      return new Response(JSON.stringify({ error: "Post not found." }), {
        status: 404,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    const post = { ...result, id: String(result.id) };
    return new Response(JSON.stringify(post), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to load post." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}
