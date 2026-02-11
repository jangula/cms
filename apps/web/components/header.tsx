import { getMenu, getSiteSettings } from "@/lib/db";
import { getLocalizedField, t, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";

interface MenuItem {
  id: string;
  label: Record<string, string> | unknown;
  url: string | null;
  pageId: string | null;
  target: string;
  children: MenuItem[];
}

export async function Header({ locale }: { locale: Locale }) {
  const [menu, site] = await Promise.all([
    getMenu("main"),
    getSiteSettings(),
  ]);

  const siteName = site?.name || "AngulaCMS";
  const siteLogo = site?.logo;
  const items = (menu?.items as unknown as MenuItem[]) || [];

  // Fallback nav if no menu configured
  const fallbackItems = [
    { label: t("nav.news", locale), href: `/${locale}/news` },
    { label: t("nav.events", locale), href: `/${locale}/events` },
    { label: t("nav.documents", locale), href: `/${locale}/documents` },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Site Name */}
          <a
            href={`/${locale}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {siteLogo && (
              <img src={siteLogo} alt={siteName} className="h-10 w-auto" />
            )}
            <span className="text-xl font-bold text-primary-900">
              {siteName}
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {items.length > 0
              ? items.map((item) => {
                  const label = getLocalizedField(
                    item.label as Record<string, string>,
                    locale
                  );
                  const href = item.pageId
                    ? `/${locale}/${item.url || ""}`
                    : item.url || "#";

                  return (
                    <div key={item.id} className="relative group">
                      <a
                        href={href}
                        target={item.target}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {label}
                      </a>
                      {item.children.length > 0 && (
                        <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-1">
                          {item.children.map((child) => (
                            <a
                              key={child.id}
                              href={
                                child.pageId
                                  ? `/${locale}/${child.url || ""}`
                                  : child.url || "#"
                              }
                              target={child.target}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                            >
                              {getLocalizedField(
                                child.label as Record<string, string>,
                                locale
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              : fallbackItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}

            {/* Search link */}
            <a
              href={`/${locale}/search`}
              className="px-3 py-2 text-gray-500 hover:text-primary-600 transition-colors"
              aria-label={t("nav.search", locale)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </a>

            <div className="ml-2 pl-2 border-l border-gray-200">
              <LanguageSwitcher locale={locale} />
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <MobileMenu locale={locale} items={items} fallbackItems={fallbackItems} />
          </div>
        </div>
      </div>
    </header>
  );
}
