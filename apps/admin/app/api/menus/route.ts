import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const menus = await prisma.menu.findMany({
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          children: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  return NextResponse.json(menus);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "Menu name is required" }, { status: 400 });
  }

  const existing = await prisma.menu.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "Menu already exists" }, { status: 409 });
  }

  const menu = await prisma.menu.create({ data: { name } });
  return NextResponse.json(menu, { status: 201 });
}
