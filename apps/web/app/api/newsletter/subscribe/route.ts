import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      if (existing.unsubscribedAt) {
        // Re-subscribe
        await prisma.subscriber.update({
          where: { id: existing.id },
          data: {
            unsubscribedAt: null,
            verifyToken: randomBytes(32).toString("hex"),
            isVerified: false,
            subscribedAt: new Date(),
          },
        });
        return NextResponse.json({ message: "Subscribed successfully" });
      }
      return NextResponse.json({ message: "Already subscribed" });
    }

    const verifyToken = randomBytes(32).toString("hex");

    await prisma.subscriber.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name || null,
        verifyToken,
        isVerified: false,
      },
    });

    // TODO: Send verification email via SES
    // For now, auto-verify in development
    if (process.env.NODE_ENV === "development") {
      await prisma.subscriber.updateMany({
        where: { email: email.toLowerCase().trim() },
        data: { isVerified: true, verifyToken: null },
      });
    }

    return NextResponse.json({ message: "Subscribed successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
