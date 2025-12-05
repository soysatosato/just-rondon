const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.just-rondon.com",
  generateRobotsTxt: true,
  exclude: ["/api/*"],
  // sitemapSize: 5000, // ページ数が多い場合に分割
  additionalPaths: async (config) => {
    const paths = [];
    const staticPages = [
      "/museums",
      "/museums/banksy-artworks",
      "/museums/all-museums",
      "/museums/best-10-museums",
      "/museums/best-25-museums",
      "/museums/best-museums-for-kids",
      "/musicals",
      "/news",
      "/chatboard",
      "/chatboard/create",
      "/contact",
      "/sightseeing",
      "/sightseeing/harry-potter",
      "/sightseeing/kids-free-activities",
      "/sightseeing/must-see",
      "/sightseeing/royal-london",
      "/sightseeing/christmas-markets",
      "/sightseeing/stadium-tours",
      "/sightseeing/thames-cruise",
      "/visa/uk-visa-guide-2025",
      "/sightseeing/eta-uk-visa-guide",
      "/visa/uk-youth-mobility-visa",
      "/",
    ];
    for (const p of staticPages) {
      paths.push(await config.transform(config, p));
    }

    const museums = await prisma.museum.findMany({
      select: { slug: true, artworks: { select: { id: true } } },
    });

    for (const m of museums) {
      paths.push(await config.transform(config, `/museums/${m.slug}`));
      paths.push(await config.transform(config, `/museums/${m.slug}/artworks`));
      for (const a of m.artworks) {
        paths.push(
          await config.transform(config, `/museums/${m.slug}/artworks/${a.id}`)
        );
      }
    }
    const musicals = await prisma.musical.findMany({
      select: { slug: true, songs: { select: { id: true } } },
    });

    for (const mu of musicals) {
      paths.push(await config.transform(config, `/musicals/${mu.slug}`));
      paths.push(await config.transform(config, `/musicals/${mu.slug}/songs`));
      for (const s of mu.songs) {
        paths.push(
          await config.transform(config, `/musicals/${mu.slug}/songs/${s.id}`)
        );
      }
    }
    const attractions = await prisma.attraction.findMany({
      select: { slug: true },
    });

    for (const a of attractions) {
      paths.push(await config.transform(config, `/sightseeing/${a.slug}`));
    }

    const christmasMarkets = await prisma.content.findMany({
      where: { category: "christmas-market" },
      include: { sections: true },
    });
    for (const cm of christmasMarkets) {
      paths.push(
        await config.transform(
          config,
          `/sightseeing/christmas-markets/${cm.slug}`
        )
      );
    }

    const news = await prisma.news.findMany({
      select: { id: true },
    });

    for (const n of news) {
      paths.push(await config.transform(config, `/news/${n.id}`));
    }

    const posts = await prisma.post.findMany({
      select: { id: true },
    });

    for (const p of posts) {
      paths.push(await config.transform(config, `/chatboard/${p.id}`));
    }

    return paths;
  },
};
