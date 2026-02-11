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
  const form = await prisma.form.findUnique({
    where: { id },
    include: { _count: { select: { submissions: true } } },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json(form);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();

  const form = await prisma.form.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      fields: body.fields,
      settings: body.settings,
    },
  });

  return NextResponse.json(form);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  await prisma.form.delete({ where: { id } });
  return NextResponse.json({ message: "Form deleted" });
}
