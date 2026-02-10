import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "AngulaCMS",
  description: "Powered by AngulaCMS",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body className="antialiased">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href={`/${locale}`} className="text-xl font-bold text-gray-900">
              AngulaCMS
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a href={`/${locale}`} className="text-gray-600 hover:text-gray-900">
                Home
              </a>
              <a href={`/${locale}/news`} className="text-gray-600 hover:text-gray-900">
                News
              </a>
              <a href={`/${locale}/events`} className="text-gray-600 hover:text-gray-900">
                Events
              </a>
              <a href={`/${locale}/documents`} className="text-gray-600 hover:text-gray-900">
                Documents
              </a>
              <div className="ml-4 flex gap-2">
                <a
                  href="/en"
                  className={`px-2 py-1 rounded text-xs ${locale === "en" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  EN
                </a>
                <a
                  href="/pt"
                  className={`px-2 py-1 rounded text-xs ${locale === "pt" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  PT
                </a>
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-900 text-gray-400 px-6 py-8 mt-12">
          <div className="max-w-7xl mx-auto text-center text-sm">
            <p>Powered by AngulaCMS</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
