import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageTracker } from "@/components/page-tracker";
import { type Locale, SUPPORTED_LOCALES } from "@/lib/i18n";
import "../globals.css";

export const metadata: Metadata = {
  title: "AngulaCMS",
  description: "Powered by AngulaCMS",
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = SUPPORTED_LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : "en";

  return (
    <html lang={loc}>
      <body className="antialiased min-h-screen flex flex-col">
        <PageTracker />
        <Header locale={loc} />
        <main className="flex-1">{children}</main>
        <Footer locale={loc} />
      </body>
    </html>
  );
}
