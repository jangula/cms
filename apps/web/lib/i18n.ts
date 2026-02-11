export const SUPPORTED_LOCALES = ["en", "pt"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

type Translations = Record<string, Record<Locale, string>>;

const translations: Translations = {
  // Navigation
  "nav.home": { en: "Home", pt: "Início" },
  "nav.news": { en: "News", pt: "Notícias" },
  "nav.events": { en: "Events", pt: "Eventos" },
  "nav.documents": { en: "Documents", pt: "Documentos" },
  "nav.search": { en: "Search", pt: "Pesquisar" },

  // Common
  "common.readMore": { en: "Read more", pt: "Ler mais" },
  "common.download": { en: "Download", pt: "Baixar" },
  "common.previous": { en: "Previous", pt: "Anterior" },
  "common.next": { en: "Next", pt: "Próximo" },
  "common.loading": { en: "Loading...", pt: "Carregando..." },
  "common.noResults": { en: "No results found.", pt: "Nenhum resultado encontrado." },
  "common.all": { en: "All", pt: "Todos" },
  "common.backTo": { en: "Back to", pt: "Voltar para" },
  "common.publishedOn": { en: "Published on", pt: "Publicado em" },
  "common.by": { en: "by", pt: "por" },
  "common.share": { en: "Share", pt: "Partilhar" },

  // Homepage
  "home.latestNews": { en: "Latest News", pt: "Últimas Notícias" },
  "home.upcomingEvents": { en: "Upcoming Events", pt: "Próximos Eventos" },
  "home.viewAll": { en: "View all", pt: "Ver todos" },

  // News
  "news.title": { en: "News", pt: "Notícias" },
  "news.allArticles": { en: "All articles", pt: "Todos os artigos" },

  // Events
  "events.title": { en: "Events", pt: "Eventos" },
  "events.upcoming": { en: "Upcoming", pt: "Próximos" },
  "events.past": { en: "Past", pt: "Passados" },
  "events.location": { en: "Location", pt: "Local" },
  "events.date": { en: "Date", pt: "Data" },
  "events.register": { en: "Register", pt: "Inscrever-se" },

  // Documents
  "documents.title": { en: "Documents", pt: "Documentos" },
  "documents.allCategories": { en: "All categories", pt: "Todas as categorias" },
  "documents.downloads": { en: "downloads", pt: "downloads" },

  // Search
  "search.title": { en: "Search", pt: "Pesquisar" },
  "search.placeholder": { en: "Search...", pt: "Pesquisar..." },
  "search.results": { en: "results for", pt: "resultados para" },
  "search.pages": { en: "Pages", pt: "Páginas" },
  "search.articles": { en: "Articles", pt: "Artigos" },

  // Newsletter
  "newsletter.title": { en: "Subscribe to our newsletter", pt: "Subscreva a nossa newsletter" },
  "newsletter.description": {
    en: "Stay updated with the latest news and events.",
    pt: "Mantenha-se atualizado com as últimas notícias e eventos.",
  },
  "newsletter.email": { en: "Your email address", pt: "O seu endereço de email" },
  "newsletter.subscribe": { en: "Subscribe", pt: "Subscrever" },
  "newsletter.success": {
    en: "Thank you! Please check your email to confirm your subscription.",
    pt: "Obrigado! Por favor verifique o seu email para confirmar a subscrição.",
  },
  "newsletter.error": {
    en: "Something went wrong. Please try again.",
    pt: "Algo correu mal. Por favor tente novamente.",
  },

  // Footer
  "footer.poweredBy": { en: "Powered by AngulaCMS", pt: "Desenvolvido com AngulaCMS" },
  "footer.allRights": { en: "All rights reserved.", pt: "Todos os direitos reservados." },
};

export function t(key: string, locale: Locale): string {
  return translations[key]?.[locale] ?? translations[key]?.en ?? key;
}

export function getLocalizedField(
  field: Record<string, string> | null | undefined,
  locale: Locale
): string {
  if (!field) return "";
  return field[locale] || field[DEFAULT_LOCALE] || Object.values(field)[0] || "";
}

export function formatDate(date: string | Date, locale: Locale): string {
  return new Date(date).toLocaleDateString(locale === "pt" ? "pt-PT" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date, locale: Locale): string {
  return new Date(date).toLocaleDateString(locale === "pt" ? "pt-PT" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
