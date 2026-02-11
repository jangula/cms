import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();
  const { slug, title, content, excerpt, featuredImage, seo, status, tags } = body;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  if (slug && slug !== existing.slug) {
    const slugExists = await prisma.article.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 409 }
      );
    }
  }

  // Update tags: delete existing, re-create
  if (tags !== undefined) {
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      slug,
      title,
      content,
      excerpt,
      featuredImage,
      seo,
      status,
      publishedAt:
        status === "PUBLISHED" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
      tags:
        tags !== undefined
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

  return NextResponse.json(article);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ message: "Article deleted" });
}
