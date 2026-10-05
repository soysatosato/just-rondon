import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import { eventGuidePath, pickEdition, type EventGuide } from "./index";

/**
 * 年中行事ガイドの title。開催が先にあるときだけ年を入れる。
 *
 * 年は URL には入れず、title と本文にだけ書く(「チェルシーフラワーショー 2027」
 * のように年付きで探されるため)。次回が未発表のあいだは、終わった年を
 * title に掲げないよう年を外す。
 */
export function eventGuideTitle(guide: EventGuide, today: string): string {
  const { edition, upcoming } = pickEdition(guide, today);
  const name = upcoming ? `${guide.title} ${edition.year}` : guide.title;
  return `${name}｜${guide.titleSuffix}`;
}

export function buildEventGuideMetadata(
  guide: EventGuide,
  today: string
): Metadata {
  const { edition } = pickEdition(guide, today);
  return buildPageMetadata({
    path: eventGuidePath(guide),
    title: eventGuideTitle(guide, today),
    description: guide.description,
    keywords: guide.keywords,
    type: "article",
    modifiedTime: new Date(`${edition.checkedAt}T12:00:00Z`).toISOString(),
  });
}
