"use server";

import db from "../db";
import { draftMode } from "next/headers";
import { MIN_WEEKLY, fetchWeeklyTopIds, orderByIds } from "../rankings";
import { publishedWhere, type ReadingCategory } from "@/lib/publish-schedule";

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

/**
 * 詳細ページ(slug で1件引く)の公開条件。
 *
 * 管理ページのプレビュー(Next の draft mode)中だけは、下書きと予約中も
 * 引けるようにする。draft mode の cookie は /api/admin/preview が運営者にだけ
 * 発行し、値はビルドごとの秘密なので外から作れない。
 *
 * 一覧・ランキング・前後の記事はプレビュー中でも公開済みだけにする。
 * 見たいのは記事そのものの見た目で、まだ出ていない記事が一覧に混ざった
 * 画面を見ても確認にならない。
 */
function visibleWhere() {
  return draftMode().isEnabled ? {} : publishedWhere();
}

export const fetchColumns = async () => {
  const contents = await db.content.findMany({
    where: { category: "column", ...publishedWhere() },
    orderBy: { publishedAt: "desc" },
  });
  return contents;
};

export const fetchColumnBySlug = async (slug: string) => {
  // category を絞らないと他カテゴリの Content と slug が衝突しうる（既知のバグパターン）
  const content = await db.content.findFirst({
    where: { slug, category: "column", ...visibleWhere() },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  return content;
};

// 連載コラムの詳細ページで、同じ連載の全話を回順に出すために使う。
// seriesName が無い単発コラムでは呼んでも空配列が返る。
export const fetchColumnSeries = async (seriesName: string | null) => {
  if (!seriesName) return [];
  const contents = await db.content.findMany({
    where: { category: "column", seriesName, ...publishedWhere() },
    orderBy: { seriesOrder: "asc" },
    select: { id: true, title: true, slug: true, seriesOrder: true },
  });
  return contents;
};

/**
 * 記事に紐づけた観光スポット。コラムと街の詳細の末尾に出す。
 *
 * 対応は ContentAttraction に人が登録したものだけ(名前一致で自動には出さない。
 * 理由はスキーマのコメント)。終了した期間限定の催しなど、非公開の
 * スポットは詳細ページが無いので落とす。
 */
export const fetchContentAttractions = async (contentId: string) => {
  const links = await db.contentAttraction.findMany({
    where: { contentId, attraction: { isPublished: true } },
    orderBy: { displayOrder: "asc" },
    select: {
      attraction: { select: { slug: true, name: true, image: true } },
    },
  });
  return links.map((l) => l.attraction);
};

export type AdjacentContent = {
  title: string;
  slug: string;
};

/**
 * 一覧ページと同じ並び順(publishedAt desc)での、現在記事の前後1件。
 * publishedAt が同値のレコードがあっても取りこぼさないよう、id をタイブレークに使う。
 *
 * 新しい側は予約中の記事に当たりうるので、両側とも公開済みに絞る。
 * 下書きのプレビュー(publishedAt が null)では前後を出さない。
 */
export const fetchAdjacentContents = async (
  category: ReadingCategory,
  current: { id: string; publishedAt: Date | null },
): Promise<{ prev: AdjacentContent | null; next: AdjacentContent | null }> => {
  const at = current.publishedAt;
  if (!at) return { prev: null, next: null };

  const [newer, older] = await Promise.all([
    db.content.findFirst({
      where: {
        category,
        ...publishedWhere(),
        OR: [
          { publishedAt: { gt: at } },
          { publishedAt: at, id: { gt: current.id } },
        ],
      },
      orderBy: [{ publishedAt: "asc" }, { id: "asc" }],
      select: { title: true, slug: true },
    }),
    db.content.findFirst({
      where: {
        category,
        ...publishedWhere(),
        OR: [
          { publishedAt: { lt: at } },
          { publishedAt: at, id: { lt: current.id } },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      select: { title: true, slug: true },
    }),
  ]);

  // 一覧が publishedAt desc(新しい順)なので、「次」は自分より新しい記事。
  return { prev: older, next: newer };
};

export const fetchBritishEnglishEntries = async () => {
  const contents = await db.content.findMany({
    where: { category: "british-english", ...publishedWhere() },
    orderBy: { publishedAt: "desc" },
  });
  return contents;
};

export const fetchBritishEnglishBySlug = async (slug: string) => {
  // category を絞らないと他カテゴリの Content と slug が衝突しうる（既知のバグパターン）
  const content = await db.content.findFirst({
    where: { slug, category: "british-english", ...visibleWhere() },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  return content;
};

/**
 * 「ロンドンの街」。1エリア1本で、地名の由来から今日の治安・家賃までを
 * 辿る読みもの。category を分けているのは、コラムの一覧に混ぜると
 * 「街を調べに来た読者」が目的の記事を見つけられなくなるため。
 *
 * 観光の「エリアガイド」(/sightseeing/areas)とも役割が違う。あちらは
 * 半日で歩く順路を6エリアぶん載せた案内で、こちらは住宅地も含めた
 * 街そのものの記録である。
 */
export const fetchModernBritainEntries = async () => {
  const contents = await db.content.findMany({
    where: { category: "modern-britain", ...publishedWhere() },
    orderBy: { publishedAt: "desc" },
  });
  return contents;
};

export const fetchModernBritainBySlug = async (slug: string) => {
  // category を絞らないと他カテゴリの Content と slug が衝突しうる（既知のバグパターン）
  const content = await db.content.findFirst({
    where: { slug, category: "modern-britain", ...visibleWhere() },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  return content;
};

export const fetchAreaEntries = async () => {
  const contents = await db.content.findMany({
    where: { category: "area", ...publishedWhere() },
    orderBy: { publishedAt: "desc" },
  });
  return contents;
};

export const fetchAreaBySlug = async (slug: string) => {
  // category を絞らないと他カテゴリの Content と slug が衝突しうる（既知のバグパターン）
  const content = await db.content.findFirst({
    where: { slug, category: "area", ...visibleWhere() },
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
  category: ReadingCategory,
  take = 5,
) => {
  const contents = await db.content.findMany({
    where: { category, views: { gt: 0 }, ...publishedWhere() },
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take,
  });
  return contents;
};

/**
 * DailyView.targetType と Content.category の対応。
 *
 * 記録側(/api/views の TARGETS)は camelCase のキーで、Content 側は
 * ケバブケースの category。集計 id を引くときと実体を引き直すときで
 * 別の文字列が要るので、ここで突き合わせる。
 */
const WEEKLY_TARGET_BY_CATEGORY = {
  column: "column",
  "british-english": "britishEnglish",
  area: "area",
  "modern-britain": "modernBritain",
} as const;

/**
 * 各読み物セクションの「今週読まれている記事」。
 *
 * fetchWeeklyPopularReadingContents (/reading 用) との違いは、カテゴリを
 * 跨がずに 1 セクションだけを数えること。/column や /british-english の
 * ハブでは、そのセクションの中での順位でないと意味がない。
 *
 * 集計元は DailyView。運用開始直後は行が無い。件数が MIN_WEEKLY に
 * 届かないうちは空で返すので、呼び出し側は「週間が空なら総合を主役に
 * 戻す」を必ず用意すること。
 */
export const fetchWeeklyPopularContents = async (
  category: ReadingCategory,
  take = 5,
) => {
  const ids = await fetchWeeklyTopIds(
    WEEKLY_TARGET_BY_CATEGORY[category],
    take,
  );
  if (ids.length === 0) return [];

  const contents = await db.content.findMany({
    where: { id: { in: ids }, category, ...publishedWhere() },
  });

  const ranked = orderByIds(ids, contents, take);
  return ranked.length >= MIN_WEEKLY ? ranked : [];
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
      ...publishedWhere(),
    },
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take,
  });
  return contents;
};

/**
 * 読み物ハブ(/reading)の「今週読まれている記事」。
 *
 * 累計(fetchPopularReadingContents)と違い、直近7日の閲覧だけを数える。
 * 累計は上位が古い記事で固定されるため、ハブのいちばん目立つ場所が
 * 何ヶ月も同じ顔になる。週間はそこを毎週入れ替えるための軸。
 *
 * 集計元は DailyView。運用開始直後は行が無い。件数が MIN_WEEKLY に
 * 届かないうちは空で返すので、呼び出し側は「週間が空なら総合を主役に
 * 戻す」を必ず用意すること。
 */
export const fetchWeeklyPopularReadingContents = async (take = 5) => {
  const ids = await fetchWeeklyTopIds(
    ["column", "britishEnglish", "modernBritain"],
    take,
  );
  if (ids.length === 0) return [];

  const contents = await db.content.findMany({
    where: {
      id: { in: ids },
      category: { in: ["column", "british-english", "modern-britain"] },
      ...publishedWhere(),
    },
  });

  const ranked = orderByIds(ids, contents, take);
  return ranked.length >= MIN_WEEKLY ? ranked : [];
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
