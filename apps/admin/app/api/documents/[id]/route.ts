import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";
import { getStorage } from "@angulacms/core/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();

  const document = await prisma.document.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      categoryId: body.categoryId || null,
      language: body.language,
      isPublic: body.isPublic,
    },
    include: { category: true },
  });

  return NextResponse.json(document);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const storage = getStorage();
  const filepath = document.fileUrl.replace("/uploads/", "");
  await storage.delete(filepath);

  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ message: "Document deleted" });
}
