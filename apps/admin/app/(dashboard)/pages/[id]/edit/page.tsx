"use client";

import { useState, useEffect, use } from "react";
import { PageForm } from "@/components/pages/page-form";
import { apiFetch } from "@/lib/api";

interface PageData {
  id: string;
  slug: string;
  template: string;
  title: Record<string, string>;
  content: Record<string, string>;
  excerpt: Record<string, string>;
  featuredImage: string;
  status: string;
}

export default function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<PageData>(`/pages/${id}`)
      .then(setPage)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading...</p>;
  }

  if (!page) {
    return <p className="text-center text-red-500 py-8">Page not found.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Page</h1>
      <PageForm mode="edit" initialData={page} />
    </div>
  );
}
