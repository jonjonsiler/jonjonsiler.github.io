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

export async function onRequestGet(context: {
  env: { DB: D1Database };
}) {
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
