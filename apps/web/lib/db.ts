import { prisma } from "@angulacms/core/db";
import { type Locale } from "./i18n";

export async function getSiteSettings() {
  const site = await prisma.site.findFirst();
  return site;
}

export async function getMenu(name: string) {
  return prisma.menu.findUnique({
    where: { name },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          children: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
}

export async function getPublishedPages() {
  return prisma.page.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      template: true,
    },
  });
}

export async function getPageBySlug(slug: string) {
  return prisma.page.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
    },
  });
}

export async function getPublishedArticles(options?: {
  page?: number;
  pageSize?: number;
  tag?: string;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const where: Record<string, unknown> = { status: "PUBLISHED" };

  if (options?.tag) {
    where.tags = { some: { tag: { slug: options.tag } } };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { name: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total, page, pageSize };
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function getTags() {
  return prisma.tag.findMany({
    orderBy: { slug: "asc" },
    include: { _count: { select: { articles: true } } },
  });
}

export async function getUpcomingEvents(options?: {
  page?: number;
  pageSize?: number;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: { status: "PUBLISHED", startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({
      where: { status: "PUBLISHED", startDate: { gte: new Date() } },
    }),
  ]);

  return { events, total, page, pageSize };
}

export async function getPastEvents(options?: {
  page?: number;
  pageSize?: number;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: { status: "PUBLISHED", startDate: { lt: new Date() } },
      orderBy: { startDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({
      where: { status: "PUBLISHED", startDate: { lt: new Date() } },
    }),
  ]);

  return { events, total, page, pageSize };
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
}

export async function getPublicDocuments(options?: {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const where: Record<string, unknown> = { isPublic: true };

  if (options?.category) {
    where.category = { slug: options.category };
  }

  if (options?.search) {
    where.OR = [
      { title: { string_contains: options.search } },
      { description: { string_contains: options.search } },
      { fileName: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
    prisma.document.count({ where }),
  ]);

  return { documents, total, page, pageSize };
}

export async function getDocumentCategories() {
  return prisma.documentCategory.findMany({
    orderBy: { slug: "asc" },
    include: { _count: { select: { documents: true } } },
  });
}

export async function searchContent(query: string, locale: Locale) {
  if (!query || query.length < 2) return { pages: [], articles: [], documents: [] };

  const [pages, articles, documents] = await Promise.all([
    prisma.page.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { string_contains: query } },
          { content: { string_contains: query } },
        ],
      },
      select: { slug: true, title: true, excerpt: true },
      take: 10,
    }),
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { string_contains: query } },
          { content: { string_contains: query } },
        ],
      },
      select: { slug: true, title: true, excerpt: true, publishedAt: true },
      take: 10,
    }),
    prisma.document.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { string_contains: query } },
          { fileName: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        mimeType: true,
      },
      take: 10,
    }),
  ]);

  return { pages, articles, documents };
}

export async function trackPageView(path: string, referrer?: string, userAgent?: string) {
  await prisma.pageView.create({
    data: { path, referrer, userAgent },
  });
}

export { prisma };
