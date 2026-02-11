"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button, Card, CardTitle, Modal } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface Submission {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
}

interface FormInfo {
  id: string;
  name: string;
  fields: { id: string; label: string; name: string }[];
}

export default function FormSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [form, setForm] = useState<FormInfo | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewSubmission, setViewSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    apiFetch<FormInfo>(`/forms/${id}`)
      .then(setForm)
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ data: Submission[]; total: number }>(
      `/forms/${id}/submissions?page=${page}&pageSize=30`
    )
      .then((res) => {
        setSubmissions(res.data);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, page]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Submissions: {form?.name || "..."}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} total submissions</p>
        </div>
        <Link href="/forms">
          <Button variant="outline">Back to Forms</Button>
        </Link>
      </div>

      <Card padding={false}>
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading...</p>
        ) : submissions.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No submissions yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                {form?.fields.slice(0, 4).map((f) => (
                  <th key={f.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((sub, idx) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {(page - 1) * 30 + idx + 1}
                  </td>
                  {form?.fields.slice(0, 4).map((f) => (
                    <td key={f.id} className="px-4 py-3 text-sm text-gray-900 max-w-48 truncate">
                      {String(sub.data[f.name] ?? "-")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setViewSubmission(sub)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > 30 && (
          <div className="flex justify-between items-center p-4 border-t">
            <p className="text-sm text-gray-500">Page {page}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page * 30 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Submission Modal */}
      <Modal open={!!viewSubmission} onClose={() => setViewSubmission(null)} title="Submission Details" size="md">
        {viewSubmission && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Submitted: {new Date(viewSubmission.createdAt).toLocaleString()}
            </p>
            <div className="divide-y">
              {form?.fields.map((field) => (
                <div key={field.id} className="py-2">
                  <p className="text-xs font-medium text-gray-500">{field.label}</p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {String(viewSubmission.data[field.name] ?? "-")}
                  </p>
                </div>
              ))}
              {/* Show any fields not in form definition */}
              {Object.entries(viewSubmission.data)
                .filter(([key]) => !form?.fields.some((f) => f.name === key))
                .map(([key, value]) => (
                  <div key={key} className="py-2">
                    <p className="text-xs font-medium text-gray-500">{key}</p>
                    <p className="text-sm text-gray-900 mt-0.5">{String(value)}</p>
                  </div>
                ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewSubmission(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
