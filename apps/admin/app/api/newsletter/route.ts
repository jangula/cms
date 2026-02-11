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
    pageSize: Number(searchParams.get("pageSize")) || 30,
  });
  const search = searchParams.get("search");
  const verified = searchParams.get("verified");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (verified === "true") where.isVerified = true;
  if (verified === "false") where.isVerified = false;

  const [subscribers, total] = await Promise.all([
    prisma.subscriber.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.subscriber.count({ where }),
  ]);

  return NextResponse.json(paginatedResponse(subscribers, total, pagination));
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const body = await request.json();
  const { email, name } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Subscriber already exists" },
      { status: 409 }
    );
  }

  const subscriber = await prisma.subscriber.create({
    data: {
      email,
      name: name || null,
      isVerified: true, // Manual add = pre-verified
    },
  });

  return NextResponse.json(subscriber, { status: 201 });
}
