import { NextResponse, type NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["en", "pt"];
const DEFAULT_LOCALE = "en";

function getPreferredLocale(request: NextRequest): string {
  // Check Accept-Language header
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2).toLowerCase())
      .find((lang) => SUPPORTED_LOCALES.includes(lang));
    if (preferred) return preferred;
  }
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if the pathname already has a locale
  const pathnameLocale = SUPPORTED_LOCALES.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) {
    return NextResponse.next();
  }

  // Redirect to locale-prefixed path
  const locale = getPreferredLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!_next|api|uploads|favicon.ico).*)"],
};
