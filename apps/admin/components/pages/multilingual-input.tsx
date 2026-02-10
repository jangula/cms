"use client";

import { Input } from "@angulacms/ui";
import { Textarea } from "@angulacms/ui";

interface MultilingualInputProps {
  label: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  languages?: string[];
  multiline?: boolean;
  placeholder?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  pt: "Portuguese",
};

export function MultilingualInput({
  label,
  value,
  onChange,
  languages = ["en", "pt"],
  multiline = false,
  placeholder,
}: MultilingualInputProps) {
  const Component = multiline ? Textarea : Input;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map((lang) => (
          <Component
            key={lang}
            label={LANGUAGE_LABELS[lang] || lang.toUpperCase()}
            value={value[lang] || ""}
            onChange={(e) =>
              onChange({ ...value, [lang]: e.target.value })
            }
            placeholder={`${placeholder || label} (${LANGUAGE_LABELS[lang] || lang})`}
          />
        ))}
      </div>
    </div>
  );
}
