"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Card, CardTitle, Badge, Modal } from "@angulacms/ui";
import { MultilingualInput } from "@/components/pages/multilingual-input";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { MediaPicker } from "@/components/media/media-picker";
import { apiFetch } from "@/lib/api";
import { generateSlug } from "@angulacms/core/utils";

interface ArticleData {
  id?: string;
  slug: string;
  title: Record<string, string>;
  content: Record<string, string>;
  excerpt: Record<string, string>;
  featuredImage: string;
  status: string;
  tags: { tag: { id: string; name: Record<string, string> } }[];
}

interface Tag {
  id: string;
  name: Record<string, string>;
  slug: string;
  _count: { articles: number };
}

interface ArticleFormProps {
  initialData?: ArticleData;
  mode: "create" | "edit";
}

const LANGUAGES = ["en", "pt"];

export function ArticleForm({ initialData, mode }: ArticleFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeLocale, setActiveLocale] = useState("en");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((t) => t.tag.id) || []
  );
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState<Record<string, string>>({ en: "", pt: "" });

  const [formData, setFormData] = useState({
    slug: initialData?.slug || "",
    title: initialData?.title || { en: "", pt: "" },
    content: initialData?.content || { en: "", pt: "" },
    excerpt: initialData?.excerpt || { en: "", pt: "" },
    featuredImage: initialData?.featuredImage || "",
    status: initialData?.status || "DRAFT",
  });

  useEffect(() => {
    apiFetch<Tag[]>("/news/tags").then(setAllTags).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode === "create" && formData.title.en) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title.en) }));
    }
  }, [formData.title.en, mode]);

  async function handleCreateTag() {
    if (!newTagName.en) return;
    try {
      const tag = await apiFetch<Tag>("/news/tags", {
        method: "POST",
        body: JSON.stringify({ name: newTagName }),
      });
      setAllTags((prev) => [...prev, { ...tag, _count: { articles: 0 } }]);
      setSelectedTagIds((prev) => [...prev, tag.id]);
      setTagModalOpen(false);
      setNewTagName({ en: "", pt: "" });
    } catch {
      // handled
    }
  }

  async function handleSubmit(status?: string) {
    setSaving(true);
    setError("");

    const data = {
      ...formData,
      status: status || formData.status,
      tags: selectedTagIds,
    };

    try {
      if (mode === "create") {
        await apiFetch("/news", { method: "POST", body: JSON.stringify(data) });
      } else {
        await apiFetch(`/news/${initialData?.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      }
      router.push("/news");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setSaving(false);
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <Card>
        <CardTitle>Article Details</CardTitle>
        <div className="space-y-4 mt-4">
          <MultilingualInput label="Title" value={formData.title} onChange={(title) => setFormData((prev) => ({ ...prev, title }))} languages={LANGUAGES} />
          <Input label="Slug" value={formData.slug} onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))} placeholder="article-url-slug" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Content</CardTitle>
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
          content={formData.content[activeLocale] || ""}
          onChange={(html) => setFormData((prev) => ({ ...prev, content: { ...prev.content, [activeLocale]: html } }))}
          placeholder={`Write article in ${activeLocale === "en" ? "English" : "Portuguese"}...`}
        />
      </Card>

      <Card>
        <CardTitle>Excerpt</CardTitle>
        <div className="mt-4">
          <MultilingualInput label="Short Description" value={formData.excerpt} onChange={(excerpt) => setFormData((prev) => ({ ...prev, excerpt }))} languages={LANGUAGES} multiline />
        </div>
      </Card>

      <Card>
        <CardTitle>Featured Image</CardTitle>
        <div className="mt-4">
          <MediaPicker value={formData.featuredImage} onChange={(url) => setFormData((prev) => ({ ...prev, featuredImage: url }))} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Tags</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setTagModalOpen(true)}>New Tag</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-primary-400"
              }`}>
              {tag.name.en}
            </button>
          ))}
          {allTags.length === 0 && (
            <p className="text-sm text-gray-500">No tags yet. Create one to get started.</p>
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
          <Button variant="outline" onClick={() => router.push("/news")}>Cancel</Button>
          <Button variant="outline" disabled={saving} onClick={() => handleSubmit("DRAFT")}>Save Draft</Button>
          <Button disabled={saving} onClick={() => handleSubmit("PUBLISHED")}>
            {saving ? "Saving..." : "Publish"}
          </Button>
        </div>
      </div>

      <Modal open={tagModalOpen} onClose={() => setTagModalOpen(false)} title="Create Tag" size="sm">
        <div className="space-y-4">
          <MultilingualInput label="Tag Name" value={newTagName} onChange={setNewTagName} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setTagModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTag}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
