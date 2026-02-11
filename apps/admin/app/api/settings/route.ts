import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
  requireRole,
  forbiddenResponse,
} from "@angulacms/core/auth";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  let site = await prisma.site.findFirst();

  if (!site) {
    site = await prisma.site.create({
      data: {
        name: "AngulaCMS",
        languages: ["en"],
        defaultLang: "en",
      },
    });
  }

  return NextResponse.json(site);
}

export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();
  if (!requireRole(auth, "ADMIN")) return forbiddenResponse();

  const body = await request.json();
  const { name, domain, languages, defaultLang, logo, favicon, theme, settings } = body;

  let site = await prisma.site.findFirst();

  if (!site) {
    site = await prisma.site.create({
      data: {
        name: name || "AngulaCMS",
        languages: languages || ["en"],
        defaultLang: defaultLang || "en",
      },
    });
  }

  const updated = await prisma.site.update({
    where: { id: site.id },
    data: {
      ...(name !== undefined && { name }),
      ...(domain !== undefined && { domain: domain || null }),
      ...(languages !== undefined && { languages }),
      ...(defaultLang !== undefined && { defaultLang }),
      ...(logo !== undefined && { logo: logo || null }),
      ...(favicon !== undefined && { favicon: favicon || null }),
      ...(theme !== undefined && { theme }),
      ...(settings !== undefined && { settings }),
    },
  });

  return NextResponse.json(updated);
}
