import { getPublicDocuments, getDocumentCategories } from "@/lib/db";
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
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string): string {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("word") || mimeType.includes("document")) return "DOC";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "XLS";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "PPT";
  if (mimeType.includes("image")) return "IMG";
  return "FILE";
}

export default async function DocumentsPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const category = sp.category || undefined;
  const search = sp.q || undefined;

  const [result, categories] = await Promise.all([
    getPublicDocuments({ page, pageSize: 20, category, search }),
    getDocumentCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t("documents.title", locale)}
      </h1>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form className="flex-1" action={`/${locale}/documents`}>
          {category && <input type="hidden" name="category" value={category} />}
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder={t("search.placeholder", locale)}
              className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href={`/${locale}/documents${search ? `?q=${search}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !category
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t("documents.allCategories", locale)}
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/${locale}/documents?category=${cat.slug}${search ? `&q=${search}` : ""}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat.slug
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {getLocalizedField(cat.name as Record<string, string>, locale)}{" "}
              <span className="text-xs opacity-70">({cat._count.documents})</span>
            </a>
          ))}
        </div>
      )}

      {result.documents.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          {t("common.noResults", locale)}
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {result.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* File type badge */}
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    {getFileIcon(doc.mimeType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {getLocalizedField(doc.title as Record<string, string>, locale)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>{formatDate(doc.createdAt, locale)}</span>
                      {doc.category && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                          {getLocalizedField(doc.category.name as Record<string, string>, locale)}
                        </span>
                      )}
                      <span>{doc.downloads} {t("documents.downloads", locale)}</span>
                    </div>
                  </div>

                  <a
                    href={doc.fileUrl}
                    download
                    className="flex-shrink-0 inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t("common.download", locale)}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            baseUrl={`/${locale}/documents${category ? `?category=${category}` : ""}${search ? `${category ? "&" : "?"}q=${search}` : ""}`}
            locale={locale}
          />
        </>
      )}
    </div>
  );
}
