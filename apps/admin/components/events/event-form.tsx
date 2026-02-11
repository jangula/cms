"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Card, CardTitle } from "@angulacms/ui";
import { MultilingualInput } from "@/components/pages/multilingual-input";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { MediaPicker } from "@/components/media/media-picker";
import { apiFetch } from "@/lib/api";
import { generateSlug } from "@angulacms/core/utils";

interface EventData {
  id?: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  location: Record<string, string> | null;
  startDate: string;
  endDate: string;
  featuredImage: string;
  registrationEnabled: boolean;
  registrationUrl: string;
  status: string;
}

interface EventFormProps {
  initialData?: EventData;
  mode: "create" | "edit";
}

const LANGUAGES = ["en", "pt"];

function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().slice(0, 16);
}

export function EventForm({ initialData, mode }: EventFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeLocale, setActiveLocale] = useState("en");

  const [formData, setFormData] = useState({
    slug: initialData?.slug || "",
    title: initialData?.title || { en: "", pt: "" },
    description: initialData?.description || { en: "", pt: "" },
    location: initialData?.location || { en: "", pt: "" },
    startDate: initialData?.startDate ? toDatetimeLocal(initialData.startDate) : "",
    endDate: initialData?.endDate ? toDatetimeLocal(initialData.endDate) : "",
    featuredImage: initialData?.featuredImage || "",
    registrationEnabled: initialData?.registrationEnabled || false,
    registrationUrl: initialData?.registrationUrl || "",
    status: initialData?.status || "DRAFT",
  });

  useEffect(() => {
    if (mode === "create" && formData.title.en) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title.en) }));
    }
  }, [formData.title.en, mode]);

  async function handleSubmit(status?: string) {
    setSaving(true);
    setError("");

    const data = {
      ...formData,
      status: status || formData.status,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };

    try {
      if (mode === "create") {
        await apiFetch("/events", { method: "POST", body: JSON.stringify(data) });
      } else {
        await apiFetch(`/events/${initialData?.id}`, { method: "PUT", body: JSON.stringify(data) });
      }
      router.push("/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
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
        <CardTitle>Event Details</CardTitle>
        <div className="space-y-4 mt-4">
          <MultilingualInput label="Title" value={formData.title} onChange={(title) => setFormData((prev) => ({ ...prev, title }))} languages={LANGUAGES} />
          <Input label="Slug" value={formData.slug} onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))} />
          <MultilingualInput label="Location" value={formData.location} onChange={(location) => setFormData((prev) => ({ ...prev, location }))} languages={LANGUAGES} />
        </div>
      </Card>

      <Card>
        <CardTitle>Date & Time</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input label="Start Date & Time" type="datetime-local" value={formData.startDate} onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))} />
          <Input label="End Date & Time" type="datetime-local" value={formData.endDate} onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Description</CardTitle>
          <div className="flex gap-2">
            {LANGUAGES.map((lang) => (
              <button key={lang} type="button" onClick={() => setActiveLocale(lang)}
                className={`px-3 py-1 text-sm rounded-lg ${activeLocale === lang ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <TipTapEditor
          content={formData.description[activeLocale] || ""}
          onChange={(html) => setFormData((prev) => ({ ...prev, description: { ...prev.description, [activeLocale]: html } }))}
          placeholder={`Describe the event in ${activeLocale === "en" ? "English" : "Portuguese"}...`}
        />
      </Card>

      <Card>
        <CardTitle>Featured Image</CardTitle>
        <div className="mt-4">
          <MediaPicker value={formData.featuredImage} onChange={(url) => setFormData((prev) => ({ ...prev, featuredImage: url }))} />
        </div>
      </Card>

      <Card>
        <CardTitle>Registration</CardTitle>
        <div className="space-y-4 mt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.registrationEnabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, registrationEnabled: e.target.checked }))}
              className="rounded" />
            <span className="text-sm text-gray-700">Enable registration</span>
          </label>
          {formData.registrationEnabled && (
            <Input label="Registration URL" value={formData.registrationUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, registrationUrl: e.target.value }))}
              placeholder="https://..." />
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <Select value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
          options={[
            { value: "DRAFT", label: "Draft" },
            { value: "PUBLISHED", label: "Published" },
            { value: "ARCHIVED", label: "Archived" },
          ]}
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/events")}>Cancel</Button>
          <Button variant="outline" disabled={saving} onClick={() => handleSubmit("DRAFT")}>Save Draft</Button>
          <Button disabled={saving} onClick={() => handleSubmit("PUBLISHED")}>
            {saving ? "Saving..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
