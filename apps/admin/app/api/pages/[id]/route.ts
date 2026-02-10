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

  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      children: true,
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      slug,
      title,
      content,
      excerpt,
      featuredImage,
      seo,
      status,
      template,
      parentId,
      sortOrder,
    } = body;

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.page.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: "A page with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Create revision before updating
    await prisma.revision.create({
      data: {
        pageId: id,
        title: existing.title as object,
        content: existing.content as object,
        userId: auth.sub,
      },
    });

    const page = await prisma.page.update({
      where: { id },
      data: {
        slug,
        title,
        content,
        excerpt,
        featuredImage,
        seo,
        status,
        template,
        parentId,
        sortOrder,
        publishedAt:
          status === "PUBLISHED" && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(page);
  } catch {
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ message: "Page deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
