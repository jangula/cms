import { t, type Locale } from "@/lib/i18n";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  baseUrl: string;
  locale: Locale;
}

export function Pagination({ page, pageSize, total, baseUrl, locale }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const separator = baseUrl.includes("?") ? "&" : "?";

  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-sm text-gray-500">
        {locale === "pt"
          ? `Página ${page} de ${totalPages}`
          : `Page ${page} of ${totalPages}`}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <a
            href={`${baseUrl}${separator}page=${page - 1}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("common.previous", locale)}
          </a>
        )}
        {page < totalPages && (
          <a
            href={`${baseUrl}${separator}page=${page + 1}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("common.next", locale)}
          </a>
        )}
      </div>
    </div>
  );
}
