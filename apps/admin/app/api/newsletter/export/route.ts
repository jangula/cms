import { type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const subscribers = await prisma.subscriber.findMany({
    where: { unsubscribedAt: null },
    orderBy: { subscribedAt: "desc" },
  });

  const csvRows = [
    "email,name,verified,subscribed_at",
    ...subscribers.map(
      (s) =>
        `"${s.email}","${s.name || ""}","${s.isVerified}","${s.subscribedAt.toISOString()}"`
    ),
  ];

  return new Response(csvRows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
