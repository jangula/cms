"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Card, CardTitle } from "@angulacms/ui";
import { MultilingualInput } from "./multilingual-input";
import { TipTapEditor } from "../editor/tiptap-editor";
import { MediaPicker } from "../media/media-picker";
import { apiFetch } from "@/lib/api";
import { generateSlug } from "@angulacms/core/utils";

interface SeoData {
  title: string;
  description: string;
  ogImage: string;
}

interface PageData {
  id?: string;
  slug: string;
  template: string;
  title: Record<string, string>;
  content: Record<string, string>;
  excerpt: Record<string, string>;
  featuredImage: string;
  status: string;
  publishedAt: string;
  seo: Record<string, SeoData>;
}

interface PageFormProps {
  initialData?: PageData;
  mode: "create" | "edit";
}

const LANGUAGES = ["en", "pt"];

function toDateInputValue(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

export function PageForm({ initialData, mode }: PageFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeLocale, setActiveLocale] = useState("en");
  const [seoLocale, setSeoLocale] = useState("en");

  const [formData, setFormData] = useState<PageData>({
    slug: initialData?.slug || "",
    template: initialData?.template || "default",
    title: initialData?.title || { en: "", pt: "" },
    content: initialData?.content || { en: "", pt: "" },
    excerpt: initialData?.excerpt || { en: "", pt: "" },
    featuredImage: initialData?.featuredImage || "",
    status: initialData?.status || "DRAFT",
    publishedAt: toDateInputValue(initialData?.publishedAt),
    seo: initialData?.seo || {
      en: { title: "", description: "", ogImage: "" },
      pt: { title: "", description: "", ogImage: "" },
    },
  });

  // Auto-generate slug from English title
  useEffect(() => {
    if (mode === "create" && formData.title.en && !initialData?.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.title.en),
      }));
    }
  }, [formData.title.en, mode, initialData?.slug]);

  async function handleSubmit(status?: string) {
    setSaving(true);
    setError("");

    const data = {
      ...formData,
      status: status || formData.status,
      publishedAt: formData.publishedAt || undefined,
    };

    try {
      if (mode === "create") {
        await apiFetch("/pages", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } else {
        await apiFetch(`/pages/${initialData?.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      }
      router.push("/pages");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save page");
    } finally {
      setSaving(false);
    }
  }

  const currentSeo = formData.seo[seoLocale] || {
    title: "",
    description: "",
    ogImage: "",
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <CardTitle>Page Details</CardTitle>
        <div className="space-y-4 mt-4">
          <MultilingualInput
            label="Title"
            value={formData.title}
            onChange={(title) => setFormData((prev) => ({ ...prev, title }))}
            languages={LANGUAGES}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="page-url-slug"
            />
            <Select
              label="Template"
              value={formData.template}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, template: e.target.value }))
              }
              options={[
                { value: "default", label: "Default" },
                { value: "full-width", label: "Full Width" },
                { value: "sidebar", label: "With Sidebar" },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Content</CardTitle>
          <div className="flex gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLocale(lang)}
                className={`px-3 py-1 text-sm rounded-lg ${
                  activeLocale === lang
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <TipTapEditor
          content={formData.content[activeLocale] || ""}
          onChange={(html) =>
            setFormData((prev) => ({
              ...prev,
              content: { ...prev.content, [activeLocale]: html },
            }))
          }
          placeholder={`Write content in ${activeLocale === "en" ? "English" : "Portuguese"}...`}
        />
      </Card>

      <Card>
        <CardTitle>Excerpt</CardTitle>
        <div className="mt-4">
          <MultilingualInput
            label="Short Description"
            value={formData.excerpt}
            onChange={(excerpt) =>
              setFormData((prev) => ({ ...prev, excerpt }))
            }
            languages={LANGUAGES}
            multiline
          />
        </div>
      </Card>

      <Card>
        <CardTitle>Featured Image</CardTitle>
        <div className="mt-4">
          <MediaPicker
            value={formData.featuredImage}
            onChange={(url) =>
              setFormData((prev) => ({ ...prev, featuredImage: url }))
            }
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>SEO</CardTitle>
          <div className="flex gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSeoLocale(lang)}
                className={`px-3 py-1 text-sm rounded-lg ${
                  seoLocale === lang
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Meta Title"
            value={currentSeo.title}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                seo: {
                  ...prev.seo,
                  [seoLocale]: { ...currentSeo, title: e.target.value },
                },
              }))
            }
            placeholder="Page title for search engines"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={currentSeo.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: {
                    ...prev.seo,
                    [seoLocale]: {
                      ...currentSeo,
                      description: e.target.value,
                    },
                  },
                }))
              }
              placeholder="Brief description for search results"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {currentSeo.description.length}/160 characters
            </p>
          </div>
          <Input
            label="OG Image URL"
            value={currentSeo.ogImage}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                seo: {
                  ...prev.seo,
                  [seoLocale]: { ...currentSeo, ogImage: e.target.value },
                },
              }))
            }
            placeholder="Social media share image URL"
          />
        </div>
      </Card>

      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <Select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
            options={[
              { value: "DRAFT", label: "Draft" },
              { value: "PUBLISHED", label: "Published" },
              { value: "SCHEDULED", label: "Scheduled" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
          />
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">
              Publish Date
            </label>
            <input
              type="datetime-local"
              value={formData.publishedAt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  publishedAt: e.target.value,
                }))
              }
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/pages")}>
            Cancel
          </Button>
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => handleSubmit("DRAFT")}
          >
            Save Draft
          </Button>
          <Button disabled={saving} onClick={() => handleSubmit("PUBLISHED")}>
            {saving ? "Saving..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
