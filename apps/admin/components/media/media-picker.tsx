"use client";

import { useState, useEffect } from "react";
import { Button, Modal } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

interface MediaPickerProps {
  value?: string;
  onChange: (url: string) => void;
}

export function MediaPicker({ value, onChange }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      apiFetch<{ data: MediaItem[] }>("/media?pageSize=50&type=image")
        .then((res) => setMedia(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <div>
      <div className="flex items-center gap-3">
        {value && (
          <img
            src={value}
            alt="Selected"
            className="w-20 h-20 object-cover rounded-lg border"
          />
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {value ? "Change Image" : "Select Image"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
          >
            Remove
          </Button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Media Library" size="xl">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : media.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No images found. Upload some media first.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {media.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange(item.url);
                  setOpen(false);
                }}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500 transition-colors"
              >
                <img
                  src={item.url}
                  alt={item.filename}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
