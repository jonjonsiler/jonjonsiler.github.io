import React from "react";
import type { PostItem as PostProps } from "@/models";

export default function Post({ post }: { post: PostProps }) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const formattedDate = new Date(post.date).toLocaleDateString(undefined, dateOptions);
  const detailUrl = `/posts/${post.id}`;

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
