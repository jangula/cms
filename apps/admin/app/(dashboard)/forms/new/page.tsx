"use client";

import { FormBuilder } from "@/components/forms/form-builder";

export default function NewFormPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Form</h1>
      <FormBuilder mode="create" />
    </div>
  );
}
