"use server";

import { unstable_cache } from "next/cache";

import db from "../db";
import type { RailItem } from "./home";

/**
 * 「体験する」ハブ(/things-to-do)に出す写真。
 *
 * このハブは長く文字だけの索引だった。配下5セクションの実体は
 * ミュージカル31件・料理10件・お土産16件・ブランド19件と、すべて
 * 写真つきで DB に入っているのに、区分ハブでは名前しか出しておらず、
 * 「この街でしかできないこと」を説明はするが見せていなかった。
 *
 * 本文は一切使わないので、トップの fetchHomeRails と同じく専用の細い
 * select を書く。詳細ページ向けの fetchDishes 等をそのまま呼ぶと
 * markdown 本文まで読むことになり、6列ぶんで数百KBを捨てることになる。
 * seed からしか変わらない行なので、まとめて1日キャッシュする。
 */

/**
 * 「買い物」は専用テーブルを持たない。マーケットもデパートも解説は
 * 静的ページ側にあり、DB にあるのは場所としての Attraction だけなので、
 * 写真と行き先はそちらから借りる。
 *
 * slug を手で並べているのは、名前で「マーケット」を機械的に拾うと
 * スポットの増減で並びが変わってしまうため。非公開になった slug は
 * 結果から落ちるだけなので、伏せても穴が空くだけで壊れない。
 */
const SHOPPING_SPOT_SLUGS = [
  "borough-market",
  "columbia-road-flower-market",
  "camden-lock-market",
  "leadenhall-market-london",
  "harrods-london",
] as const;

/**
 * テーマ巡りも同じ事情だが、こちらは行き先が解説ページ側なので
 * 名前と一文は Attraction のものを使わず、テーマとして書き下ろす。
 * Attraction から借りるのは画像だけ。
 */
const THEME_SPOTS: {
  /** 画像を借りる Attraction。 */
  slug: string;
  href: string;
  name: string;
  engName: string;
  blurb: string;
}[] = [
  {
    slug: "warner-bros-studio-tour-harry-potter",
    href: "/sightseeing/harry-potter",
    name: "ハリー・ポッター",
    engName: "Wizarding World",
    blurb: "スタジオツアーの取り方と、街に残る撮影地。",
  },
  {
    slug: "movie-statue-street-leicester-square",
    href: "/sightseeing/film-locations",
    name: "映画・ドラマのロケ地",
    engName: "Film Locations",
    blurb: "あの場面の実際の場所へ。行き方と見え方。",
  },
  {
    slug: "arsenal-emirates-stadium-tour",
    href: "/sightseeing/football",
    name: "プレミアリーグ観戦",
    engName: "Football",
    blurb: "チケットの取り方と、当日の過ごし方。",
  },
  {
    slug: "london-tower-bridge",
    href: "/sightseeing/thames-cruise",
    name: "テムズ川クルーズ",
    engName: "Thames Cruise",
    blurb: "移動しながら見る。乗り場ごとの向き不向き。",
  },
];

const PHOTO_SELECT = {
  slug: true,
  name: true,
  engName: true,
  image: true,
  tagline: true,
} as const;

type PhotoRow = {
  slug: string;
  name: string;
  engName?: string | null;
  image: string | null;
  tagline?: string | null;
  blurb?: string | null;
};

/** 画像の無い行は混ぜない。写真の面に文字だけのタイルが1枚入ると面が崩れる。 */
const toItems = (rows: PhotoRow[], base: string): RailItem[] =>
  rows
    .filter((row) => Boolean(row.image))
    .map((row) => ({
      slug: row.slug,
      href: `${base}/${row.slug}`,
      name: row.name,
      engName: row.engName ?? null,
      image: row.image as string,
      blurb: row.tagline ?? row.blurb ?? null,
    }));

export const fetchThingsToDoPhotos = unstable_cache(
  async () => {
    const [musicals, dishes, brands, souvenirs, spots] = await Promise.all([
      db.musical.findMany({
        select: PHOTO_SELECT,
        // name まで入れているのは同着の並びを固定するため。ここが揺れると
        // ヒーローの主役写真がビルドのたびに入れ替わる。
        orderBy: [{ mustSee: "desc" }, { recommendLevel: "desc" }, { name: "asc" }],
        take: 12,
      }),
      db.dish.findMany({
        where: { image: { not: null } },
        select: PHOTO_SELECT,
        orderBy: { displayOrder: "asc" },
        take: 12,
      }),
      db.brand.findMany({
        where: { image: { not: null } },
        select: { slug: true, name: true, engName: true, image: true, blurb: true },
        orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
        take: 8,
      }),
      db.souvenir.findMany({
        where: { image: { not: null } },
        select: { slug: true, name: true, engName: true, image: true, blurb: true },
        orderBy: [
          { recommendLevel: "desc" },
          { displayOrder: "asc" },
          { name: "asc" },
        ],
        take: 8,
      }),
      db.attraction.findMany({
        where: {
          isPublished: true,
          slug: {
            in: [
              ...SHOPPING_SPOT_SLUGS,
              ...THEME_SPOTS.map((theme) => theme.slug),
            ],
          },
        },
        select: PHOTO_SELECT,
      }),
    ]);

    const spotBySlug = new Map(spots.map((spot) => [spot.slug, spot]));

    const shopping = toItems(
      SHOPPING_SPOT_SLUGS.map((slug) => spotBySlug.get(slug)).filter(
        (row): row is (typeof spots)[number] => Boolean(row),
      ),
      "/sightseeing",
    );

    const themes: RailItem[] = THEME_SPOTS.flatMap((theme) => {
      const image = spotBySlug.get(theme.slug)?.image;
      if (!image) return [];
      return [
        {
          slug: theme.slug,
          href: theme.href,
          name: theme.name,
          engName: theme.engName,
          image,
          blurb: theme.blurb,
        },
      ];
    });

    return {
      musicals: toItems(musicals, "/musicals"),
      dishes: toItems(dishes, "/restaurants"),
      brands: toItems(brands, "/brands"),
      souvenirs: toItems(souvenirs, "/souvenirs"),
      shopping,
      themes,
    };
  },
  ["things-to-do-photos"],
  { revalidate: 60 * 60 * 24 },
);
