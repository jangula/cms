"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Badge, Card } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface Article {
  id: string;
  slug: string;
  title: Record<string, string>;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  author: { id: string; name: string };
  tags: { tag: { id: string; name: Record<string, string>; slug: string } }[];
}

const statusVariant: Record<string, "success" | "warning" | "default" | "info"> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  SCHEDULED: "info",
  ARCHIVED: "default",
};

export default function NewsListPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: Article[]; total: number }>(
        `/news?page=${page}&pageSize=20`
      );
      setArticles(res.data);
      setTotal(res.total);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return;
    await apiFetch(`/news/${id}`, { method: "DELETE" });
    fetchArticles();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">News & Articles</h1>
        <Link href="/news/new">
          <Button>New Article</Button>
        </Link>
      </div>

      <Card padding={false}>
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading...</p>
        ) : articles.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No articles yet. Create your first article.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {a.title.en || "Untitled"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[a.status] || "default"}>{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {a.tags.map((t) => (
                        <Badge key={t.tag.id} variant="info">{t.tag.name.en}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{a.author.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {a.publishedAt
                      ? new Date(a.publishedAt).toLocaleDateString()
                      : new Date(a.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/news/${a.id}/edit`)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > 20 && (
          <div className="flex justify-between items-center p-4 border-t">
            <p className="text-sm text-gray-500">{total} articles total</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
