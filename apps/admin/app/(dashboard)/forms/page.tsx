"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Badge, Card } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface FormItem {
  id: string;
  name: string;
  slug: string;
  fields: unknown[];
  createdAt: string;
  _count: { submissions: number };
}

export default function FormsListPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: FormItem[] }>("/forms?pageSize=50");
      setForms(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this form and all its submissions?")) return;
    await apiFetch(`/forms/${id}`, { method: "DELETE" });
    fetchForms();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
        <Link href="/forms/new">
          <Button>New Form</Button>
        </Link>
      </div>

      <Card padding={false}>
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading...</p>
        ) : forms.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No forms yet. Create your first form.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fields</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submissions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{form.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">/{form.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {(form.fields as unknown[]).length} fields
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={form._count.submissions > 0 ? "info" : "default"}>
                      {form._count.submissions}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/forms/${form.id}/edit`)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/forms/${form.id}/submissions`)}>
                      Submissions
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(form.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
