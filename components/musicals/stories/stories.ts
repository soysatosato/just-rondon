import type { Metadata } from "next";
import { buildPageMetadata, fitTitle } from "@/lib/seo";
import type { MusicalStory } from "./types";
import { lesMiserablesStory } from "./content/les-miserables";

/**
 * あらすじ専用ページを持つ作品の登録簿。
 *
 * ここに載っている作品だけが /musicals/<slug>/story を持つ。全31作品に
 * 一斉に生やさないのは、DB のカラムを並べ替えただけのページを大量に
 * 出すことが、artworks・songs を noindex に追い込んだ低品質判定と
 * 同じ形だから。1本ずつ人が書き、順位が動いたことを確認してから足す。
 *
 * ★ 足したら next-sitemap.config.js の musicalStorySlugs にも
 *   同じ slug を書くこと。あちらは CJS でこの TS を読めない。
 */
const STORIES: MusicalStory[] = [lesMiserablesStory];

const BY_SLUG = new Map(STORIES.map((story) => [story.slug, story]));

// slug の綴り間違いは「404 になるページ」という静かな壊れ方をするので、
// 重複だけは読み込み時に弾いておく。
if (BY_SLUG.size !== STORIES.length) {
  throw new Error("あらすじ原稿の slug が重複しています");
}

/** 登録済みの slug。generateStaticParams と sitemap の突き合わせに使う。 */
export const musicalStorySlugs = STORIES.map((story) => story.slug);

/** 原稿を引く。無ければ undefined(呼び出し側で notFound)。 */
export function getMusicalStory(slug: string): MusicalStory | undefined {
  return BY_SLUG.get(slug);
}

/** あらすじページのパス。 */
export function musicalStoryPath(slug: string): string {
  return `/musicals/${slug}/story`;
}

/** その作品にあらすじページがあるか。作品ページからの導線の出し分けに使う。 */
export function hasMusicalStory(slug: string): boolean {
  return BY_SLUG.has(slug);
}

/**
 * あらすじページの metadata。
 *
 * タイトルは検索語の順に「作品名 → あらすじ」で始める。実際に来ている
 * のは「レミゼラブル あらすじ」「レミゼラブル ネタバレ」「レミゼラブル
 * 結末」「レミゼラブル 内容」で、これらは作品ページ
 * (「…｜あらすじ・見どころ・チケット」)が21〜36位で受けていた。
 * あちらは上演時間・劇場・チケットも背負うページなので、あらすじの
 * 語だけを先頭に寄せた専用URLを別に立てている。
 *
 * fitTitle で長さを詰めるのは、作品名が長い演目にも同じ関数で
 * 対応するため。「あらすじ」だけは必ず入る長さを最後に置く。
 */
export function buildMusicalStoryMetadata(story: MusicalStory): Metadata {
  return buildPageMetadata({
    path: musicalStoryPath(story.slug),
    title: fitTitle(story.searchName, [
      "のあらすじ｜登場人物と結末までのネタバレ解説",
      "のあらすじ｜登場人物と結末まで解説",
      "のあらすじと結末｜ネタバレ解説",
      "のあらすじと結末",
      "のあらすじ",
    ]),
    titleSuffix: false,
    description: story.description,
    type: "article",
    modifiedTime: new Date(story.updatedAt).toISOString(),
  });
}
