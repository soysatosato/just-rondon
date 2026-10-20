"use server";

import { unstable_cache } from "next/cache";

import db from "../db";
import { publishedWhere } from "@/lib/publish-schedule";

/**
 * トップページの写真列(PhotoRail)に渡す1枚ぶん。
 *
 * 列ごとに元のテーブルは違うが、カードの意匠は全部同じにする。
 * 「写真・日本語名・英字名・一言」の4つだけに揃えているのは、
 * 出自の違う行を同じ棚に並べたときに、テーブルごとに情報量が
 * 変わるとトップが継ぎ接ぎに見えるため。
 *
 * id は週間の閲覧順(utils/rankings.ts)で並べ替えるときの鍵。閲覧を
 * 数えていない表(料理・お土産)や、他のページが組む棚では持たない。
 */
export type RailItem = {
  id?: string;
  slug: string;
  href: string;
  name: string;
  engName: string | null;
  image: string;
  blurb: string | null;
};

type PhotoRow = {
  id: string;
  slug: string;
  name: string;
  engName?: string | null;
  image: string | null;
  tagline?: string | null;
  blurb?: string | null;
};

// 画像が無い行は列に混ぜない。写真の棚に文字だけのカードが
// 1枚混ざると、その1枚のせいで列全体が崩れて見える。
function toItems(rows: PhotoRow[], base: string): RailItem[] {
  return rows
    .filter((row) => Boolean(row.image))
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      href: `${base}/${row.slug}`,
      name: row.name,
      engName: row.engName ?? null,
      image: row.image as string,
      blurb: row.tagline ?? row.blurb ?? null,
    }));
}

const PHOTO_SELECT = {
  id: true,
  slug: true,
  name: true,
  engName: true,
  image: true,
  tagline: true,
} as const;

/**
 * トップの写真列は本文を一切使わないので、専用に細い select を書く。
 *
 * 既存の fetchMustSeeAttractions / fetchTop10Museums / fetchDishes は
 * 詳細ページ向けに行を丸ごと返す。トップで使うと markdown 本文まで
 * 読むことになり、5列ぶんで数百KB を捨てることになる。
 *
 * seed からしか変わらないデータなので、まとめて1日キャッシュする。
 * 名所だけ多めに取るのは、ヒーローに出した名所を棚から外すため
 * (外したあとも12枚は残したい)。
 */
export const fetchHomeRails = unstable_cache(
  async () => {
    const [attractions, museums, musicals, dishes, souvenirs] =
      await Promise.all([
        db.attraction.findMany({
          where: { isPublished: true, mustSee: true },
          select: PHOTO_SELECT,
          orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
          take: 18,
        }),
        db.museum.findMany({
          where: { recommendLevel: 5 },
          select: PHOTO_SELECT,
          orderBy: { createdAt: "asc" },
          take: 12,
        }),
        db.musical.findMany({
          where: { mustSee: true },
          select: PHOTO_SELECT,
          orderBy: { recommendLevel: "desc" },
          take: 12,
        }),
        db.dish.findMany({
          where: { image: { not: null } },
          select: PHOTO_SELECT,
          orderBy: { displayOrder: "asc" },
          take: 12,
        }),
        db.souvenir.findMany({
          where: { image: { not: null } },
          select: {
            id: true,
            slug: true,
            name: true,
            engName: true,
            image: true,
            blurb: true,
          },
          orderBy: [{ recommendLevel: "desc" }, { displayOrder: "asc" }],
          take: 12,
        }),
      ]);

    return {
      attractions: toItems(attractions, "/sightseeing"),
      museums: toItems(museums, "/museums"),
      musicals: toItems(musicals, "/musicals"),
      dishes: toItems(dishes, "/restaurants"),
      souvenirs: toItems(souvenirs, "/souvenirs"),
    };
  },
  ["home-rails"],
  { revalidate: 60 * 60 * 24 },
);

/**
 * ヒーローに出す季節の場所。月(ロンドン時間、1〜12)ごとに、先頭が主役の大きなタイル。
 *
 * 以前のヒーローは「必見・おすすめ度5」の名所を名前順に6件取っていて、
 * 1年中同じ6枚だった。しかも同じ名所が下の「見逃せない名所」の棚にも
 * 同じ順で出ていた(2026-10-19 の調査で6枚中5枚が重複)。
 *
 * ここには、その時期に行く理由がある場所だけを置く。10月は紅葉の庭園と
 * ハーフタームのハンプトン・コート、11〜12月はクリスマスの催しが立つ場所。
 * 会期のある催し(ウィンター・ワンダーランドなど)は、会期にかかる月にだけ入れる。
 * slug は 2026-10-19 に、公開中で写真と英語名がある行だと確かめた。
 * 行が消えたり写真が外れたりしたら、そのタイルは飛ばして必見の名所で埋める。
 */
const SEASONAL_HERO: Partial<Record<number, string[]>> = {
  10: [
    "kew-gardens-london",
    "hampton-court-palace",
    "richmond-park",
    "greenwich-park",
    "regents-park",
    "hyde-park-london",
  ],
  11: [
    "hyde-park-winter-wonderland",
    "covent-garden",
    "somerset-house",
    "kew-gardens-london",
    "chelsea-winter-village",
    "fortnum-and-mason",
  ],
  12: [
    "hyde-park-winter-wonderland",
    "covent-garden",
    "somerset-house",
    "christmas-lights-london-bus-tour",
    "hamleys-regent-street",
    "leadenhall-market-london",
  ],
};

/** ヒーローのモザイクは主役1枚+小さい5枚で格子が埋まる(HeroMosaic.tsx)。 */
const HERO_TILES = 6;

/**
 * ヒーローの6枚。季節の場所を先に、足りなければ必見の名所で埋める。
 *
 * 必見の名所は月ごとに並びの頭をずらす。季節の場所を決めていない月も、
 * 月が替われば表紙の顔が変わるようにするため。
 */
export const fetchHeroTiles = unstable_cache(
  async (month: number) => {
    const picks = SEASONAL_HERO[month] ?? [];
    // 名所の image は必須の列なので、空文字だけを外す(英語名はタイルに出す)。
    const photoReady = { engName: { not: null }, image: { not: "" } };

    const [seasonal, mustSee] = await Promise.all([
      picks.length > 0
        ? db.attraction.findMany({
            where: { isPublished: true, slug: { in: picks }, ...photoReady },
            select: PHOTO_SELECT,
          })
        : Promise.resolve([]),
      db.attraction.findMany({
        where: {
          isPublished: true,
          mustSee: true,
          recommendLevel: 5,
          ...photoReady,
        },
        select: PHOTO_SELECT,
        orderBy: { name: "asc" },
      }),
    ]);

    const bySlug = new Map(seasonal.map((row) => [row.slug, row]));
    const ordered = picks.flatMap((slug) => {
      const row = bySlug.get(slug);
      return row ? [row] : [];
    });

    const offset = mustSee.length > 0 ? (month * 2) % mustSee.length : 0;
    const rotated = [...mustSee.slice(offset), ...mustSee.slice(0, offset)];
    const taken = new Set(ordered.map((row) => row.slug));
    const rows = [
      ...ordered,
      ...rotated.filter((row) => !taken.has(row.slug)),
    ].slice(0, HERO_TILES);

    return toItems(rows, "/sightseeing");
  },
  ["home-hero-tiles"],
  { revalidate: 60 * 60 * 24 },
);

/**
 * 「このサイトの書き方」に出す掲載数。数字は手で書かず、ここで数える。
 * 読み物は公開済み(予約中・下書きを除く)のコラム・イギリス英語・英国のいま。
 */
export const fetchSiteCounts = unstable_cache(
  async () => {
    const [attractions, museums, musicals, reading] = await Promise.all([
      db.attraction.count({ where: { isPublished: true } }),
      db.museum.count(),
      db.musical.count(),
      db.content.count({
        where: {
          category: { in: ["column", "british-english", "modern-britain"] },
          ...publishedWhere(),
        },
      }),
    ]);
    return { attractions, museums, musicals, reading };
  },
  ["home-site-counts"],
  { revalidate: 60 * 60 * 24 },
);
