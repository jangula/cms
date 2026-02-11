"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardTitle, Input } from "@angulacms/ui";
import { apiFetch } from "@/lib/api";

interface SiteData {
  id: string;
  name: string;
  domain: string | null;
  languages: string[];
  defaultLang: string;
  logo: string | null;
  favicon: string | null;
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  } | null;
  settings: {
    socialFacebook?: string;
    socialTwitter?: string;
    socialLinkedin?: string;
    socialYoutube?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoOgImage?: string;
    robotsTxt?: string;
  } | null;
}

const AVAILABLE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pt", label: "Portuguese" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
];

export default function SettingsPage() {
  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "theme" | "social" | "seo">("general");

  // Form state
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [languages, setLanguages] = useState<string[]>(["en"]);
  const [defaultLang, setDefaultLang] = useState("en");
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#0d9488");
  const [fontFamily, setFontFamily] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoOgImage, setSeoOgImage] = useState("");
  const [robotsTxt, setRobotsTxt] = useState("User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml");

  useEffect(() => {
    apiFetch<SiteData>("/settings")
      .then((data) => {
        setSite(data);
        setName(data.name);
        setDomain(data.domain || "");
        setLanguages(data.languages);
        setDefaultLang(data.defaultLang);
        setLogo(data.logo || "");
        setFavicon(data.favicon || "");
        setPrimaryColor(data.theme?.primaryColor || "#2563eb");
        setSecondaryColor(data.theme?.secondaryColor || "#0d9488");
        setFontFamily(data.theme?.fontFamily || "");
        setSocialFacebook(data.settings?.socialFacebook || "");
        setSocialTwitter(data.settings?.socialTwitter || "");
        setSocialLinkedin(data.settings?.socialLinkedin || "");
        setSocialYoutube(data.settings?.socialYoutube || "");
        setSeoTitle(data.settings?.seoTitle || "");
        setSeoDescription(data.settings?.seoDescription || "");
        setSeoOgImage(data.settings?.seoOgImage || "");
        setRobotsTxt(data.settings?.robotsTxt || "User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await apiFetch("/settings", {
        method: "PUT",
        body: JSON.stringify({
          name,
          domain: domain || null,
          languages,
          defaultLang,
          logo: logo || null,
          favicon: favicon || null,
          theme: { primaryColor, secondaryColor, fontFamily: fontFamily || undefined },
          settings: {
            socialFacebook: socialFacebook || undefined,
            socialTwitter: socialTwitter || undefined,
            socialLinkedin: socialLinkedin || undefined,
            socialYoutube: socialYoutube || undefined,
            seoTitle: seoTitle || undefined,
            seoDescription: seoDescription || undefined,
            seoOgImage: seoOgImage || undefined,
            robotsTxt,
          },
        }),
      });
      alert("Settings saved successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function toggleLanguage(code: string) {
    setLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading settings...</p>;
  }

  const tabs = [
    { key: "general" as const, label: "General" },
    { key: "theme" as const, label: "Theme" },
    { key: "social" as const, label: "Social Media" },
    { key: "seo" as const, label: "SEO" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <Button disabled={saving} onClick={handleSave}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <Card>
          <CardTitle>General Settings</CardTitle>
          <div className="space-y-4 mt-4">
            <Input label="Site Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
            <Input label="Logo URL" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="/uploads/logo.png" />
            {logo && (
              <img src={logo} alt="Logo preview" className="h-12 object-contain" />
            )}
            <Input label="Favicon URL" value={favicon} onChange={(e) => setFavicon(e.target.value)} placeholder="/uploads/favicon.ico" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      languages.includes(lang.code)
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
              <select
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {languages.map((code) => (
                  <option key={code} value={code}>
                    {AVAILABLE_LANGUAGES.find((l) => l.code === code)?.label || code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Theme Settings */}
      {activeTab === "theme" && (
        <Card>
          <CardTitle>Theme Settings</CardTitle>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-32"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-32"
                />
              </div>
            </div>

            <Input
              label="Font Family"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              placeholder="Inter, sans-serif"
            />

            {/* Preview */}
            <div className="mt-4 p-4 border rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Preview</p>
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: primaryColor }}>
                  <span className="text-white text-xs p-1">Primary</span>
                </div>
                <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: secondaryColor }}>
                  <span className="text-white text-xs p-1">Secondary</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Social Media */}
      {activeTab === "social" && (
        <Card>
          <CardTitle>Social Media Links</CardTitle>
          <div className="space-y-4 mt-4">
            <Input label="Facebook URL" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/..." />
            <Input label="Twitter / X URL" value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} placeholder="https://x.com/..." />
            <Input label="LinkedIn URL" value={socialLinkedin} onChange={(e) => setSocialLinkedin(e.target.value)} placeholder="https://linkedin.com/company/..." />
            <Input label="YouTube URL" value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} placeholder="https://youtube.com/..." />
          </div>
        </Card>
      )}

      {/* SEO */}
      {activeTab === "seo" && (
        <Card>
          <CardTitle>SEO Settings</CardTitle>
          <div className="space-y-4 mt-4">
            <Input label="Default Meta Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="My Website - Tagline" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Meta Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                placeholder="A brief description of your website..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Input label="Default OG Image URL" value={seoOgImage} onChange={(e) => setSeoOgImage(e.target.value)} placeholder="/uploads/og-image.jpg" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">robots.txt</label>
              <textarea
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
