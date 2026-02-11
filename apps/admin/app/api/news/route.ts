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
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (tag) {
    where.tags = { some: { tag: { slug: tag } } };
  }
  if (search) {
    where.slug = { contains: search, mode: "insensitive" };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        author: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json(paginatedResponse(articles, total, pagination));
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { slug, title, content, excerpt, featuredImage, seo, status, tags } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: "Slug, title, and content are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 409 }
      );
    }

    const article = await prisma.article.create({
      data: {
        slug,
        title,
        content,
        excerpt,
        featuredImage,
        seo,
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: auth.sub,
        tags: tags?.length
          ? {
              create: tags.map((tagId: string) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
