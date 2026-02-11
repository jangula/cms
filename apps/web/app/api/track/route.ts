import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const referrer = request.headers.get("referer") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    await prisma.pageView.create({
      data: {
        path,
        referrer,
        userAgent,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Silently fail
  }
}
