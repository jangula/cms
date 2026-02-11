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
  const status = searchParams.get("status");
  const upcoming = searchParams.get("upcoming");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (upcoming === "true") {
    where.startDate = { gte: new Date() };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json(paginatedResponse(events, total, pagination));
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const {
      slug, title, description, location, startDate, endDate,
      featuredImage, registrationEnabled, registrationUrl, status,
    } = body;

    if (!slug || !title || !description || !startDate) {
      return NextResponse.json(
        { error: "Slug, title, description, and start date are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "An event with this slug already exists" },
        { status: 409 }
      );
    }

    const event = await prisma.event.create({
      data: {
        slug,
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        featuredImage,
        registrationEnabled: registrationEnabled || false,
        registrationUrl,
        status: status || "DRAFT",
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
