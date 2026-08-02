const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/** @type {import('next-sitemap').IConfig} */
/**
 * public/robots.txt と public/sitemap*.xml は postbuild でここから生成される。
 * public/ 側を直接編集しても毎回上書きされるので、変更は必ずこのファイルで行う。
 */
module.exports = {
  siteUrl: "https://www.just-rondon.com",
  generateRobotsTxt: true,
  exclude: [
    "/api/*",
    "/profile",
    "/profile/*",
    "/jobs/service-charges/dashboard",
    "/jobs/service-charges/dashboard/*",
    "/jobs/service-charges/survey",
    "/jobs/service-charges/thanks",
    "/contact/confirm",
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/profile",
          "/jobs/service-charges/dashboard",
          "/jobs/service-charges/survey",
          "/jobs/service-charges/thanks",
          "/contact/confirm",
        ],
      },
    ],
  },
  // /sightseeing/all のフィルター付きURLはここでブロックしない。
  // クロールを止めるとページ側の noindex を読めず、
  // 「robots.txt によりブロックされましたがインデックスに登録されました」になるため。
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
      "/musicals/west-end-tickets",
      "/musicals/west-end-etiquette",
      // "/news",
      // "/chatboard",
      // "/chatboard/create",
      // "/matome",
      "/contact",
      "/about",
      "/privacy",
      "/events",
      "/events/archive/2025",
      "/sightseeing",
      "/sightseeing/all",
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
      "/jobs",
      "/jobs/minimum-wage",
      "/jobs/employment-contract",
      "/jobs/visa-and-work",
      "/jobs/workplace-harassment",
      "/jobs/service-charges",
      "/jobs/service-charges/case-story",
      "/jobs/service-charges/case-story/background",
      "/jobs/service-charges/case-story/acas-early-conciliation",
      "/jobs/service-charges/case-story/et1-filing",
      "/jobs/service-charges/case-story/tribunal-correspondence",
      "/jobs/service-charges/case-story/default-judgment",
      "/jobs/service-charges/case-story/high-court-enforcement",
      "/jobs/service-charges/case-story/check-your-service-charge",
      "/jobs/service-charges/case-story/how-to-file-a-claim",
      "/jobs/service-charges/case-story/resources-and-links",
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
          await config.transform(config, `/museums/${m.slug}/artworks/${a.id}`),
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
          await config.transform(config, `/musicals/${mu.slug}/songs/${s.id}`),
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
          `/sightseeing/christmas-markets/${cm.slug}`,
        ),
      );
    }

    // 月別イベントページ。これまでサイトマップに1件も入っていなかった。
    const events2026 = await prisma.content.findMany({
      where: { category: "london-events-2026" },
      select: { slug: true },
    });
    for (const e of events2026) {
      paths.push(await config.transform(config, `/events/${e.slug}`));
    }

    // 2025年版はアーカイブURLに移動。
    const events2025 = await prisma.content.findMany({
      where: { category: "london-events-2025" },
      select: { slug: true },
    });
    for (const e of events2025) {
      paths.push(
        await config.transform(config, `/events/archive/2025/${e.slug}`),
      );
    }

    // for (const n of news) {
    //   paths.push(await config.transform(config, `/news/${n.id}`));
    // }

    // const posts = await prisma.post.findMany({
    //   select: { id: true },
    // });

    // for (const p of posts) {
    //   paths.push(await config.transform(config, `/chatboard/${p.id}`));
    // }

    // const reddits = await prisma.reddit.findMany({
    //   select: { id: true },
    // });

    // for (const rddt of reddits) {
    //   paths.push(await config.transform(config, `/matome/${rddt.id}`));
    // }

    return paths;
  },
};
