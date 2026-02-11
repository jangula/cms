import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding BCC content...");

  // ── Admin user ──
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@benguelacurrent.org" },
    update: {},
    create: {
      email: "admin@benguelacurrent.org",
      password: hashedPassword,
      name: "BCC Admin",
      role: "ADMIN",
    },
  });

  // ── Editor user ──
  const editorPassword = await bcrypt.hash("editor123", 12);
  const editor = await prisma.user.upsert({
    where: { email: "editor@benguelacurrent.org" },
    update: {},
    create: {
      email: "editor@benguelacurrent.org",
      password: editorPassword,
      name: "BCC Editor",
      role: "EDITOR",
    },
  });

  // ── Site settings ──
  const existingSite = await prisma.site.findFirst();
  const site = existingSite
    ? await prisma.site.update({
        where: { id: existingSite.id },
        data: {
          name: "Benguela Current Convention",
          domain: "benguelacurrent.org",
          languages: ["en", "pt"],
          defaultLang: "en",
          logo: null, // Will be uploaded via admin
          theme: {
            primaryColor: "#1a56db",
            secondaryColor: "#06c9a6",
            fontFamily: "Inter, sans-serif",
          },
          settings: {
            socialFacebook: "https://facebook.com/benguelacurrent",
            socialTwitter: "https://x.com/benguelacurrent",
            socialLinkedin: "https://linkedin.com/company/benguela-current-convention",
            seoTitle: "Benguela Current Convention - Marine Conservation & Cooperation",
            seoDescription:
              "The Benguela Current Convention promotes the sustainable management and protection of the Benguela Current Large Marine Ecosystem shared by Angola, Namibia and South Africa.",
            robotsTxt: "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://benguelacurrent.org/sitemap.xml",
          },
        },
      })
    : await prisma.site.create({
        data: {
          name: "Benguela Current Convention",
          domain: "benguelacurrent.org",
          languages: ["en", "pt"],
          defaultLang: "en",
          theme: {
            primaryColor: "#1a56db",
            secondaryColor: "#06c9a6",
            fontFamily: "Inter, sans-serif",
          },
          settings: {
            socialFacebook: "https://facebook.com/benguelacurrent",
            socialTwitter: "https://x.com/benguelacurrent",
            socialLinkedin: "https://linkedin.com/company/benguela-current-convention",
            seoTitle: "Benguela Current Convention - Marine Conservation & Cooperation",
            seoDescription:
              "The Benguela Current Convention promotes the sustainable management and protection of the Benguela Current Large Marine Ecosystem shared by Angola, Namibia and South Africa.",
          },
        },
      });
  console.log(`Site configured: ${site.name}`);

  // ── Pages ──
  const pages = [
    {
      slug: "home",
      template: "home",
      title: {
        en: "Benguela Current Convention",
        pt: "Convenção da Corrente de Benguela",
      },
      content: {
        en: `<p>The Benguela Current Convention (BCC) is a multilateral environmental agreement between the Governments of Angola, Namibia and South Africa.</p>
<p>The BCC promotes the coordinated management of the Benguela Current Large Marine Ecosystem (BCLME), one of the most productive ocean areas in the world.</p>
<h2>Our Mission</h2>
<p>To promote the sustainable management and protection of the BCLME through cooperation between Angola, Namibia and South Africa.</p>`,
        pt: `<p>A Convenção da Corrente de Benguela (BCC) é um acordo ambiental multilateral entre os Governos de Angola, Namíbia e África do Sul.</p>
<p>A BCC promove a gestão coordenada do Grande Ecossistema Marinho da Corrente de Benguela (BCLME), uma das áreas oceânicas mais produtivas do mundo.</p>
<h2>A Nossa Missão</h2>
<p>Promover a gestão sustentável e a proteção do BCLME através da cooperação entre Angola, Namíbia e África do Sul.</p>`,
      },
      excerpt: {
        en: "Promoting sustainable management of the Benguela Current Large Marine Ecosystem.",
        pt: "Promovendo a gestão sustentável do Grande Ecossistema Marinho da Corrente de Benguela.",
      },
      status: "PUBLISHED" as const,
      sortOrder: 0,
    },
    {
      slug: "about",
      template: "default",
      title: { en: "About the BCC", pt: "Sobre a BCC" },
      content: {
        en: `<h2>History</h2>
<p>The Benguela Current Commission was established in 2007 as an interim institution and was transformed into the Benguela Current Convention in 2013 when the three partner countries — Angola, Namibia, and South Africa — signed the Convention.</p>
<h2>The Benguela Current Large Marine Ecosystem</h2>
<p>The BCLME extends along the coast of south-western Africa from the waters near East London in South Africa northwards to Cabinda Province in Angola. It is one of four major coastal upwelling ecosystems in the world and is the most productive.</p>
<h2>Governance</h2>
<p>The BCC is governed by a Ministerial Conference, supported by a Management Board and a Secretariat based in Swakopmund, Namibia.</p>`,
        pt: `<h2>História</h2>
<p>A Comissão da Corrente de Benguela foi estabelecida em 2007 como instituição interina e foi transformada na Convenção da Corrente de Benguela em 2013, quando os três países parceiros — Angola, Namíbia e África do Sul — assinaram a Convenção.</p>
<h2>O Grande Ecossistema Marinho da Corrente de Benguela</h2>
<p>O BCLME estende-se ao longo da costa sudoeste de África, desde as águas perto de East London, na África do Sul, até à Província de Cabinda, em Angola. É um dos quatro principais ecossistemas de afloramento costeiro do mundo e o mais produtivo.</p>
<h2>Governação</h2>
<p>A BCC é governada por uma Conferência Ministerial, apoiada por um Conselho de Gestão e um Secretariado com sede em Swakopmund, Namíbia.</p>`,
      },
      excerpt: {
        en: "Learn about the history, mission and governance of the Benguela Current Convention.",
        pt: "Saiba mais sobre a história, missão e governação da Convenção da Corrente de Benguela.",
      },
      status: "PUBLISHED" as const,
      sortOrder: 1,
    },
    {
      slug: "projects",
      template: "default",
      title: { en: "Projects", pt: "Projetos" },
      content: {
        en: `<p>The BCC implements and coordinates a range of projects aimed at sustainable management of the BCLME:</p>
<h3>Ecosystem Approach to Fisheries (EAF)</h3>
<p>Implementing an ecosystem-based approach to the management of fisheries within the BCLME.</p>
<h3>Marine Spatial Planning</h3>
<p>Developing marine spatial plans to balance conservation with sustainable development along the Benguela coast.</p>
<h3>Climate Change Adaptation</h3>
<p>Building resilience to climate change impacts on the marine ecosystem and coastal communities.</p>
<h3>Biodiversity & Ecosystem Health</h3>
<p>Monitoring and protecting biodiversity and the health of the Benguela ecosystem including seabirds, marine mammals, and commercially important fish stocks.</p>`,
        pt: `<p>A BCC implementa e coordena uma série de projetos destinados à gestão sustentável do BCLME:</p>
<h3>Abordagem Ecossistémica para a Pesca (EAF)</h3>
<p>Implementação de uma abordagem baseada no ecossistema para a gestão das pescas no BCLME.</p>
<h3>Planeamento Espacial Marinho</h3>
<p>Desenvolvimento de planos espaciais marinhos para equilibrar a conservação com o desenvolvimento sustentável ao longo da costa de Benguela.</p>
<h3>Adaptação às Mudanças Climáticas</h3>
<p>Construção de resiliência aos impactos das mudanças climáticas no ecossistema marinho e nas comunidades costeiras.</p>
<h3>Biodiversidade e Saúde do Ecossistema</h3>
<p>Monitorização e proteção da biodiversidade e da saúde do ecossistema de Benguela, incluindo aves marinhas, mamíferos marinhos e stocks de peixes comercialmente importantes.</p>`,
      },
      excerpt: {
        en: "Explore our projects in fisheries management, marine spatial planning, climate adaptation, and biodiversity.",
        pt: "Explore os nossos projetos em gestão de pescas, planeamento espacial marinho, adaptação climática e biodiversidade.",
      },
      status: "PUBLISHED" as const,
      sortOrder: 2,
    },
    {
      slug: "contact",
      template: "default",
      title: { en: "Contact Us", pt: "Contacte-nos" },
      content: {
        en: `<h2>BCC Secretariat</h2>
<p><strong>Benguela Current Convention Secretariat</strong><br>
1 Strand Street, Swakopmund<br>
Namibia</p>
<p>Email: info@benguelacurrent.org<br>
Phone: +264 64 406 901</p>
<h2>Partner Countries</h2>
<ul>
<li><strong>Angola</strong> - Ministry of Fisheries and Sea</li>
<li><strong>Namibia</strong> - Ministry of Fisheries and Marine Resources</li>
<li><strong>South Africa</strong> - Department of Forestry, Fisheries and the Environment</li>
</ul>`,
        pt: `<h2>Secretariado da BCC</h2>
<p><strong>Secretariado da Convenção da Corrente de Benguela</strong><br>
1 Strand Street, Swakopmund<br>
Namíbia</p>
<p>Email: info@benguelacurrent.org<br>
Telefone: +264 64 406 901</p>
<h2>Países Parceiros</h2>
<ul>
<li><strong>Angola</strong> - Ministério das Pescas e do Mar</li>
<li><strong>Namíbia</strong> - Ministério das Pescas e Recursos Marinhos</li>
<li><strong>África do Sul</strong> - Departamento de Florestas, Pescas e Ambiente</li>
</ul>`,
      },
      excerpt: {
        en: "Get in touch with the BCC Secretariat in Swakopmund, Namibia.",
        pt: "Entre em contacto com o Secretariado da BCC em Swakopmund, Namíbia.",
      },
      status: "PUBLISHED" as const,
      sortOrder: 3,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        excerpt: page.excerpt,
      },
      create: { ...page, authorId: admin.id, publishedAt: new Date() },
    });
    console.log(`Page: ${page.slug}`);
  }

  // ── Tags ──
  const tags = [
    { slug: "fisheries", name: { en: "Fisheries", pt: "Pescas" } },
    { slug: "marine-conservation", name: { en: "Marine Conservation", pt: "Conservação Marinha" } },
    { slug: "climate-change", name: { en: "Climate Change", pt: "Mudanças Climáticas" } },
    { slug: "biodiversity", name: { en: "Biodiversity", pt: "Biodiversidade" } },
    { slug: "governance", name: { en: "Governance", pt: "Governação" } },
  ];

  const createdTags: Record<string, string> = {};
  for (const tag of tags) {
    const t = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
    });
    createdTags[tag.slug] = t.id;
  }
  console.log(`Created ${tags.length} tags`);

  // ── News articles ──
  const articles = [
    {
      slug: "bcc-ministerial-conference-2025",
      title: {
        en: "BCC Ministerial Conference 2025 Concludes Successfully",
        pt: "Conferência Ministerial da BCC 2025 Conclui com Sucesso",
      },
      content: {
        en: "<p>The annual Ministerial Conference of the Benguela Current Convention was held in Windhoek, Namibia. Ministers from Angola, Namibia, and South Africa reaffirmed their commitment to sustainable management of the BCLME.</p><p>Key outcomes included the adoption of a new five-year strategic plan and increased funding commitments for marine research.</p>",
        pt: "<p>A Conferência Ministerial anual da Convenção da Corrente de Benguela realizou-se em Windhoek, Namíbia. Os Ministros de Angola, Namíbia e África do Sul reafirmaram o seu compromisso com a gestão sustentável do BCLME.</p><p>Os principais resultados incluíram a adoção de um novo plano estratégico de cinco anos e compromissos de financiamento acrescidos para a investigação marinha.</p>",
      },
      excerpt: {
        en: "Ministers from the three partner countries reaffirm commitment to sustainable management of the BCLME.",
        pt: "Ministros dos três países parceiros reafirmam compromisso com a gestão sustentável do BCLME.",
      },
      tags: ["governance"],
    },
    {
      slug: "new-marine-protected-areas",
      title: {
        en: "Three New Marine Protected Areas Designated in the BCLME",
        pt: "Três Novas Áreas Marinhas Protegidas Designadas no BCLME",
      },
      content: {
        en: "<p>In a landmark decision, three new Marine Protected Areas (MPAs) have been designated within the Benguela Current Large Marine Ecosystem. The new MPAs cover a total area of 15,000 square kilometres and will provide critical protection for spawning grounds and nursery habitats.</p>",
        pt: "<p>Numa decisão histórica, três novas Áreas Marinhas Protegidas (AMP) foram designadas no Grande Ecossistema Marinho da Corrente de Benguela. As novas AMP cobrem uma área total de 15.000 quilómetros quadrados e proporcionarão proteção crítica para os locais de desova e habitats de berçário.</p>",
      },
      excerpt: {
        en: "Landmark decision establishes three new MPAs covering 15,000 km² in the BCLME.",
        pt: "Decisão histórica estabelece três novas AMP cobrindo 15.000 km² no BCLME.",
      },
      tags: ["marine-conservation", "biodiversity"],
    },
    {
      slug: "climate-change-impact-report",
      title: {
        en: "New Report: Climate Change Impacts on the Benguela Ecosystem",
        pt: "Novo Relatório: Impactos das Mudanças Climáticas no Ecossistema de Benguela",
      },
      content: {
        en: "<p>A comprehensive new report has been published detailing the observed and projected impacts of climate change on the Benguela Current ecosystem. The report highlights rising sea temperatures, changes in upwelling patterns, and shifting fish stock distributions.</p>",
        pt: "<p>Foi publicado um novo relatório abrangente detalhando os impactos observados e projetados das mudanças climáticas no ecossistema da Corrente de Benguela. O relatório destaca o aumento das temperaturas do mar, mudanças nos padrões de afloramento e deslocamento das distribuições de stocks de peixes.</p>",
      },
      excerpt: {
        en: "Comprehensive report details observed and projected climate change impacts on the BCLME.",
        pt: "Relatório abrangente detalha os impactos observados e projetados das mudanças climáticas no BCLME.",
      },
      tags: ["climate-change"],
    },
  ];

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - i * 7);

    const article = await prisma.article.upsert({
      where: { slug: art.slug },
      update: { title: art.title, content: art.content, excerpt: art.excerpt },
      create: {
        slug: art.slug,
        title: art.title,
        content: art.content,
        excerpt: art.excerpt,
        status: "PUBLISHED",
        publishedAt,
        authorId: editor.id,
      },
    });

    // Connect tags
    for (const tagSlug of art.tags) {
      if (createdTags[tagSlug]) {
        await prisma.articleTag.upsert({
          where: {
            articleId_tagId: { articleId: article.id, tagId: createdTags[tagSlug] },
          },
          update: {},
          create: { articleId: article.id, tagId: createdTags[tagSlug] },
        });
      }
    }
    console.log(`Article: ${art.slug}`);
  }

  // ── Events ──
  const events = [
    {
      slug: "bcc-science-symposium-2026",
      title: {
        en: "BCC Science Symposium 2026",
        pt: "Simpósio Científico da BCC 2026",
      },
      description: {
        en: "<p>The BCC Science Symposium brings together marine scientists, policymakers, and stakeholders from the three partner countries. Topics include ecosystem monitoring, fisheries stock assessment, and climate adaptation strategies.</p>",
        pt: "<p>O Simpósio Científico da BCC reúne cientistas marinhos, decisores políticos e partes interessadas dos três países parceiros. Os tópicos incluem monitorização de ecossistemas, avaliação de stocks de pesca e estratégias de adaptação climática.</p>",
      },
      location: { en: "Cape Town, South Africa", pt: "Cidade do Cabo, África do Sul" },
      startDate: new Date("2026-05-15T09:00:00Z"),
      endDate: new Date("2026-05-17T17:00:00Z"),
      registrationEnabled: true,
      registrationUrl: "https://benguelacurrent.org/register/symposium-2026",
    },
    {
      slug: "world-ocean-day-celebration-2026",
      title: {
        en: "World Ocean Day Celebration 2026",
        pt: "Celebração do Dia Mundial dos Oceanos 2026",
      },
      description: {
        en: "<p>Join us in celebrating World Ocean Day with activities across all three BCC partner countries. Events include beach cleanups, educational talks, and marine biodiversity exhibitions.</p>",
        pt: "<p>Junte-se a nós na celebração do Dia Mundial dos Oceanos com atividades nos três países parceiros da BCC. Os eventos incluem limpezas de praias, palestras educativas e exposições de biodiversidade marinha.</p>",
      },
      location: { en: "Luanda, Swakopmund & Cape Town", pt: "Luanda, Swakopmund e Cidade do Cabo" },
      startDate: new Date("2026-06-08T10:00:00Z"),
      endDate: new Date("2026-06-08T18:00:00Z"),
      registrationEnabled: false,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: { title: event.title, description: event.description },
      create: { ...event, status: "PUBLISHED" },
    });
    console.log(`Event: ${event.slug}`);
  }

  // ── Document categories ──
  const categories = [
    { slug: "reports", name: { en: "Reports", pt: "Relatórios" } },
    { slug: "policies", name: { en: "Policies & Agreements", pt: "Políticas e Acordos" } },
    { slug: "publications", name: { en: "Publications", pt: "Publicações" } },
  ];

  for (const cat of categories) {
    await prisma.documentCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    console.log(`Document category: ${cat.slug}`);
  }

  // ── Menus ──
  const mainMenu = await prisma.menu.upsert({
    where: { name: "main" },
    update: {},
    create: { name: "main" },
  });

  // Clear existing menu items
  await prisma.menuItem.deleteMany({ where: { menuId: mainMenu.id } });

  const mainMenuItems = [
    { label: { en: "About", pt: "Sobre" }, url: "/about", sortOrder: 0 },
    { label: { en: "Projects", pt: "Projetos" }, url: "/projects", sortOrder: 1 },
    { label: { en: "News", pt: "Notícias" }, url: "/news", sortOrder: 2 },
    { label: { en: "Events", pt: "Eventos" }, url: "/events", sortOrder: 3 },
    { label: { en: "Documents", pt: "Documentos" }, url: "/documents", sortOrder: 4 },
    { label: { en: "Contact", pt: "Contacto" }, url: "/contact", sortOrder: 5 },
  ];

  for (const item of mainMenuItems) {
    await prisma.menuItem.create({
      data: { ...item, menuId: mainMenu.id },
    });
  }
  console.log("Main menu configured with 6 items");

  const footerMenu = await prisma.menu.upsert({
    where: { name: "footer" },
    update: {},
    create: { name: "footer" },
  });

  await prisma.menuItem.deleteMany({ where: { menuId: footerMenu.id } });

  const footerItems = [
    { label: { en: "About", pt: "Sobre" }, url: "/about", sortOrder: 0 },
    { label: { en: "Contact", pt: "Contacto" }, url: "/contact", sortOrder: 1 },
    { label: { en: "Documents", pt: "Documentos" }, url: "/documents", sortOrder: 2 },
  ];

  for (const item of footerItems) {
    await prisma.menuItem.create({
      data: { ...item, menuId: footerMenu.id },
    });
  }
  console.log("Footer menu configured with 3 items");

  console.log("\nBCC content seeding complete!");
  console.log("Admin login: admin@benguelacurrent.org / admin123");
  console.log("Editor login: editor@benguelacurrent.org / editor123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
