import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const [pages, media, articles, subscribers] = await Promise.all([
    prisma.page.count(),
    prisma.media.count(),
    prisma.article.count(),
    prisma.subscriber.count(),
  ]);

  return NextResponse.json({ pages, media, articles, subscribers });
}
