"use client";

import { useState, useEffect, use } from "react";
import { Card, CardTitle } from "@angulacms/ui";
import { PageForm } from "@/components/pages/page-form";
import { RevisionHistory } from "@/components/pages/revision-history";
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
  publishedAt: string;
  seo: Record<string, { title: string; description: string; ogImage: string }>;
}

export default function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    apiFetch<PageData>(`/pages/${id}`)
      .then(setPage)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, key]);

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading...</p>;
  }

  if (!page) {
    return <p className="text-center text-red-500 py-8">Page not found.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Page</h1>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PageForm key={key} mode="edit" initialData={page} />
        </div>
        <div>
          <Card>
            <CardTitle>Revision History</CardTitle>
            <div className="mt-4">
              <RevisionHistory
                pageId={id}
                onRestore={() => setKey((k) => k + 1)}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
