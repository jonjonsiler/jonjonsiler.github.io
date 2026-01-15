import React from "react";
import type { PostItem as PostProps } from "@/models";
import { useFetch } from "@/hooks";
import { LoadingStatus } from "@/enums";

export default function Post({ post }: { post: PostProps }) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", dateOptions);
  const slug = post.slug ?? post.id;
  const detailUrl = `/posts/${slug}`;
  return (
    <article className="surface-card space-y-5 rounded-3xl border border-slate-800/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/60 hover:shadow-sky-500/20 md:p-8">
      <div className="group block space-y-5 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {post.title}
        </h2>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
          {formattedDate}
        </p>
        <div className="space-y-4 text-sm text-slate-200/90 md:text-base">
          {post.summary}
        </div>
        <a href={detailUrl} className="inline-flex items-center text-sm font-semibold uppercase tracking-[0.35em] text-sky-300 transition-colors duration-200 group-hover:text-white">
          Read article →
        </a>
      </div>
    </article>
  );
}

export const Posts = ({ apiBaseUrl, apiKey }: {
  apiBaseUrl?: string;
  apiKey?: string;
}) => {
  const { data, status, error, reload } = useFetch<PostProps[]>({
    path: "/api/posts.json",
    apiBaseUrl,
    apiKey
  });
  const posts = Array.isArray(data) ? data : [];

  switch (status) {
    case LoadingStatus.READY:
      return !posts.length ? (
        <div className="surface-card space-y-4 rounded-3xl border border-slate-800/70 p-8 text-center text-sm text-slate-300 md:p-12">
          <p>Fresh posts are in the works. Check back soon or reach out directly if you’d like to chat.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Post key={post.slug ?? post.id} post={post} />
          ))}
        </div>
      );

    case LoadingStatus.ERROR:
      return (
        <div className="surface-card space-y-4 rounded-3xl border border-rose-800/70 p-8 text-center text-rose-100 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em]">
            API unreachable
          </p>
          <p className="text-base text-rose-50/80">
            {error ?? "Something went wrong while loading the posts feed."}
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:border-sky-400/50 hover:text-sky-200"
            >
              Try again
            </button>
          </div>
        </div>
      );

    case LoadingStatus.LOADING:
    default:
      return (
        <div className="surface-card rounded-3xl border border-slate-800/70 p-8 text-center text-slate-300 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
            Loading
          </p>
          <p className="mt-3 text-base">Fetching posts from the API…</p>
        </div>
      );
  }


}
