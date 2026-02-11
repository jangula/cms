import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    pages,
    media,
    articles,
    subscribers,
    totalViews,
    last7DaysViews,
    last30DaysViews,
    viewsByDay,
    topPages,
  ] = await Promise.all([
    prisma.page.count(),
    prisma.media.count(),
    prisma.article.count(),
    prisma.subscriber.count(),
    prisma.pageView.count(),
    prisma.pageView.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.pageView.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    // Views by day for last 30 days
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "PageView"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    // Top pages
    prisma.$queryRaw<{ path: string; count: bigint }[]>`
      SELECT path, COUNT(*) as count
      FROM "PageView"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY path
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  // Serialize bigints
  const viewsByDaySerialized = viewsByDay.map((row) => ({
    date: typeof row.date === "string" ? row.date : new Date(row.date).toISOString().split("T")[0],
    count: Number(row.count),
  }));

  const topPagesSerialized = topPages.map((row) => ({
    path: row.path,
    count: Number(row.count),
  }));

  return NextResponse.json({
    pages,
    media,
    articles,
    subscribers,
    totalViews,
    last7DaysViews,
    last30DaysViews,
    viewsByDay: viewsByDaySerialized,
    topPages: topPagesSerialized,
  });
}
