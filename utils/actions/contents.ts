"use server";

import db from "../db";

export const fetchEvents2025 = async () => {
  const contents = await db.content.findMany({
    where: {
      category: "london-events-2025",
    },
    orderBy: { createdAt: "asc" },
  });
  return contents;
};
export const fetchMonthlyEvents2025 = async (slug: string) => {
  const content = await db.content.findFirst({
    // category を絞らないと、クリスマスマーケット等の別カテゴリの Content が
    // /events/<slug> でも同じ内容で描画され、canonical違いの重複ページになる
    where: { slug, category: "london-events-2025" },
    include: {
      sections: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });
  return content;
};

export const fetchColumns = async () => {
  const contents = await db.content.findMany({
    where: { category: "column" },
    orderBy: { createdAt: "desc" },
  });
  return contents;
};

export const fetchColumnBySlug = async (slug: string) => {
  // category を絞らないと他カテゴリの Content と slug が衝突しうる（既知のバグパターン）
  const content = await db.content.findFirst({
    where: { slug, category: "column" },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  return content;
};

// 連載コラムの詳細ページで、同じ連載の全話を回順に出すために使う。
// seriesName が無い単発コラムでは呼んでも空配列が返る。
export const fetchColumnSeries = async (seriesName: string | null) => {
  if (!seriesName) return [];
  const contents = await db.content.findMany({
    where: { category: "column", seriesName },
    orderBy: { seriesOrder: "asc" },
    select: { id: true, title: true, slug: true, seriesOrder: true },
  });
  return contents;
};

export type AdjacentContent = {
  title: string;
  slug: string;
};

/**
 * 一覧ページと同じ並び順(createdAt desc)での、現在記事の前後1件。
 * createdAt が同値のレコードがあっても取りこぼさないよう、id をタイブレークに使う。
 */
export const fetchAdjacentContents = async (
  category: "column" | "british-english" | "modern-britain",
  current: { id: string; createdAt: Date },
): Promise<{ prev: AdjacentContent | null; next: AdjacentContent | null }> => {
  const [newer, older] = await Promise.all([
    db.content.findFirst({
      where: {
        category,
        OR: [
          { createdAt: { gt: current.createdAt } },
          { createdAt: current.createdAt, id: { gt: current.id } },
        ],
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { title: true, slug: true },
    }),
    db.content.findFirst({
      where: {
        category,
        OR: [
          { createdAt: { lt: current.createdAt } },
          { createdAt: current.createdAt, id: { lt: current.id } },
        ],
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { title: true, slug: true },
    }),
  ]);

  // 一覧が createdAt desc(新しい順)なので、「次」は自分より新しい記事。
  return { prev: older, next: newer };
};

export const fetchBritishEnglishEntries = async () => {
  const contents = await db.content.findMany({
    where: { category: "british-english" },
    orderBy: { createdAt: "desc" },
  });
  return contents;
};

export const fetchBritishEnglishBySlug = async (slug: string) => {
  // category を絞らないと他カテゴリの Content と slug が衝突しうる（既知のバグパターン）
  const content = await db.content.findFirst({
    where: { slug, category: "british-english" },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  return content;
};

/**
 * 「英国のいまを論じる」。最新の英国ニュースを起点に、背景と意味を
 * 掘り下げる時事論考。category を分けているのは、同じ読み物でも
 * 「過去(column) vs いま」で読者の期待が違い、/column の一覧に混ぜると
 * 連載の性格がぼやけるため。予定表である /events とも役割が違う
 * (あちらは「今週何があるか」、こちらは「それが何を意味するか」)。
 */
export const fetchModernBritainEntries = async () => {
  const contents = await db.content.findMany({
    where: { category: "modern-britain" },
    orderBy: { createdAt: "desc" },
  });
  return contents;
};

export const fetchModernBritainBySlug = async (slug: string) => {
  // category を絞らないと他カテゴリの Content と slug が衝突しうる（既知のバグパターン）
  const content = await db.content.findFirst({
    where: { slug, category: "modern-britain" },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  return content;
};

export const fetchEvents2026 = async () => {
  const contents = await db.content.findMany({
    where: {
      category: "london-events-2026",
    },
    orderBy: { createdAt: "asc" },
  });
  return contents;
};
export const fetchMonthlyEvents2026 = async (slug: string) => {
  const content = await db.content.findFirst({
    where: { slug, category: "london-events-2026" },
    include: {
      sections: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });
  return content;
};

export const fetchEventsForMonth = async (year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return db.event.findMany({
    where: { startDate: { lt: end }, endDate: { gte: start } },
    orderBy: [{ startDate: "asc" }, { displayOrder: "asc" }],
  });
};

/**
 * 読み物の「人気の記事」を取り出す。
 *
 * 並べ替えキーは views(累計閲覧数)。閲覧数そのものは読者に出さない
 * 内部データで、ここでは順位付けにしか使わない。
 *
 * views=0 を除くのは、集計を始める前からある記事と「まだ誰も見ていない
 * 記事」を区別できないため。0 の行を混ぜると、単に古いだけの記事が
 * 「人気」として並ぶ。件数が足りないときは少なく返す。
 *
 * 同数のときは新しい順にする。閲覧数が伸びる前の新着が、古い記事の
 * 後ろに埋もれ続けるのを避けるため。
 */
export const fetchPopularContents = async (
  category: "column" | "british-english" | "modern-britain",
  take = 5,
) => {
  const contents = await db.content.findMany({
    where: { category, views: { gt: 0 } },
    orderBy: [{ views: "desc" }, { createdAt: "desc" }],
    take,
  });
  return contents;
};

/**
 * 読み物ハブ(/reading)の「いま読まれている記事」。
 *
 * fetchPopularContents との違いはカテゴリを跨ぐこと。ハブでは
 * コラム・イギリス英語・いまのイギリスを同じ土俵で並べたいので、
 * 3カテゴリまとめて views の降順に取る。
 *
 * views=0 を除く理由と同数時の扱いは fetchPopularContents と同じ。
 */
export const fetchPopularReadingContents = async (take = 5) => {
  const contents = await db.content.findMany({
    where: {
      category: { in: ["column", "british-english", "modern-britain"] },
      views: { gt: 0 },
    },
    orderBy: [{ views: "desc" }, { createdAt: "desc" }],
    take,
  });
  return contents;
};

/**
 * トップのヒーローに敷き詰める写真タイル。
 *
 * 写真を主役にするので、条件は「画像があること」ではなく
 * 「その画像が大きく出して耐えること」。mustSee かつ recommendLevel 最上位に
 * 絞っているのはそのため。件数を増やすと建物の一部だけを写した資料写真が
 * 混ざり、ヒーローの見栄えがそこで崩れる。
 *
 * 英語名は写真のキャプションに出すため必須にしている。日本語名だけの
 * スポットは、白抜きの英字キャプションという意匠が成立しない。
 *
 * tagline は主役タイル(2x2)にだけ出す一言。小さいタイルには入らない。
 */
export const fetchHeroSlides = async (take = 5) => {
  const rows = await db.attraction.findMany({
    where: {
      isPublished: true,
      mustSee: true,
      recommendLevel: 5,
      engName: { not: null },
    },
    select: {
      slug: true,
      name: true,
      engName: true,
      image: true,
      tagline: true,
    },
    orderBy: { name: "asc" },
    take,
  });

  return rows.filter(
    (r): r is typeof r & { engName: string } => Boolean(r.image && r.engName)
  );
};
