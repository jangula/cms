import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token is required" },
      { status: 400 }
    );
  }

  const subscriber = await prisma.subscriber.findFirst({
    where: { verifyToken: token },
  });

  if (!subscriber) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 404 }
    );
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { isVerified: true, verifyToken: null },
  });

  // Redirect to homepage with success message
  const locale = request.nextUrl.searchParams.get("locale") || "en";
  return NextResponse.redirect(
    new URL(`/${locale}?subscribed=true`, request.url)
  );
}
