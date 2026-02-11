"use client";

import { useState, useEffect, use } from "react";
import { ArticleForm } from "@/components/news/article-form";
import { apiFetch } from "@/lib/api";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [article, setArticle] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/news/${id}`)
      .then((data) => setArticle(data as Record<string, unknown>))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center text-gray-500 py-8">Loading...</p>;
  if (!article) return <p className="text-center text-red-500 py-8">Article not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Article</h1>
      <ArticleForm
        mode="edit"
        initialData={article as unknown as Parameters<typeof ArticleForm>[0]["initialData"]}
      />
    </div>
  );
}
