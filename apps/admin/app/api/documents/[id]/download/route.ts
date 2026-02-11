import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const document = await prisma.document.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    return NextResponse.json({ downloads: document.downloads });
  } catch {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }
}
