"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { clsx } from "clsx";
import { Modal } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

function MenuBar({
  editor,
  onImageClick,
}: {
  editor: ReturnType<typeof useEditor>;
  onImageClick: () => void;
}) {
  if (!editor) return null;

  const buttons = [
    {
      label: "B",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      className: "font-bold",
    },
    {
      label: "I",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      className: "italic",
    },
    {
      label: "H1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "H2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "H3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      label: "UL",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "OL",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "Quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "Link",
      action: () => {
        const url = window.prompt("Enter URL:");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      active: editor.isActive("link"),
    },
    {
      label: "Image",
      action: onImageClick,
      active: false,
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.action}
          className={clsx(
            "px-2 py-1 text-xs rounded transition-colors",
            btn.active
              ? "bg-primary-100 text-primary-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
}: TipTapEditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (showMediaPicker) {
      setLoadingMedia(true);
      apiFetch<{ data: MediaItem[] }>("/media?pageSize=50&type=image")
        .then((res) => setMedia(res.data))
        .catch(() => {})
        .finally(() => setLoadingMedia(false));
    }
  }, [showMediaPicker]);

  const handleImageSelect = useCallback(
    (url: string) => {
      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
      setShowMediaPicker(false);
    },
    [editor]
  );

  return (
    <div
      className={clsx(
        "border border-gray-300 rounded-lg overflow-hidden",
        className
      )}
    >
      <MenuBar
        editor={editor}
        onImageClick={() => setShowMediaPicker(true)}
      />
      <div className="p-4">
        <EditorContent editor={editor} className="tiptap" />
      </div>

      <Modal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        title="Insert Image"
        size="xl"
      >
        {loadingMedia ? (
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
                onClick={() => handleImageSelect(item.url)}
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
