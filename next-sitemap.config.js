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

    // イベント・コラム・時事論考・イギリス英語は追加・更新が続く。ガイド類は書き上げたら滅多に変わらない。
    const isFresh = /^\/(events|reading|column|modern-britain|british-english)(\/|$)/.test(path);

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
      // 観劇ガイド。並びは components/musicals/guides/guides.ts の
      // guides と一致させること。
      "/musicals/west-end-tickets",
      "/musicals/pre-theatre-dining",
      "/musicals/west-end-etiquette",
      "/musicals/first-time-theatre",
      "/musicals/shows-without-english",
      "/musicals/theatre-with-kids",
      // 劇場ガイドのハブ。各劇場ページ(/musicals/theatres/<slug>)は
      // DB 由来なので下の additionalPaths が出す。
      "/musicals/theatres",
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
      // 「英国を読む」ハブ。column/modern-britain/history/british-english を束ねる。
      "/reading",
      "/column",
      "/modern-britain",
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
      // Beyond London。/beyond-london をハブとする12本
      // (移動の実務1本＋日帰り圏7本＋週末1泊圏4本)。並びは
      // components/beyond-london/destinations.ts の beyondDestinations と
      // 一致させること(このファイルは CJS なので TS を読めない)。
      "/beyond-london",
      "/beyond-london/britrail-pass",
      "/beyond-london/windsor",
      "/beyond-london/oxford",
      "/beyond-london/cambridge",
      "/beyond-london/bath-stonehenge",
      "/beyond-london/cotswolds",
      "/beyond-london/brighton",
      "/beyond-london/canterbury",
      "/beyond-london/york",
      "/beyond-london/edinburgh",
      "/beyond-london/lake-district",
      "/beyond-london/penzance",
      "/souvenirs",
      "/brands",
      "/shopping",
      "/shopping/markets",
      "/shopping/department-stores",
      "/shopping/bicester-village",
      "/shopping/vat-refund",
      "/restaurants",
      // レストラン/パブのガイド。料理ページ(/restaurants/<dish>)はDB由来で
      // 下の additionalPaths が出すので、静的なガイドだけここに書く。
      // 並びは components/restaurants/guides/guides.ts の
      // restaurantGuides と一致させること。
      "/restaurants/must-visit",
      "/restaurants/pub-etiquette",
      "/sightseeing",
      "/sightseeing/all",
      // 入場無料スポットの一覧。/sightseeing/all の free フィルターは
      // noindex なので、検索の受け皿としてこの静的URLを別に持つ。
      "/sightseeing/free",
      // 旅行ガイド。並びは components/sightseeing/guides/guides.ts の
      // travelGuides と一致させること。
      "/sightseeing/eta-uk-visa-guide",
      "/sightseeing/itinerary",
      // モデルコースの分岐版。並びは
      // components/sightseeing/guides/itinerary-variants.ts の
      // itineraryVariants と一致させること。
      "/sightseeing/itinerary/rainy-day",
      "/sightseeing/itinerary/with-kids",
      "/sightseeing/itinerary/layover",
      "/sightseeing/hotels",
      "/sightseeing/transport",
      "/sightseeing/budget",
      "/sightseeing/tipping-and-payment",
      "/sightseeing/travel-tips",
      "/sightseeing/step-free",
      // 交通ガイド。/sightseeing/transport をハブとする10本。
      // 並びは components/sightseeing/transport/guides.ts の
      // transportGuides と一致させること。
      "/sightseeing/transport/fares",
      "/sightseeing/transport/airports",
      "/sightseeing/transport/national-rail",
      "/sightseeing/transport/tube",
      "/sightseeing/transport/bus",
      "/sightseeing/transport/cycling",
      "/sightseeing/transport/taxi",
      "/sightseeing/transport/travelcard",
      "/sightseeing/transport/own-bike",
      "/sightseeing/transport/car",
      "/sightseeing/areas",
      // エリアガイド。/sightseeing/areas をハブとする6本。
      // 並びは components/sightseeing/areas/areas.ts の
      // areaGuides と一致させること。
      "/sightseeing/areas/westminster",
      "/sightseeing/areas/soho",
      "/sightseeing/areas/southbank",
      "/sightseeing/areas/city",
      "/sightseeing/areas/shoreditch",
      "/sightseeing/areas/greenwich",
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
      "/sightseeing/football",
      // プレミアリーグ観戦ガイド。/sightseeing/football をハブとする12本。
      // 並びは components/sightseeing/football/guides.ts の
      // footballGuides と一致させること。
      "/sightseeing/football/tickets",
      "/sightseeing/football/resale-warning",
      "/sightseeing/football/planning",
      "/sightseeing/football/matchday",
      "/sightseeing/football/getting-there",
      "/sightseeing/football/etiquette",
      "/sightseeing/football/which-club",
      "/sightseeing/football/stadiums",
      "/sightseeing/football/north-london-derby",
      "/sightseeing/football/pub-watching",
      "/sightseeing/football/lower-leagues",
      "/sightseeing/football/stadium-tours",
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
      // トラブル対応ガイド。並びは components/trouble/guides/guides.ts の
      // troubleGuides と一致させること。
      "/trouble",
      "/trouble/pickpocket",
      "/trouble/lost-passport",
      "/trouble/lost-property",
      "/trouble/stalking-harassment",
      "/trouble/scams",
      "/trouble/police-report",
      "/trouble/insurance-claim",
      "/trouble/embassy",
      // 出会い・人間関係ガイド。並びは components/social/guides/guides.ts の
      // socialGuides と一致させること。全9本で完結。
      "/social",
      "/social/how-brits-make-friends",
      "/social/where-to-meet-people",
      "/social/keeping-friendships",
      "/social/dating-apps",
      "/social/dating-culture",
      "/social/dating-safety",
      "/social/where-japanese-gather",
      "/social/japanese-events",
      "/social/community-distance",
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
      select: { slug: true },
    });

    for (const m of museums) {
      paths.push(await config.transform(config, `/museums/${m.slug}`));
      paths.push(await config.transform(config, `/museums/${m.slug}/artworks`));
      // 作品詳細(/artworks/{id})は sitemap に出さない。DB から機械的に量産され、
      // 1件あたりの固有本文が数百字しかないページが 490 件あり、
      // sitemap 全体の 4 割を占めて記事コンテンツの評価を薄めていた。
      // ページ側で noindex を宣言済み。一覧からは辿れるので回遊導線は残る。
    }
    const musicals = await prisma.musical.findMany({
      select: { slug: true },
    });

    for (const mu of musicals) {
      paths.push(await config.transform(config, `/musicals/${mu.slug}`));
      paths.push(await config.transform(config, `/musicals/${mu.slug}/songs`));
      // 曲詳細(/songs/{id})は sitemap に出さない。ページの大半を占める歌詞が
      // 第三者の著作物のため。ページ側で noindex を宣言済み。
    }
    // 劇場ページ。ハブ(/musicals/theatres)は上の staticPages 側にある。
    const theatres = await prisma.theatre.findMany({ select: { slug: true } });
    for (const t of theatres) {
      paths.push(await config.transform(config, `/musicals/theatres/${t.slug}`));
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

    // お土産ページ。/souvenirs ハブ自体は上の staticPages 側にある。
    const souvenirs = await prisma.souvenir.findMany({ select: { slug: true } });
    for (const s of souvenirs) {
      paths.push(await config.transform(config, `/souvenirs/${s.slug}`));
    }

    const columns = await prisma.content.findMany({
      where: { category: "column" },
      select: { slug: true },
    });
    for (const c of columns) {
      paths.push(await config.transform(config, `/column/${c.slug}`));
    }

    const modernBritainEntries = await prisma.content.findMany({
      where: { category: "modern-britain" },
      select: { slug: true },
    });
    for (const mb of modernBritainEntries) {
      paths.push(await config.transform(config, `/modern-britain/${mb.slug}`));
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
