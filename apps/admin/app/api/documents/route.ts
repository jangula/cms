import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";
import { getStorage } from "@angulacms/core/storage";
import { parsePagination, paginatedResponse } from "@angulacms/core/utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const pagination = parsePagination({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 20,
  });
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.fileName = { contains: search, mode: "insensitive" };
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: { category: true },
    }),
    prisma.document.count({ where }),
  ]);

  return NextResponse.json(paginatedResponse(documents, total, pagination));
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const titleEn = formData.get("titleEn") as string;
    const titlePt = formData.get("titlePt") as string;
    const descEn = formData.get("descriptionEn") as string | null;
    const descPt = formData.get("descriptionPt") as string | null;
    const categoryId = formData.get("categoryId") as string | null;
    const language = formData.get("language") as string | null;
    const isPublic = formData.get("isPublic") !== "false";

    if (!file || !titleEn) {
      return NextResponse.json(
        { error: "File and title are required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorage();
    const filepath = await storage.upload(buffer, file.name, "documents");
    const url = storage.getUrl(filepath);

    const document = await prisma.document.create({
      data: {
        title: { en: titleEn, pt: titlePt || "" },
        description:
          descEn || descPt
            ? { en: descEn || "", pt: descPt || "" }
            : undefined,
        fileUrl: url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        categoryId: categoryId || undefined,
        language,
        isPublic,
      },
      include: { category: true },
    });

    return NextResponse.json(document, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
