"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardTitle, Badge, Modal } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface Revision {
  id: string;
  title: Record<string, string>;
  content: Record<string, string>;
  createdAt: string;
  user: { id: string; name: string };
}

interface RevisionHistoryProps {
  pageId: string;
  onRestore?: () => void;
}

export function RevisionHistory({ pageId, onRestore }: RevisionHistoryProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewRevision, setPreviewRevision] = useState<Revision | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    apiFetch<Revision[]>(`/pages/${pageId}/revisions`)
      .then(setRevisions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pageId]);

  async function handleRestore(revisionId: string) {
    if (!confirm("Restore this revision? The current content will be saved as a new revision.")) return;

    setRestoring(true);
    try {
      await apiFetch(`/pages/${pageId}/revisions/${revisionId}/restore`, {
        method: "POST",
      });
      setPreviewRevision(null);
      onRestore?.();
      // Refresh revisions
      const updated = await apiFetch<Revision[]>(`/pages/${pageId}/revisions`);
      setRevisions(updated);
    } catch {
      alert("Failed to restore revision");
    } finally {
      setRestoring(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading revisions...</p>;
  }

  if (revisions.length === 0) {
    return (
      <p className="text-sm text-gray-500">No revisions yet. Revisions are created automatically when you edit a page.</p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {revisions.map((rev) => (
          <div
            key={rev.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(rev.createdAt).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">by {rev.user.name}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewRevision(rev)}
              >
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestore(rev.id)}
              >
                Restore
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      <Modal
        open={!!previewRevision}
        onClose={() => setPreviewRevision(null)}
        title="Revision Preview"
        size="xl"
      >
        {previewRevision && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {new Date(previewRevision.createdAt).toLocaleString()} by {previewRevision.user.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(previewRevision.title).map(([lang, text]) => (
                <div key={lang}>
                  <Badge variant="info">{lang.toUpperCase()}</Badge>
                  <h3 className="text-lg font-semibold mt-1">{text}</h3>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Content (EN)</p>
              <div
                className="prose prose-sm max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50"
                dangerouslySetInnerHTML={{
                  __html: previewRevision.content.en || "",
                }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPreviewRevision(null)}>
                Close
              </Button>
              <Button
                disabled={restoring}
                onClick={() => handleRestore(previewRevision.id)}
              >
                {restoring ? "Restoring..." : "Restore This Version"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
