"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Card, CardTitle, Modal } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";
import { generateSlug } from "@angulacms/core/utils";

interface FormField {
  id: string;
  label: string;
  name: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox" | "radio" | "number" | "date" | "file";
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select/radio
}

interface FormData {
  id?: string;
  name: string;
  slug: string;
  fields: FormField[];
  settings: {
    submitLabel?: string;
    successMessage?: string;
    notifyEmail?: string;
  };
}

interface FormBuilderProps {
  initialData?: FormData;
  mode: "create" | "edit";
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Radio Buttons" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "File Upload" },
];

export function FormBuilder({ initialData, mode }: FormBuilderProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    fields: initialData?.fields || [],
    settings: initialData?.settings || {
      submitLabel: "Submit",
      successMessage: "Thank you for your submission.",
      notifyEmail: "",
    },
  });

  // Add field modal
  const [fieldOpen, setFieldOpen] = useState(false);
  const [editingFieldIdx, setEditingFieldIdx] = useState<number | null>(null);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<FormField["type"]>("text");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldPlaceholder, setFieldPlaceholder] = useState("");
  const [fieldOptions, setFieldOptions] = useState("");

  useEffect(() => {
    if (mode === "create" && formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, mode]);

  function openAddField() {
    setEditingFieldIdx(null);
    setFieldLabel("");
    setFieldType("text");
    setFieldRequired(false);
    setFieldPlaceholder("");
    setFieldOptions("");
    setFieldOpen(true);
  }

  function openEditField(idx: number) {
    const field = formData.fields[idx];
    setEditingFieldIdx(idx);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldRequired(field.required);
    setFieldPlaceholder(field.placeholder || "");
    setFieldOptions(field.options?.join(", ") || "");
    setFieldOpen(true);
  }

  function handleSaveField() {
    if (!fieldLabel) return;

    const field: FormField = {
      id: editingFieldIdx !== null ? formData.fields[editingFieldIdx].id : `field-${Date.now()}`,
      label: fieldLabel,
      name: generateSlug(fieldLabel).replace(/-/g, "_"),
      type: fieldType,
      required: fieldRequired,
      placeholder: fieldPlaceholder || undefined,
      options: ["select", "radio"].includes(fieldType) && fieldOptions
        ? fieldOptions.split(",").map((o) => o.trim()).filter(Boolean)
        : undefined,
    };

    if (editingFieldIdx !== null) {
      const newFields = [...formData.fields];
      newFields[editingFieldIdx] = field;
      setFormData((prev) => ({ ...prev, fields: newFields }));
    } else {
      setFormData((prev) => ({ ...prev, fields: [...prev.fields, field] }));
    }

    setFieldOpen(false);
  }

  function removeField(idx: number) {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== idx),
    }));
  }

  function moveField(idx: number, direction: "up" | "down") {
    const newFields = [...formData.fields];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newFields.length) return;
    [newFields[idx], newFields[swapIdx]] = [newFields[swapIdx], newFields[idx]];
    setFormData((prev) => ({ ...prev, fields: newFields }));
  }

  async function handleSubmit() {
    setSaving(true);
    setError("");

    try {
      if (mode === "create") {
        await apiFetch("/forms", { method: "POST", body: JSON.stringify(formData) });
      } else {
        await apiFetch(`/forms/${initialData?.id}`, { method: "PUT", body: JSON.stringify(formData) });
      }
      router.push("/forms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <Card>
        <CardTitle>Form Settings</CardTitle>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Form Name" value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Contact Form" />
            <Input label="Slug" value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="contact-form" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Submit Button Text"
              value={formData.settings.submitLabel || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, settings: { ...prev.settings, submitLabel: e.target.value } }))}
              placeholder="Submit" />
            <Input label="Success Message"
              value={formData.settings.successMessage || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, settings: { ...prev.settings, successMessage: e.target.value } }))}
              placeholder="Thank you!" />
            <Input label="Notification Email"
              value={formData.settings.notifyEmail || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, settings: { ...prev.settings, notifyEmail: e.target.value } }))}
              placeholder="admin@example.com" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Fields ({formData.fields.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={openAddField}>Add Field</Button>
        </div>

        {formData.fields.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No fields yet. Add your first field.</p>
        ) : (
          <div className="space-y-2">
            {formData.fields.map((field, idx) => (
              <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveField(idx, "up")} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
                    <button onClick={() => moveField(idx, "down")} disabled={idx === formData.fields.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                      {field.options ? ` (${field.options.length} options)` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditField(idx)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => removeField(idx)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/forms")}>Cancel</Button>
        <Button disabled={saving} onClick={handleSubmit}>
          {saving ? "Saving..." : mode === "create" ? "Create Form" : "Save Changes"}
        </Button>
      </div>

      {/* Field Editor Modal */}
      <Modal open={fieldOpen} onClose={() => setFieldOpen(false)}
        title={editingFieldIdx !== null ? "Edit Field" : "Add Field"} size="md">
        <div className="space-y-4">
          <Input label="Label" value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} placeholder="Field label" />
          <Select label="Type" value={fieldType}
            onChange={(e) => setFieldType(e.target.value as FormField["type"])}
            options={FIELD_TYPES} />
          <Input label="Placeholder" value={fieldPlaceholder}
            onChange={(e) => setFieldPlaceholder(e.target.value)} placeholder="Placeholder text..." />
          {["select", "radio"].includes(fieldType) && (
            <Input label="Options (comma-separated)" value={fieldOptions}
              onChange={(e) => setFieldOptions(e.target.value)}
              placeholder="Option 1, Option 2, Option 3" />
          )}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={fieldRequired}
              onChange={(e) => setFieldRequired(e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">Required field</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setFieldOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveField}>
              {editingFieldIdx !== null ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
