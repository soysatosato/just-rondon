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
async function getRandom(where: any, take: number) {
  const count = await db.attraction.count({ where });
  if (count === 0) return [];
  if (count <= take) return db.attraction.findMany({ where });

  const skip = Math.floor(Math.random() * (count - take + 1));

  return db.attraction.findMany({ where, skip, take });
}

export async function getHighlightAttractions() {
  const items = await getRandom({ recommendLevel: 5 }, 2);

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
  const extra = await getRandom({ mustSee: true }, 1);

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
  const items = await getRandom({ category: "seasonal" }, 3);

  return [
    ...items.map((a) => ({
      title: a.name,
      description: a.tagline || a.summary || "",
      slug: a.slug,
      image: a.image,
    })),
    STATIC_SEASONAL,
  ];
}

export async function getRoyalAttractions() {
  const items = await getRandom({ category: "royal" }, 3);

  return [
    ...items.map((a) => ({
      title: a.name,
      description: a.tagline || a.summary || "",
      slug: a.slug,
      image: a.image,
      price: undefined,
    })),
    STATIC_ROYAL,
  ];
}

export async function getTours() {
  const items = await getRandom({ category: "tour" }, 3);

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
  const items = await getRandom({ isForKids: true }, 4);
  return items.map((a) => ({
    title: a.name,
    description: a.summary || a.tagline || "",
    slug: a.slug,
    image: a.image,
    price: undefined,
  }));
}

export async function getFreeAttractions() {
  const items = await getRandom({ isFree: true }, 3);
  return items.map((a) => ({
    title: a.name,
    description: a.summary || a.tagline || "",
    slug: a.slug,
    image: a.image,
  }));
}

async function getRandomAttractions(limit: number) {
  const ids = await db.attraction.findMany({
    select: { id: true },
  });

  if (ids.length === 0) return [];

  const shuffled = ids.sort(() => Math.random() - 0.5).slice(0, limit);
  const pickIds = shuffled.map((i) => i.id);

  return db.attraction.findMany({
    where: { id: { in: pickIds } },
  });
}

export async function getTodaysPicks(count = 3) {
  const items = await getRandomAttractions(count);
  return items.map((a) => ({
    title: a.name,
    description: a.tagline || a.summary || "",
    slug: a.slug,
    image: a.image,
  }));
}
