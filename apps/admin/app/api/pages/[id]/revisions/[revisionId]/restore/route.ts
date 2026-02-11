import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id, revisionId } = await params;

  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
  });

  if (!revision || revision.pageId !== id) {
    return NextResponse.json(
      { error: "Revision not found" },
      { status: 404 }
    );
  }

  const currentPage = await prisma.page.findUnique({ where: { id } });
  if (!currentPage) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Save current state as a new revision before restoring
  await prisma.revision.create({
    data: {
      pageId: id,
      title: currentPage.title as object,
      content: currentPage.content as object,
      userId: auth.sub,
    },
  });

  // Restore from revision
  const page = await prisma.page.update({
    where: { id },
    data: {
      title: revision.title as object,
      content: revision.content as object,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(page);
}
