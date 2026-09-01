"use server";

import { unstable_cache } from "next/cache";

import db from "../db";

/**
 * トップページの写真列(PhotoRail)に渡す1枚ぶん。
 *
 * 列ごとに元のテーブルは違うが、カードの意匠は全部同じにする。
 * 「写真・日本語名・英字名・一言」の4つだけに揃えているのは、
 * 出自の違う行を同じ棚に並べたときに、テーブルごとに情報量が
 * 変わるとトップが継ぎ接ぎに見えるため。
 */
export type RailItem = {
  slug: string;
  href: string;
  name: string;
  engName: string | null;
  image: string;
  blurb: string | null;
};

/**
 * トップの写真列は本文を一切使わないので、専用に細い select を書く。
 *
 * 既存の fetchMustSeeAttractions / fetchTop10Museums / fetchDishes は
 * 詳細ページ向けに行を丸ごと返す。トップで使うと markdown 本文まで
 * 読むことになり、5列ぶんで数百KB を捨てることになる。
 *
 * seed からしか変わらないデータなので、まとめて1日キャッシュする。
 */
export const fetchHomeRails = unstable_cache(
  async () => {
    const [attractions, museums, musicals, dishes, souvenirs] =
      await Promise.all([
        db.attraction.findMany({
          where: { isPublished: true, mustSee: true },
          select: {
            slug: true,
            name: true,
            engName: true,
            image: true,
            tagline: true,
            // 旅行プラン導線のタイルに出す2つ。ここに相乗りさせているのは、
            // トップのためだけに attraction をもう一度引くと、静的生成時の
            // 同時接続がプールの上限(9)を超えてトップの書き出しが落ちるため。
            priceAdult: true,
            durationText: true,
          },
          orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
          take: 12,
        }),
        db.museum.findMany({
          where: { recommendLevel: 5 },
          select: {
            slug: true,
            name: true,
            engName: true,
            image: true,
            tagline: true,
          },
          orderBy: { createdAt: "asc" },
          take: 12,
        }),
        db.musical.findMany({
          where: { mustSee: true },
          select: {
            slug: true,
            name: true,
            engName: true,
            image: true,
            tagline: true,
          },
          orderBy: { recommendLevel: "desc" },
          take: 12,
        }),
        db.dish.findMany({
          where: { image: { not: null } },
          select: {
            slug: true,
            name: true,
            engName: true,
            image: true,
            tagline: true,
          },
          orderBy: { displayOrder: "asc" },
          take: 12,
        }),
        db.souvenir.findMany({
          where: { image: { not: null } },
          select: {
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

    // 画像が無い行は列に混ぜない。写真の棚に文字だけのカードが
    // 1枚混ざると、その1枚のせいで列全体が崩れて見える。
    const toItems = (
      rows: {
        slug: string;
        name: string;
        engName?: string | null;
        image: string | null;
        tagline?: string | null;
        blurb?: string | null;
      }[],
      base: string,
    ): RailItem[] =>
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

    return {
      attractions: toItems(attractions, "/sightseeing"),
      /**
       * トップの旅行プラン導線に出す押せるタイル。棚(RailItem)とは
       * 必要な列が違う(あちらは一言、こちらは料金と所要)ので別に組む。
       * 元は同じ mustSee の行なので、問い合わせは増えない。
       */
      planTiles: attractions
        .filter((row) => Boolean(row.image))
        .slice(0, 6)
        .map((row) => ({
          slug: row.slug,
          name: row.name,
          image: row.image as string,
          priceAdult: row.priceAdult,
          durationText: row.durationText,
        })),
      museums: toItems(museums, "/museums"),
      musicals: toItems(musicals, "/musicals"),
      dishes: toItems(dishes, "/restaurants"),
      souvenirs: toItems(souvenirs, "/souvenirs"),
    };
  },
  ["home-rails"],
  { revalidate: 60 * 60 * 24 },
);
