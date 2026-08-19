import db from "./db";

// highlight 用の静的1件（the-london-pass）
export const STATIC_HIGHLIGHT_PASS = {
  title: "The London Pass",
  subtitle: "ロンドン観光パス",
  description: "主要観光スポットの入場料がセットになったお得なシティパス。",
  slug: "the-london-pass",
  image:
    "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/londonpass.jpeg",
};

// must-see 静的4件
export const STATIC_MUST_SEE_CATEGORIES = [
  {
    title: "ロンドン必見スポット厳選",
    description: "まず押さえておきたい代表的な観光名所を厳選。",
    slug: "must-see",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/must-see-bg.jpg",
  },
  {
    title: "ハリー・ポッターゆかりの地",
    description: "作品の舞台となったロケ地や関連アトラクションを巡る。",
    slug: "harry-potter",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/51/Harry_Potter_logo.svg",
  },
  {
    title: "王室ゆかりの観光地",
    description: "バッキンガム宮殿や王室ギャラリーなど英国王室の世界へ。",
    slug: "royal-london",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/royal-london-bg.jpeg",
  },
  {
    title: "子どもと楽しむロンドン",
    description: "家族旅行にぴったりな体験型スポットを紹介。",
    slug: "kids-free-activities",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/kids-free-activities-bg.jpeg",
  },
];

// seasonal 静的1件
export const STATIC_SEASONAL = {
  title: "クリスマスマーケット2025",
  description:
    "ロンドン冬の風物詩。市内各所で開催される巨大クリスマスマーケット。",
  slug: "christmas-markets",
  image:
    "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/london-cm-bg.jpeg",
};

// royal 静的1件
export const STATIC_ROYAL = {
  title: "王室ゆかりのロンドン完全ガイド",
  description: "主要な王室スポットをまとめてチェック。",
  slug: "royal-london",
  image:
    "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/royal-london-bg.jpeg",
};

// tour 静的2件
export const STATIC_TOURS = [
  {
    title: "ロンドン・スタジアムツアー完全ガイド",
    description: "プレミアリーグのスタジアム見学ツアー。",
    slug: "stadium-tours",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d2/London_Wembley.jpg",
    price: "£20.00〜（目安）",
    badge: "",
  },
  {
    title: "テムズ川ボートツアー",
    description: "水上から楽しむロンドン観光の王道。",
    slug: "thames-cruise",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/thamescruisebg.jpeg",
    price: "目安 £20〜",
    badge: "",
  },
];

/* -----------------------------------------------------
   共通：ランダム取得ヘルパー
----------------------------------------------------- */
function hashToUint32(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function todayKeyUTC() {
  return new Date().toISOString().slice(0, 10);
}

/* ===============================
   🔥 モジュール内キャッシュ
   （DBは1日1回・1リクエスト1回）
================================ */
let cachedPool: any[] | null = null;
let cachedDay: string | null = null;

async function getAttractionPool() {
  const day = todayKeyUTC();

  if (cachedPool && cachedDay === day) {
    return cachedPool;
  }

  // 👇 DBアクセスはここ1回だけ
  cachedPool = await db.attraction.findMany({
    where: {
      isPublished: true,
      OR: [
        { recommendLevel: 5 },
        { mustSee: true },
        { category: { in: ["seasonal", "royal", "tour"] } },
        { isForKids: true },
        { isFree: true },
      ],
    },
    orderBy: { slug: "asc" },
    take: 100,
  });

  cachedDay = day;
  return cachedPool;
}

/* ===============================
   共通ピック関数（DB触らない）
================================ */
function pick<T>(
  list: T[],
  filter: (a: T) => boolean,
  seed: number,
  take: number,
): T[] {
  const filtered = list.filter(filter);
  if (filtered.length === 0) return [];

  const offset = seed % filtered.length;
  return [...filtered.slice(offset), ...filtered.slice(0, offset)].slice(
    0,
    take,
  );
}

export async function getHighlightAttractions() {
  const pool = await getAttractionPool();
  const seed = hashToUint32(todayKeyUTC() + "highlight");

  const items = pick(pool, (a) => a.recommendLevel === 5, seed, 2);

  return [
    ...items.map((a) => ({
      title: a.name,
      subtitle: "おすすめ度★5",
      description: a.tagline || a.summary || "",
      slug: a.slug,
      image: a.image,
    })),
    STATIC_HIGHLIGHT_PASS,
  ];
}

export async function getMustSeeCategories() {
  const pool = await getAttractionPool();
  const seed = hashToUint32(todayKeyUTC() + "mustSee");

  const extra = pick(pool, (a) => a.mustSee, seed, 1);

  return [
    ...STATIC_MUST_SEE_CATEGORIES,
    ...extra.map((a) => ({
      title: a.name,
      description: a.tagline || a.summary || "",
      slug: a.slug,
      image: a.image,
    })),
  ];
}

export async function getSeasonalAttractions() {
  const pool = await getAttractionPool();
  const seed = hashToUint32(todayKeyUTC() + "seasonal");

  const items = pick(pool, (a) => a.category === "seasonal", seed, 1);

  return [
    STATIC_SEASONAL,
    ...items.map((a) => ({
      title: a.name,
      description: a.tagline || a.summary || "",
      slug: a.slug,
      image: a.image,
    })),
  ];
}

export async function getRoyalAttractions() {
  const pool = await getAttractionPool();
  const seed = hashToUint32(todayKeyUTC() + "royal");

  const items = pick(pool, (a) => a.category === "royal", seed, 2);

  return [
    STATIC_ROYAL,
    ...items.map((a) => ({
      title: a.name,
      description: a.tagline || a.summary || "",
      slug: a.slug,
      image: a.image,
      price: undefined,
    })),
  ];
}

export async function getTours() {
  const pool = await getAttractionPool();
  const seed = hashToUint32(todayKeyUTC() + "tour");

  const items = pick(pool, (a) => a.category === "tour", seed, 1);

  return [
    ...STATIC_TOURS,
    ...items.map((a) => ({
      title: a.name,
      description: a.tagline || a.summary || "",
      slug: a.slug,
      image: a.image,
      price: undefined,
      badge: "",
    })),
  ];
}

export async function getKidsAttractions() {
  const pool = await getAttractionPool();
  const seed = hashToUint32(todayKeyUTC() + "kids");

  return pick(pool, (a) => a.isForKids, seed, 2).map((a) => ({
    title: a.name,
    description: a.tagline || a.summary || "",
    slug: a.slug,
    image: a.image,
    price: undefined,
  }));
}

export async function getFreeAttractions() {
  const pool = await getAttractionPool();
  const seed = hashToUint32(todayKeyUTC() + "free");

  return pick(pool, (a) => a.isFree, seed, 3).map((a) => ({
    title: a.name,
    description: a.tagline || a.summary || "",
    slug: a.slug,
    image: a.image,
  }));
}
export async function getTodaysPicks(limit = 3) {
  // 日替わりキー（UTC。Asia/Tokyoにしたければ後述）
  const day = new Date().toISOString().slice(0, 10);
  const seed = hashToUint32(`todays-picks-${day}`);

  // 決定的なpivot（毎日変わる）
  const pivot = seed.toString(36);



  // ① pivot以降から取得（ここで終わることが多い）
  const first = await db.attraction.findMany({
    where: { slug: { gte: pivot }, isPublished: true },
    orderBy: { slug: "asc" },
    take: limit,
  });

  if (first.length === limit) {
    return first.map((a) => ({
      title: a.name,
      description: a.tagline || a.summary || "",
      slug: a.slug,
      image: a.image,
    }));
  }

  // ② 足りない分だけ先頭から補完
  const second = await db.attraction.findMany({
    where: { slug: { lt: pivot }, isPublished: true },
    orderBy: { slug: "asc" },
    take: limit - first.length,
  });

  const items = [...first, ...second];

  return items.map((a) => ({
    title: a.name,
    description: a.tagline || a.summary || "",
    slug: a.slug,
    image: a.image,
  }));
}
