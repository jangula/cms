import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id, isPublic: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Increment download count
  await prisma.document.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  // Redirect to file
  return NextResponse.redirect(new URL(document.fileUrl, request.url));
}
