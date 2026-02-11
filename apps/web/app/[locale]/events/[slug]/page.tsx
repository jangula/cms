import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug } from "@/lib/db";
import {
  type Locale,
  SUPPORTED_LOCALES,
  getLocalizedField,
  formatDate,
  formatDateTime,
  t,
} from "@/lib/i18n";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const event = await getEventBySlug(slug);

  if (!event) return {};

  const title = getLocalizedField(event.title as Record<string, string>, locale);
  const description = event.description
    ? getLocalizedField(event.description as Record<string, string>, locale)
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.featuredImage ? [event.featuredImage] : [],
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = (SUPPORTED_LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;

  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const title = getLocalizedField(event.title as Record<string, string>, locale);
  const description = getLocalizedField(
    event.description as Record<string, string>,
    locale
  );
  const isPast = new Date(event.startDate) < new Date();

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <a
        href={`/${locale}/events`}
        className="text-sm text-primary-600 hover:text-primary-700 mb-6 inline-block"
      >
        &larr; {t("common.backTo", locale)} {t("events.title", locale)}
      </a>

      {event.featuredImage && (
        <img
          src={event.featuredImage}
          alt={title}
          className="w-full h-64 sm:h-96 object-cover rounded-xl mb-8"
        />
      )}

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
        {title}
      </h1>

      {/* Event details card */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              {t("events.date", locale)}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {formatDateTime(event.startDate, locale)}
              {event.endDate && (
                <>
                  <br />
                  <span className="text-gray-500">
                    {locale === "pt" ? "até" : "to"}{" "}
                  </span>
                  {formatDateTime(event.endDate, locale)}
                </>
              )}
            </p>
          </div>
          {event.location && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {t("events.location", locale)}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {getLocalizedField(event.location as Record<string, string>, locale)}
              </p>
            </div>
          )}
        </div>

        {event.registrationEnabled && !isPast && event.registrationUrl && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              {t("events.register", locale)}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {isPast && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500 italic">
              {locale === "pt" ? "Este evento já ocorreu." : "This event has already taken place."}
            </span>
          </div>
        )}
      </div>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </article>
  );
}
