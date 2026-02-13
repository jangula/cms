import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";
import { parsePagination, paginatedResponse } from "@angulacms/core/utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const pagination = parsePagination({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 20,
  });
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.slug = { contains: search, mode: "insensitive" };
  }

  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.page.count({ where }),
  ]);

  return NextResponse.json(paginatedResponse(pages, total, pagination));
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { slug, title, content, excerpt, featuredImage, seo, status, template, parentId, publishedAt } =
      body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: "Slug, title, and content are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 409 }
      );
    }

    const page = await prisma.page.create({
      data: {
        slug,
        title,
        content,
        excerpt,
        featuredImage,
        seo,
        status: status || "DRAFT",
        template: template || "default",
        parentId,
        publishedAt: publishedAt ? new Date(publishedAt) : (status === "PUBLISHED" ? new Date() : null),
        authorId: auth.sub,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
