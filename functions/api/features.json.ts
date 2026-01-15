import type { D1Database } from "@cloudflare/workers-types";

type FeatureRow = {
  id: number;
  slug: string;
  image: string;
  title: string;
  subtitle: string;
  detail: string | null;
  createdAt: string;
};

const isAuthorized = (request: Request, apiKey?: string) => {
  if (!apiKey) return true;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${apiKey}`;
};

export async function onRequestGet(context: {
  request: Request;
  env: { DB: D1Database; API_KEY?: string };
}) {
  if (!isAuthorized(context.request, context.env.API_KEY)) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  const query = `
    SELECT id, slug, image, title, subtitle, detail, createdAt
    FROM Feature
    ORDER BY createdAt ASC
  `;

  try {
    const { results } = await context.env.DB.prepare(query).all<FeatureRow>();
    const features = results.map((feature) => ({
      image: feature.image,
      title: feature.title,
      subtitle: feature.subtitle,
      detail: feature.detail ?? undefined,
    }));

    return new Response(JSON.stringify(features), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to load features." }),
      {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  }
}
