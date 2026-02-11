"use client";

import { useState } from "react";
import { getLocalizedField, t, type Locale } from "@/lib/i18n";

interface MenuItem {
  id: string;
  label: Record<string, string> | unknown;
  url: string | null;
  pageId: string | null;
  target: string;
  children: MenuItem[];
}

export function MobileMenu({
  locale,
  items,
  fallbackItems,
}: {
  locale: Locale;
  items: MenuItem[];
  fallbackItems: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-600 hover:text-gray-900"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {items.length > 0
              ? items.map((item) => {
                  const label = getLocalizedField(
                    item.label as Record<string, string>,
                    locale
                  );
                  const href = item.pageId
                    ? `/${locale}/${item.url || ""}`
                    : item.url || "#";

                  return (
                    <div key={item.id}>
                      <a
                        href={href}
                        target={item.target}
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-md hover:bg-gray-50"
                      >
                        {label}
                      </a>
                      {item.children.map((child) => (
                        <a
                          key={child.id}
                          href={
                            child.pageId
                              ? `/${locale}/${child.url || ""}`
                              : child.url || "#"
                          }
                          target={child.target}
                          onClick={() => setOpen(false)}
                          className="block pl-6 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 rounded-md hover:bg-gray-50"
                        >
                          {getLocalizedField(
                            child.label as Record<string, string>,
                            locale
                          )}
                        </a>
                      ))}
                    </div>
                  );
                })
              : fallbackItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-md hover:bg-gray-50"
                  >
                    {item.label}
                  </a>
                ))}
            <a
              href={`/${locale}/search`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-md hover:bg-gray-50"
            >
              {t("nav.search", locale)}
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
