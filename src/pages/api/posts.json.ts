import type { APIRoute } from "astro";
import { loadPosts } from "@/data/posts";

export const GET: APIRoute = async () => {
  const posts = await loadPosts();
  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
