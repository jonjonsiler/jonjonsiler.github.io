import React from "react";

export type Post = {
  id: string;
  title: string;
  date: string;
  contentHtml: string;
  contentText: string;
};

export default function PostItem({ post }: { post: Post }) {
  return (
    <article className="border border-gray-200 bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <h2 className="text-xl font-bold mb-2">{post.title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(post.date).toLocaleDateString()}
      </p>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}