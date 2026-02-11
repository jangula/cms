"use client";

import { useState, useEffect, use } from "react";
import { FormBuilder } from "@/components/forms/form-builder";
import { apiFetch } from "@/lib/api";

export default function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/forms/${id}`)
      .then((data) => setForm(data as Record<string, unknown>))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center text-gray-500 py-8">Loading...</p>;
  if (!form) return <p className="text-center text-red-500 py-8">Form not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Form</h1>
      <FormBuilder
        mode="edit"
        initialData={form as unknown as Parameters<typeof FormBuilder>[0]["initialData"]}
      />
    </div>
  );
}
