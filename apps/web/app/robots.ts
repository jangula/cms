import type { MetadataRoute } from "next";
import { prisma } from "@angulacms/core/db";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.SITE_URL || "http://localhost:3003";

  // Try to load custom robots.txt from site settings
  const site = await prisma.site.findFirst();
  const settings = site?.settings as Record<string, string> | null;
  const customRobots = settings?.robotsTxt;

  if (customRobots) {
    // Parse custom robots.txt into structured format
    const rules: MetadataRoute.Robots["rules"] = [];
    let currentRule: { userAgent: string; allow?: string[]; disallow?: string[] } | null = null;

    for (const line of customRobots.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith("user-agent:")) {
        if (currentRule) rules.push(currentRule);
        currentRule = { userAgent: trimmed.substring(11).trim() };
      } else if (trimmed.toLowerCase().startsWith("allow:") && currentRule) {
        if (!currentRule.allow) currentRule.allow = [];
        currentRule.allow.push(trimmed.substring(6).trim());
      } else if (trimmed.toLowerCase().startsWith("disallow:") && currentRule) {
        if (!currentRule.disallow) currentRule.disallow = [];
        currentRule.disallow.push(trimmed.substring(9).trim());
      }
    }
    if (currentRule) rules.push(currentRule);

    return {
      rules: rules.length > 0 ? rules : [{ userAgent: "*", allow: ["/"] }],
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
