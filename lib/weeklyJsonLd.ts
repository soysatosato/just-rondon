import type { WeeklyBrief } from "@prisma/client";
import { SITE_PUBLISHER } from "@/lib/jsonld";
import { OG_PHOTO_RATIOS, issuePhotoOgImage, weeklyOgImage } from "@/lib/og";
import { absoluteImage } from "@/lib/seo";

/**
 * 号の構造化データ。号そのものを Article として出す。
 *
 * 以前は号の中の催し(日付があって参加できるもの)を Event として並べていたが、
 * やめた。Google のイベントの構造化データは「1つのイベントを扱うページ」だけが
 * 対象で、各イベントに専用のURLが要る(MUST)。予定を何件も並べるページへの
 * マークアップは対象外で、ガイドラインに反すると手動による対策の理由になる。
 * そのうえイベントの検索表示は日本語では提供されていない
 * (developers.google.com/search/docs/appearance/structured-data/event)。
 * 得るものが無く、違反のおそれだけがあった。
 *
 * pageUrl は号を正として出すページ。最新号は /events を正にしているので、
 * /events ではそちらを渡す。
 */
export function buildBriefJsonLd(brief: WeeklyBrief, { pageUrl }: { pageUrl: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: brief.title,
    description: brief.headline,
    inLanguage: "ja",
    mainEntityOfPage: pageUrl,
    datePublished: brief.createdAt.toISOString(),
    dateModified: brief.updatedAt.toISOString(),
    // 写真のある号は、写真を文字なしの 16:9・4:3・1:1 に切り抜いた3枚
    // (ページの題字の下と同じ写真)。無い号は号の共有カード(og:image と同じ)。
    image: brief.image
      ? OG_PHOTO_RATIOS.map((ratio) =>
          absoluteImage(issuePhotoOgImage("events-week", brief, ratio).url),
        )
      : [absoluteImage(weeklyOgImage(brief).url)],
    author: SITE_PUBLISHER,
    publisher: SITE_PUBLISHER,
    about: { "@type": "City", name: "London" },
  };
}
