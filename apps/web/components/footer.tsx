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
  const settings = site?.settings as Record<string, string> | null;
  const socialLinks = [
    { name: "Facebook", url: settings?.socialFacebook, icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
    { name: "Twitter", url: settings?.socialTwitter, icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
    { name: "LinkedIn", url: settings?.socialLinkedin, icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
    { name: "YouTube", url: settings?.socialYoutube, icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" },
  ].filter((l) => l.url);

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
                          : (item.url || "#").startsWith("/")
                            ? `/${locale}${item.url}`
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

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>
            &copy; {year} {siteName}. {t("footer.allRights", locale)}
          </p>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={link.icon} />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
