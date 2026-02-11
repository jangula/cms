import { getPublishedArticles, getUpcomingEvents, getPageBySlug } from "@/lib/db";
import {
  type Locale,
  SUPPORTED_LOCALES,
  getLocalizedField,
  formatDate,
  t,
} from "@/lib/i18n";
import { NewsletterForm } from "@/components/newsletter-form";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;

  const [homePage, newsResult, eventsResult] = await Promise.all([
    getPageBySlug("home"),
    getPublishedArticles({ pageSize: 3 }),
    getUpcomingEvents({ pageSize: 3 }),
  ]);

  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">
            {homePage
              ? getLocalizedField(homePage.title as Record<string, string>, locale)
              : locale === "pt"
                ? "Bem-vindo"
                : "Welcome"}
          </h1>
          {homePage?.excerpt && (
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl">
              {getLocalizedField(homePage.excerpt as Record<string, string>, locale)}
            </p>
          )}
        </div>
      </section>

      {/* Homepage CMS content */}
      {homePage?.content && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: getLocalizedField(homePage.content as Record<string, string>, locale),
            }}
          />
        </section>
      )}

      {/* Latest News */}
      {newsResult.articles.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {t("home.latestNews", locale)}
              </h2>
              <a
                href={`/${locale}/news`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {t("home.viewAll", locale)} &rarr;
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsResult.articles.map((article) => (
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
                    <p className="text-xs text-gray-500 mb-2">
                      {article.publishedAt && formatDate(article.publishedAt, locale)}
                    </p>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {getLocalizedField(article.title as Record<string, string>, locale)}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {getLocalizedField(article.excerpt as Record<string, string>, locale)}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {eventsResult.events.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {t("home.upcomingEvents", locale)}
              </h2>
              <a
                href={`/${locale}/events`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {t("home.viewAll", locale)} &rarr;
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventsResult.events.map((event) => (
                <a
                  key={event.id}
                  href={`/${locale}/events/${event.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-50 text-primary-700 rounded-lg px-3 py-2 text-center min-w-[60px]">
                      <p className="text-2xl font-bold leading-none">
                        {new Date(event.startDate).getDate()}
                      </p>
                      <p className="text-xs uppercase mt-1">
                        {new Date(event.startDate).toLocaleString(
                          locale === "pt" ? "pt-PT" : "en-US",
                          { month: "short" }
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {getLocalizedField(event.title as Record<string, string>, locale)}
                      </h3>
                      {event.location && (
                        <p className="text-sm text-gray-500">
                          {getLocalizedField(event.location as Record<string, string>, locale)}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <NewsletterForm locale={locale} />
        </div>
      </section>
    </div>
  );
}
