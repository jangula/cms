import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@angulacms.com" },
    update: {},
    create: {
      email: "admin@angulacms.com",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create default site
  const site = await prisma.site.upsert({
    where: { domain: "localhost" },
    update: {},
    create: {
      name: "AngulaCMS",
      domain: "localhost",
      languages: ["en", "pt"],
      defaultLang: "en",
      theme: {
        primaryColor: "#2563eb",
        secondaryColor: "#0d9488",
        fonts: { heading: "Inter", body: "Inter" },
      },
    },
  });
  console.log(`Created site: ${site.name}`);

  // Create default menus
  const mainMenu = await prisma.menu.upsert({
    where: { name: "main" },
    update: {},
    create: { name: "main" },
  });

  const footerMenu = await prisma.menu.upsert({
    where: { name: "footer" },
    update: {},
    create: { name: "footer" },
  });
  console.log(`Created menus: ${mainMenu.name}, ${footerMenu.name}`);

  // Create a sample page
  const homePage = await prisma.page.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      slug: "home",
      title: { en: "Welcome", pt: "Bem-vindo" },
      content: {
        en: "<p>Welcome to AngulaCMS.</p>",
        pt: "<p>Bem-vindo ao AngulaCMS.</p>",
      },
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: admin.id,
    },
  });
  console.log(`Created page: ${homePage.slug}`);

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
