import { searchContent } from "@/lib/db";
import {
  type Locale,
  SUPPORTED_LOCALES,
  getLocalizedField,
  formatDate,
  t,
} from "@/lib/i18n";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const sp = await searchParams;
  const query = sp.q || "";

  const results = query ? await searchContent(query, locale) : null;
  const totalResults = results
    ? results.pages.length + results.articles.length + results.documents.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t("search.title", locale)}
      </h1>

      {/* Search form */}
      <form action={`/${locale}/search`} className="mb-8">
        <div className="relative">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={t("search.placeholder", locale)}
            autoFocus
            className="w-full px-5 py-3 pl-12 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>

      {/* Results */}
      {query && results && (
        <div>
          <p className="text-sm text-gray-500 mb-6">
            {totalResults} {t("search.results", locale)} &ldquo;{query}&rdquo;
          </p>

          {/* Pages */}
          {results.pages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("search.pages", locale)}
              </h2>
              <div className="space-y-3">
                {results.pages.map((page) => {
                  const excerpt = page.excerpt as Record<string, string> | null;
                  return (
                    <a
                      key={page.slug}
                      href={`/${locale}/${page.slug}`}
                      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-primary-300 transition-colors"
                    >
                      <h3 className="font-medium text-primary-700">
                        {getLocalizedField(page.title as Record<string, string>, locale)}
                      </h3>
                      {excerpt && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {getLocalizedField(excerpt, locale)}
                        </p>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Articles */}
          {results.articles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("search.articles", locale)}
              </h2>
              <div className="space-y-3">
                {results.articles.map((article) => {
                  const excerpt = article.excerpt as Record<string, string> | null;
                  return (
                    <a
                      key={article.slug}
                      href={`/${locale}/news/${article.slug}`}
                      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-primary-300 transition-colors"
                    >
                      <h3 className="font-medium text-primary-700">
                        {getLocalizedField(article.title as Record<string, string>, locale)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {article.publishedAt && (
                          <span className="text-xs text-gray-500">
                            {formatDate(article.publishedAt, locale)}
                          </span>
                        )}
                      </div>
                      {excerpt && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {getLocalizedField(excerpt, locale)}
                        </p>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("documents.title", locale)}
              </h2>
              <div className="space-y-3">
                {results.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getLocalizedField(doc.title as Record<string, string>, locale)}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{doc.fileName}</p>
                      </div>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                      >
                        {t("common.download", locale)}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <p className="text-gray-500 text-center py-8">
              {t("common.noResults", locale)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
