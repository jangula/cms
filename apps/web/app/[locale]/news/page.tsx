import { getPublishedArticles, getTags } from "@/lib/db";
import {
  type Locale,
  SUPPORTED_LOCALES,
  getLocalizedField,
  formatDate,
  t,
} from "@/lib/i18n";
import { Pagination } from "@/components/pagination";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const tag = sp.tag || undefined;

  const [result, tags] = await Promise.all([
    getPublishedArticles({ page, pageSize: 9, tag }),
    getTags(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t("news.title", locale)}
      </h1>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href={`/${locale}/news`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !tag
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t("common.all", locale)}
          </a>
          {tags.map((t_) => (
            <a
              key={t_.id}
              href={`/${locale}/news?tag=${t_.slug}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tag === t_.slug
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {getLocalizedField(t_.name as Record<string, string>, locale)}{" "}
              <span className="text-xs opacity-70">({t_._count.articles})</span>
            </a>
          ))}
        </div>
      )}

      {result.articles.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          {t("common.noResults", locale)}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.articles.map((article) => (
              <a
                key={article.id}
                href={`/${locale}/news/${article.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                {article.featuredImage && (
                  <img
                    src={article.featuredImage}
                    alt=""
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs text-gray-500">
                      {article.publishedAt && formatDate(article.publishedAt, locale)}
                    </p>
                    {article.tags.length > 0 && (
                      <>
                        <span className="text-gray-300">&middot;</span>
                        <p className="text-xs text-primary-600">
                          {getLocalizedField(
                            article.tags[0].tag.name as Record<string, string>,
                            locale
                          )}
                        </p>
                      </>
                    )}
                  </div>
                  <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {getLocalizedField(article.title as Record<string, string>, locale)}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {getLocalizedField(article.excerpt as Record<string, string>, locale)}
                    </p>
                  )}
                  <p className="text-sm font-medium text-primary-600 mt-3">
                    {t("common.readMore", locale)} &rarr;
                  </p>
                </div>
              </a>
            ))}
          </div>

          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            baseUrl={`/${locale}/news${tag ? `?tag=${tag}` : ""}`}
            locale={locale}
          />
        </>
      )}
    </div>
  );
}
