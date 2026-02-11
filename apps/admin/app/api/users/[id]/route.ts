import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
  forbiddenResponse,
  requireRole,
  hashPassword,
} from "@angulacms/core/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();
  if (!requireRole(auth, "ADMIN")) return forbiddenResponse();

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();
  if (!requireRole(auth, "ADMIN")) return forbiddenResponse();

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.email) data.email = body.email;
  if (body.role) data.role = body.role;
  if (body.password) data.password = await hashPassword(body.password);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();
  if (!requireRole(auth, "ADMIN")) return forbiddenResponse();

  const { id } = await params;

  // Prevent self-deletion
  if (id === auth.sub) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "User deleted" });
}
