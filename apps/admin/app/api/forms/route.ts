import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";
import { parsePagination, paginatedResponse } from "@angulacms/core/utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const pagination = parsePagination({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 20,
  });

  const [forms, total] = await Promise.all([
    prisma.form.findMany({
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: { _count: { select: { submissions: true } } },
    }),
    prisma.form.count(),
  ]);

  return NextResponse.json(paginatedResponse(forms, total, pagination));
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const body = await request.json();
  const { name, slug, fields, settings } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Name and slug are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.form.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Form with this slug already exists" },
      { status: 409 }
    );
  }

  const form = await prisma.form.create({
    data: {
      name,
      slug,
      fields: fields || [],
      settings,
    },
  });

  return NextResponse.json(form, { status: 201 });
}
