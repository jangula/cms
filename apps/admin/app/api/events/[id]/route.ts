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
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (body.slug && body.slug !== existing.slug) {
    const slugExists = await prisma.event.findUnique({ where: { slug: body.slug } });
    if (slugExists) {
      return NextResponse.json(
        { error: "An event with this slug already exists" },
        { status: 409 }
      );
    }
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      slug: body.slug,
      title: body.title,
      description: body.description,
      location: body.location,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : null,
      featuredImage: body.featuredImage,
      registrationEnabled: body.registrationEnabled,
      registrationUrl: body.registrationUrl,
      status: body.status,
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ message: "Event deleted" });
}
