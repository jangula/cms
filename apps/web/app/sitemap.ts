import type { MetadataRoute } from "next";
import { prisma } from "@angulacms/core/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL || "http://localhost:3003";
  const locales = ["en", "pt"];

  // Fetch all published content
  const [pages, articles, events] = await Promise.all([
    prisma.page.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const urls: MetadataRoute.Sitemap = [];

  // Homepage for each locale
  for (const locale of locales) {
    urls.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    });

    // Static section pages
    for (const section of ["news", "events", "documents"]) {
      urls.push({
        url: `${baseUrl}/${locale}/${section}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    // CMS pages
    for (const page of pages) {
      urls.push({
        url: `${baseUrl}/${locale}/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    // Articles
    for (const article of articles) {
      urls.push({
        url: `${baseUrl}/${locale}/news/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    // Events
    for (const event of events) {
      urls.push({
        url: `${baseUrl}/${locale}/events/${event.slug}`,
        lastModified: event.updatedAt,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  return urls;
}
