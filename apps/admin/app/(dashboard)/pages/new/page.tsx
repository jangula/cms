"use client";

import { PageForm } from "@/components/pages/page-form";

export default function NewPagePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Page</h1>
      <PageForm mode="create" />
    </div>
  );
}
