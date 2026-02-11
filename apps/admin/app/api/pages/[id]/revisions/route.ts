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

  const revisions = await prisma.revision.findMany({
    where: { pageId: id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(revisions);
}
