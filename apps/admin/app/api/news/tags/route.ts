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

  const tags = await prisma.tag.findMany({
    orderBy: { slug: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const body = await request.json();
  const { name } = body;

  if (!name?.en) {
    return NextResponse.json(
      { error: "Tag name (English) is required" },
      { status: 400 }
    );
  }

  const slug = generateSlug(name.en);

  const existing = await prisma.tag.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Tag already exists" },
      { status: 409 }
    );
  }

  const tag = await prisma.tag.create({ data: { name, slug } });

  return NextResponse.json(tag, { status: 201 });
}
