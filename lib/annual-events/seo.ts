import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import {
  photoOgImage,
  photoVersion,
  type OgPhotoRatio,
} from "@/lib/og";
import type { ContentPhoto } from "@/lib/content-photo";
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

/**
 * ガイドの写真を、写真だけの画像(lib/og.ts の photoOgImage)の URL にする。
 * og:image と JSON-LD の image の両方がこれを使う。
 */
export function eventGuidePhotoImage(
  guide: EventGuide,
  photo: ContentPhoto,
  ratio: OgPhotoRatio = "16x9"
) {
  return photoOgImage(
    "events",
    { slug: guide.slug, alt: photo.alt, version: photoVersion(photo.url) },
    ratio
  );
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
    // 写真のあるガイドは写真だけの画像を共有画像にする(Discover の画像の条件)。
    ...(guide.photo ? { images: [eventGuidePhotoImage(guide, guide.photo)] } : {}),
  });
}
