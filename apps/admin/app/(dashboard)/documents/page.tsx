"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Card, Badge, Input, Select, Modal } from "@angulacms/ui";
import { MultilingualInput } from "@/components/pages/multilingual-input";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface DocumentItem {
  id: string;
  title: Record<string, string>;
  description: Record<string, string> | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  categoryId: string | null;
  language: string | null;
  isPublic: boolean;
  downloads: number;
  createdAt: string;
  category: { id: string; name: Record<string, string>; slug: string } | null;
}

interface Category {
  id: string;
  name: Record<string, string>;
  slug: string;
  _count: { documents: number };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState<Record<string, string>>({ en: "", pt: "" });
  const [uploadDesc, setUploadDesc] = useState<Record<string, string>>({ en: "", pt: "" });
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadPublic, setUploadPublic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category modal
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState<Record<string, string>>({ en: "", pt: "" });

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        pageSize: "20",
      };
      if (filterCategory) params.categoryId = filterCategory;
      if (search) params.search = search;

      const res = await apiFetch<{ data: DocumentItem[]; total: number }>(
        "/documents",
        { params }
      );
      setDocuments(res.data);
      setTotal(res.total);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [page, filterCategory, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiFetch<Category[]>("/documents/categories");
      setCategories(res);
    } catch {
      // handled
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !uploadTitle.en) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("titleEn", uploadTitle.en);
      formData.append("titlePt", uploadTitle.pt || "");
      formData.append("descriptionEn", uploadDesc.en || "");
      formData.append("descriptionPt", uploadDesc.pt || "");
      if (uploadCategory) formData.append("categoryId", uploadCategory);
      formData.append("isPublic", String(uploadPublic));

      const token = getToken();
      await fetch("/api/documents", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setUploadOpen(false);
      setUploadTitle({ en: "", pt: "" });
      setUploadDesc({ en: "", pt: "" });
      setUploadCategory("");
      fetchDocuments();
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateCategory() {
    if (!newCategoryName.en) return;
    try {
      await apiFetch("/documents/categories", {
        method: "POST",
        body: JSON.stringify({ name: newCategoryName }),
      });
      setCategoryOpen(false);
      setNewCategoryName({ en: "", pt: "" });
      fetchCategories();
    } catch {
      alert("Failed to create category");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await apiFetch(`/documents/${id}`, { method: "DELETE" });
      fetchDocuments();
    } catch {
      // handled
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoryOpen(true)}>
            Manage Categories
          </Button>
          <Button onClick={() => setUploadOpen(true)}>Upload Document</Button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All Categories" },
            ...categories.map((c) => ({
              value: c.id,
              label: `${c.name.en} (${c._count.documents})`,
            })),
          ]}
        />
      </div>

      <Card padding={false}>
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No documents yet. Upload your first document.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {doc.title.en || doc.fileName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {doc.fileName}
                  </td>
                  <td className="px-4 py-3">
                    {doc.category ? (
                      <Badge variant="info">{doc.category.name.en}</Badge>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatFileSize(doc.fileSize)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {doc.downloads}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={doc.isPublic ? "success" : "default"}>
                      {doc.isPublic ? "Public" : "Private"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Download
                    </a>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > 20 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">{total} documents total</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Upload Document Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input ref={fileInputRef} type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
          </div>
          <MultilingualInput label="Title" value={uploadTitle} onChange={setUploadTitle} />
          <MultilingualInput label="Description" value={uploadDesc} onChange={setUploadDesc} multiline />
          <Select
            label="Category"
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            options={[
              { value: "", label: "No Category" },
              ...categories.map((c) => ({ value: c.id, label: c.name.en })),
            ]}
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={uploadPublic} onChange={(e) => setUploadPublic(e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">Publicly visible</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button disabled={uploading} onClick={handleUpload}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal open={categoryOpen} onClose={() => setCategoryOpen(false)} title="Manage Categories" size="md">
        <div className="space-y-4">
          {categories.length > 0 && (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{cat.name.en}{cat.name.pt ? ` / ${cat.name.pt}` : ""}</span>
                  <Badge>{cat._count.documents} docs</Badge>
                </div>
              ))}
            </div>
          )}
          <hr />
          <MultilingualInput label="New Category" value={newCategoryName} onChange={setNewCategoryName} />
          <div className="flex justify-end">
            <Button onClick={handleCreateCategory}>Add Category</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
