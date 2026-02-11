import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@angulacms/core/db";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@angulacms/core/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const menu = await prisma.menu.findUnique({
    where: { id },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          children: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!menu) {
    return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  }

  return NextResponse.json(menu);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();
  const { items } = body;

  // Delete all existing items for this menu, then re-create from payload
  await prisma.menuItem.deleteMany({ where: { menuId: id } });

  if (items?.length) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const parent = await prisma.menuItem.create({
        data: {
          label: item.label,
          url: item.url || null,
          pageId: item.pageId || null,
          target: item.target || "_self",
          sortOrder: i,
          menuId: id,
        },
      });

      if (item.children?.length) {
        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j];
          await prisma.menuItem.create({
            data: {
              label: child.label,
              url: child.url || null,
              pageId: child.pageId || null,
              target: child.target || "_self",
              sortOrder: j,
              parentId: parent.id,
              menuId: id,
            },
          });
        }
      }
    }
  }

  const menu = await prisma.menu.findUnique({
    where: { id },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        include: { children: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  return NextResponse.json(menu);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  await prisma.menu.delete({ where: { id } });
  return NextResponse.json({ message: "Menu deleted" });
}
