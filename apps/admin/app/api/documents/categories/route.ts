import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";
import { generateSlug } from "@angulacms/core/utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const categories = await prisma.documentCategory.findMany({
    orderBy: { slug: "asc" },
    include: { _count: { select: { documents: true } } },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const body = await request.json();
  const { name } = body;

  if (!name?.en) {
    return NextResponse.json(
      { error: "Category name (English) is required" },
      { status: 400 }
    );
  }

  const slug = generateSlug(name.en);

  const existing = await prisma.documentCategory.findUnique({
    where: { slug },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Category with this name already exists" },
      { status: 409 }
    );
  }

  const category = await prisma.documentCategory.create({
    data: { name, slug },
  });

  return NextResponse.json(category, { status: 201 });
}
