"use client";

import { ArticleForm } from "@/components/news/article-form";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Article</h1>
      <ArticleForm mode="create" />
    </div>
  );
}
