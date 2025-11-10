import React from "react";
import type { PostItem as PostProps } from "@/models";

export default function Post({ post }: { post: PostProps }) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const formattedDate = new Date(post.date).toLocaleDateString(undefined, dateOptions);

  return (
    <article className="surface-card space-y-5 rounded-3xl border border-slate-800/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/60 hover:shadow-sky-500/20 md:p-8">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {post.title}
      </h2>
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
        {formattedDate}
      </p>
      <div
        className="space-y-4 text-sm text-slate-200/90 md:text-base"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
