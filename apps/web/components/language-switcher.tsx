"use client";

import { usePathname } from "next/navigation";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  function getLocalizedPath(targetLocale: string) {
    // Replace the locale segment in the path
    const segments = pathname.split("/");
    if (segments[1] && SUPPORTED_LOCALES.includes(segments[1] as Locale)) {
      segments[1] = targetLocale;
    }
    return segments.join("/");
  }

  return (
    <div className="flex gap-1">
      {SUPPORTED_LOCALES.map((loc) => (
        <a
          key={loc}
          href={getLocalizedPath(loc)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            locale === loc
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {loc.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
