import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/db";
import {
  type Locale,
  SUPPORTED_LOCALES,
  getLocalizedField,
  formatDate,
} from "@/lib/i18n";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const page = await getPageBySlug(slug);

  if (!page) return {};

  const title = getLocalizedField(page.title as Record<string, string>, locale);
  const description = page.excerpt
    ? getLocalizedField(page.excerpt as Record<string, string>, locale)
    : undefined;

  const seo = page.seo as Record<string, Record<string, string>> | null;
  const seoData = seo?.[locale] || seo?.en;

  return {
    title: seoData?.title || title,
    description: seoData?.description || description,
    openGraph: {
      title: seoData?.title || title,
      description: seoData?.description || description,
      images: seoData?.ogImage ? [seoData.ogImage] : page.featuredImage ? [page.featuredImage] : [],
    },
  };
}

export default async function DynamicPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;

  // Don't match known routes
  if (["news", "events", "documents", "search"].includes(slug)) {
    notFound();
  }

  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const title = getLocalizedField(page.title as Record<string, string>, locale);
  const content = getLocalizedField(page.content as Record<string, string>, locale);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {page.featuredImage && (
        <img
          src={page.featuredImage}
          alt={title}
          className="w-full h-64 sm:h-80 object-cover rounded-xl mb-8"
        />
      )}

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        {page.author && <span>{page.author.name}</span>}
        <span>{formatDate(page.updatedAt, locale)}</span>
      </div>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
