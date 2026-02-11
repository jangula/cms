import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  await prisma.subscriber.delete({ where: { id } });
  return NextResponse.json({ message: "Subscriber removed" });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();

  const subscriber = await prisma.subscriber.update({
    where: { id },
    data: {
      isVerified: body.isVerified,
      unsubscribedAt: body.unsubscribe ? new Date() : null,
    },
  });

  return NextResponse.json(subscriber);
}
