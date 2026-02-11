import { getMenu, getSiteSettings } from "@/lib/db";
import { getLocalizedField, t, type Locale } from "@/lib/i18n";

interface MenuItem {
  id: string;
  label: Record<string, string> | unknown;
  url: string | null;
  pageId: string | null;
  target: string;
  children: MenuItem[];
}

export async function Footer({ locale }: { locale: Locale }) {
  const [menu, site] = await Promise.all([
    getMenu("footer"),
    getSiteSettings(),
  ]);

  const siteName = site?.name || "AngulaCMS";
  const items = (menu?.items as unknown as MenuItem[]) || [];
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">{siteName}</h3>
            <p className="text-sm leading-relaxed">
              {t("footer.poweredBy", locale)}
            </p>
          </div>

          {/* Footer menu links */}
          {items.length > 0 && (
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                {locale === "pt" ? "Links" : "Links"}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={
                        item.pageId
                          ? `/${locale}/${item.url || ""}`
                          : item.url || "#"
                      }
                      target={item.target}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {getLocalizedField(
                        item.label as Record<string, string>,
                        locale
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick nav */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              {locale === "pt" ? "Navegação" : "Navigation"}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href={`/${locale}/news`} className="text-sm hover:text-white transition-colors">
                  {t("nav.news", locale)}
                </a>
              </li>
              <li>
                <a href={`/${locale}/events`} className="text-sm hover:text-white transition-colors">
                  {t("nav.events", locale)}
                </a>
              </li>
              <li>
                <a href={`/${locale}/documents`} className="text-sm hover:text-white transition-colors">
                  {t("nav.documents", locale)}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {year} {siteName}. {t("footer.allRights", locale)}
          </p>
        </div>
      </div>
    </footer>
  );
}
