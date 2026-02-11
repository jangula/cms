import { getUpcomingEvents, getPastEvents } from "@/lib/db";
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
  searchParams: Promise<{ page?: string; view?: string }>;
}

export default async function EventsPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const view = sp.view === "past" ? "past" : "upcoming";

  const result =
    view === "past"
      ? await getPastEvents({ page, pageSize: 10 })
      : await getUpcomingEvents({ page, pageSize: 10 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t("events.title", locale)}
      </h1>

      {/* View toggle */}
      <div className="flex gap-2 mb-8">
        <a
          href={`/${locale}/events`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "upcoming"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("events.upcoming", locale)}
        </a>
        <a
          href={`/${locale}/events?view=past`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "past"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("events.past", locale)}
        </a>
      </div>

      {result.events.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          {t("common.noResults", locale)}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {result.events.map((event) => (
              <a
                key={event.id}
                href={`/${locale}/events/${event.slug}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-5"
              >
                <div className="flex items-start gap-5">
                  {/* Date badge */}
                  <div className="bg-primary-50 text-primary-700 rounded-lg px-4 py-3 text-center min-w-[70px] flex-shrink-0">
                    <p className="text-2xl font-bold leading-none">
                      {new Date(event.startDate).getDate()}
                    </p>
                    <p className="text-xs uppercase mt-1">
                      {new Date(event.startDate).toLocaleString(
                        locale === "pt" ? "pt-PT" : "en-US",
                        { month: "short" }
                      )}
                    </p>
                    <p className="text-xs mt-0.5">
                      {new Date(event.startDate).getFullYear()}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {getLocalizedField(event.title as Record<string, string>, locale)}
                    </h2>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-2">
                      <span>
                        {formatDate(event.startDate, locale)}
                        {event.endDate && ` – ${formatDate(event.endDate, locale)}`}
                      </span>
                      {event.location && (
                        <span>
                          {getLocalizedField(event.location as Record<string, string>, locale)}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {getLocalizedField(event.description as Record<string, string>, locale)}
                      </p>
                    )}

                    {event.registrationEnabled && (
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        {t("events.register", locale)}
                      </span>
                    )}
                  </div>

                  {event.featuredImage && (
                    <img
                      src={event.featuredImage}
                      alt=""
                      className="w-32 h-24 object-cover rounded-lg flex-shrink-0 hidden sm:block"
                    />
                  )}
                </div>
              </a>
            ))}
          </div>

          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            baseUrl={`/${locale}/events${view === "past" ? "?view=past" : ""}`}
            locale={locale}
          />
        </>
      )}
    </div>
  );
}
