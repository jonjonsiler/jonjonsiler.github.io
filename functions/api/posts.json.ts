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

export async function onRequestGet(context: {
  env: { DB: D1Database };
}) {
  const query = `
    SELECT id, slug, title, summary, publishedAt, contentHtml, contentText
    FROM Post
    ORDER BY publishedAt DESC
  `;

  try {
    const { results } = await context.env.DB.prepare(query).all<PostRow>();
    const posts = results.map((post) => ({
      ...post,
      id: String(post.id),
    }));

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to load posts." }),
      {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  }
}
