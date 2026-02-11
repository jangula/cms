import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug } from "@/lib/db";
import {
  type Locale,
  SUPPORTED_LOCALES,
  getLocalizedField,
  formatDate,
  t,
} from "@/lib/i18n";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const article = await getArticleBySlug(slug);

  if (!article) return {};

  const title = getLocalizedField(article.title as Record<string, string>, locale);
  const description = article.excerpt
    ? getLocalizedField(article.excerpt as Record<string, string>, locale)
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;

  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const title = getLocalizedField(article.title as Record<string, string>, locale);
  const content = getLocalizedField(article.content as Record<string, string>, locale);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <a
        href={`/${locale}/news`}
        className="text-sm text-primary-600 hover:text-primary-700 mb-6 inline-block"
      >
        &larr; {t("common.backTo", locale)} {t("news.title", locale)}
      </a>

      {article.featuredImage && (
        <img
          src={article.featuredImage}
          alt={title}
          className="w-full h-64 sm:h-96 object-cover rounded-xl mb-8"
        />
      )}

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
        {article.author && (
          <span>
            {t("common.by", locale)} {article.author.name}
          </span>
        )}
        {article.publishedAt && (
          <span>{formatDate(article.publishedAt, locale)}</span>
        )}
        {article.tags.length > 0 && (
          <div className="flex gap-2">
            {article.tags.map((at) => (
              <a
                key={at.tag.id}
                href={`/${locale}/news?tag=${at.tag.slug}`}
                className="px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium hover:bg-primary-100 transition-colors"
              >
                {getLocalizedField(at.tag.name as Record<string, string>, locale)}
              </a>
            ))}
          </div>
        )}
      </div>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
