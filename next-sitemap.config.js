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
        // Disallow は /api/ だけに絞る。
        //
        // 上の exclude で sitemap から外したユーティリティページ
        // (/profile, /jobs/service-charges/dashboard|survey|thanks,
        //  /contact/confirm) は、各ページが lib/seo.ts の noindexMetadata で
        // noindex を宣言している。ここで Disallow するとクロールが止まり
        // その noindex を読めなくなるため、外部リンク経由で
        // 「robots.txt によりブロックされましたがインデックスに登録されました」
        // になる。noindex を効かせるにはクロールさせる必要がある。
        //
        // /api/ は HTML を返さず noindex を載せられないので Disallow で止める。
        disallow: ["/api/"],
      },
    ],
  },
  // /sightseeing/all のフィルター付きURLはここでブロックしない。
  // クロールを止めるとページ側の noindex を読めず、
  // 「robots.txt によりブロックされましたがインデックスに登録されました」になるため。
  // sitemapSize: 5000, // ページ数が多い場合に分割

  /**
   * 既定のままだと全URLが priority 0.7 / changefreq daily で並び、
   * 「どれも同じ重要度で毎日更新される」という実態と違う申告になる。
   * 階層の深さと更新頻度に合わせて出し分ける。
   *
   * priority はサイト内の相対値でしかない(Google への順位の要求ではない)ので、
   * トップを 1.0 として下に向かって落とすだけでよい。
   */
  transform: async (config, path) => {
    const depth = path.split("/").filter(Boolean).length;

    // イベント・コラム・イギリス英語は追加・更新が続く。ガイド類は書き上げたら滅多に変わらない。
    const isFresh = /^\/(events|column|british-english)(\/|$)/.test(path);

    let priority;
    if (path === "/") priority = 1.0;
    else if (depth === 1) priority = 0.9; // /sightseeing, /museums, /visa, /jobs …
    else if (depth === 2) priority = 0.8; // 各ガイド・詳細ページ
    else priority = 0.6; // それ以下(章ページ、作品ページなど)

    return {
      loc: path,
      changefreq: isFresh ? "weekly" : "monthly",
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },

  additionalPaths: async (config) => {
    const paths = [];
    const staticPages = [
      "/museums",
      "/museums/banksy-artworks",
      "/museums/all-museums",
      "/museums/best-10-museums",
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
      "/events/calendar",
      "/events/archive/2025",
      "/column",
      "/british-english",
      // イギリス史。/history をハブとする全10章。並びは
      // components/history/chapters.ts の historyChapters と一致させること
      // (このファイルは CJS なので TS を読めない)。
      "/history",
      "/history/roman-britain",
      "/history/anglo-saxons-vikings",
      "/history/norman-conquest",
      "/history/tudors",
      "/history/civil-war",
      "/history/union-and-empire",
      "/history/industrial-revolution",
      "/history/world-wars",
      "/history/postwar",
      "/history/modern-britain",
      "/souvenirs",
      "/brands",
      "/restaurants",
      "/sightseeing",
      "/sightseeing/all",
      // 旅行ガイド。並びは components/sightseeing/guides/guides.ts の
      // travelGuides と一致させること。
      "/sightseeing/eta-uk-visa-guide",
      "/sightseeing/itinerary",
      "/sightseeing/hotels",
      "/sightseeing/transport",
      "/sightseeing/travel-tips",
      // 交通ガイド。/sightseeing/transport をハブとする9本。
      // 並びは components/sightseeing/transport/guides.ts の
      // transportGuides と一致させること。
      "/sightseeing/transport/fares",
      "/sightseeing/transport/airports",
      "/sightseeing/transport/tube",
      "/sightseeing/transport/bus",
      "/sightseeing/transport/cycling",
      "/sightseeing/transport/taxi",
      "/sightseeing/transport/travelcard",
      "/sightseeing/transport/own-bike",
      "/sightseeing/transport/car",
      "/sightseeing/harry-potter",
      // ロケ地巡り。作品ページはDBではなく
      // app/(with-ads)/sightseeing/film-locations/data.ts の filmWorks なので、
      // 作品を足したらここにも1行足すこと(このファイルはCJSでTSを読めない)。
      "/sightseeing/film-locations",
      "/sightseeing/film-locations/sherlock",
      "/sightseeing/film-locations/bridgerton",
      "/sightseeing/film-locations/downton-abbey",
      "/sightseeing/film-locations/paddington",
      "/sightseeing/film-locations/james-bond",
      // ブループラーク巡り。エリアページもDBではなく
      // app/(with-ads)/sightseeing/blue-plaques/data.ts の plaqueAreas なので、
      // エリアを足したらここにも1行足すこと。
      "/sightseeing/blue-plaques",
      "/sightseeing/blue-plaques/marylebone-fitzrovia",
      "/sightseeing/blue-plaques/chelsea",
      "/sightseeing/blue-plaques/westminster-st-jamess",
      "/sightseeing/blue-plaques/st-johns-wood",
      "/sightseeing/kids-free-activities",
      "/sightseeing/must-see",
      "/sightseeing/royal-london",
      "/sightseeing/christmas-markets",
      "/sightseeing/stadium-tours",
      "/sightseeing/thames-cruise",
      // ビザガイド。並びは components/visa/guides/guides.ts の
      // visaGuides と一致させること。ETA は本体が /sightseeing 側にあるため
      // 上の旅行ガイドの並びに含まれており、ここには出さない。
      "/visa",
      "/visa/uk-visa-guide",
      "/visa/youth-mobility-scheme",
      "/visa/skilled-worker",
      "/visa/global-talent",
      "/visa/student",
      "/visa/family",
      "/visa/after-arrival",
      // 住まい探しガイド。並びは components/housing/guides/guides.ts の
      // housingGuides と一致させること。
      "/housing",
      "/housing/rightmove-zoopla-openrent",
      "/housing/spareroom",
      "/housing/japanese-listings",
      "/housing/tenancy-types",
      "/housing/deposits-and-fees",
      "/housing/referencing",
      "/housing/where-to-live",
      "/housing/viewing",
      "/housing/noise",
      "/housing/moving-out",
      // 食費節約ガイド。並びは components/food/guides/guides.ts の
      // foodGuides と一致させること。
      "/food",
      "/food/meal-deal",
      "/food/loyalty-cards",
      "/food/discount-timing",
      "/food/apps-and-coupons",
      "/food/where-to-buy",
      "/food/long-stay",
      // 医療・NHSガイド。並びは components/health/guides/guides.ts の
      // healthGuides と一致させること。
      "/health",
      "/health/gp-registration",
      "/health/ihs-and-entitlement",
      "/health/when-you-are-ill",
      "/health/pharmacy-and-prescriptions",
      "/health/dentist-and-optician",
      "/health/prescription-costs",
      // お金・銀行ガイド。並びは components/money/guides/guides.ts の
      // moneyGuides と一致させること。
      "/money",
      "/money/opening-an-account",
      "/money/passing-the-checks",
      "/money/choosing-a-bank",
      "/money/sending-money-from-japan",
      "/money/national-insurance-number",
      "/jobs",
      "/jobs/minimum-wage",
      "/jobs/employment-contract",
      "/jobs/visa-and-work",
      "/jobs/workplace-harassment",
      "/jobs/workplace-pension",
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

    // 裁判体験談は日英で1:1に対応している。日本語版に /en を足したものが英語版のURL。
    // components/jobs/case-story/chapters.ts に章を足したら、上の staticPages と
    // ここの両方に反映されるので、章の追加はこの1リストの編集だけで済む。
    const caseStoryPages = staticPages.filter((p) =>
      p.startsWith("/jobs/service-charges/case-story")
    );
    for (const p of caseStoryPages) {
      paths.push(await config.transform(config, `/en${p}`));
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

    // 週次ダイジェスト「今週のロンドン」のバックナンバー。
    // 最新号は /events と同内容で、そちらを canonical にしているため出さない。
    const briefs = await prisma.weeklyBrief.findMany({
      where: { published: true },
      select: { slug: true },
      orderBy: { weekStart: "desc" },
    });
    for (const b of briefs.slice(1)) {
      paths.push(await config.transform(config, `/events/week/${b.slug}`));
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

    // 料理ページ。/restaurants ハブ自体は上の staticPages 側にある。
    const dishes = await prisma.dish.findMany({ select: { slug: true } });
    for (const d of dishes) {
      paths.push(await config.transform(config, `/restaurants/${d.slug}`));
    }

    // ブランドページ。/brands ハブ自体は上の staticPages 側にある。
    const brands = await prisma.brand.findMany({ select: { slug: true } });
    for (const b of brands) {
      paths.push(await config.transform(config, `/brands/${b.slug}`));
    }

    const columns = await prisma.content.findMany({
      where: { category: "column" },
      select: { slug: true },
    });
    for (const c of columns) {
      paths.push(await config.transform(config, `/column/${c.slug}`));
    }

    const britishEnglishEntries = await prisma.content.findMany({
      where: { category: "british-english" },
      select: { slug: true },
    });
    for (const be of britishEnglishEntries) {
      paths.push(
        await config.transform(config, `/british-english/${be.slug}`),
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
