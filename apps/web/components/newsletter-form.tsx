"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

export function NewsletterForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setEmail("");
      setName("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-green-800 font-medium">{t("newsletter.success", locale)}</p>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 rounded-xl p-6 sm:p-8">
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        {t("newsletter.title", locale)}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {t("newsletter.description", locale)}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder={locale === "pt" ? "Nome (opcional)" : "Name (optional)"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <input
          type="email"
          required
          placeholder={t("newsletter.email", locale)}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {status === "loading" ? "..." : t("newsletter.subscribe", locale)}
        </button>
      </form>
      {status === "error" && (
        <p className="text-red-600 text-sm mt-2">{t("newsletter.error", locale)}</p>
      )}
    </div>
  );
}
