import { type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });

  if (!user) return unauthorizedResponse();

  return Response.json({ user });
}
