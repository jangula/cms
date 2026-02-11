import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
  forbiddenResponse,
  requireRole,
  hashPassword,
} from "@angulacms/core/auth";
import { parsePagination, paginatedResponse } from "@angulacms/core/utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();
  if (!requireRole(auth, "ADMIN")) return forbiddenResponse();

  const { searchParams } = new URL(request.url);
  const pagination = parsePagination({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 20,
  });
  const search = searchParams.get("search");
  const role = searchParams.get("role");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        lastLogin: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json(paginatedResponse(users, total, pagination));
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();
  if (!requireRole(auth, "ADMIN")) return forbiddenResponse();

  const body = await request.json();
  const { email, password, name, role } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Email, password, and name are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "User with this email already exists" },
      { status: 409 }
    );
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || "EDITOR",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
