import type { WeeklyBrief, WeeklyBriefItem } from "@prisma/client";
import { getKindMeta } from "@/lib/weekly";

/**
 * 号と、その中の催し物の構造化データ。
 *
 * Article は号そのもの。Event は「日付があって実際に参加できるもの」だけに絞る。
 * 運休や休館は日付を持っていても Event ではないので出さない — schema.org の
 * Event として出すと、検索結果に「参加できる催し」として並んでしまう。
 */

const PARTICIPABLE_KINDS = new Set(["event", "exhibition", "opening", "deal"]);

export function buildBriefJsonLd(
  brief: WeeklyBrief & { items: WeeklyBriefItem[] },
  { articleId }: { articleId?: string } = {}
) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    ...(articleId ? { "@id": articleId } : {}),
    headline: brief.title,
    description: brief.headline,
    datePublished: brief.createdAt.toISOString(),
    dateModified: brief.updatedAt.toISOString(),
    inLanguage: "ja",
    about: { "@type": "City", name: "London" },
  };

  const events = brief.items
    .filter(
      (item) =>
        item.startDate &&
        PARTICIPABLE_KINDS.has(item.kind) &&
        // 中止になりうるものを確定情報として出すと、閉幕済みの催しを
        // 案内してしまうことになる。
        item.status === "confirmed"
    )
    .map((item) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: item.title,
      description: item.description.replace(/[#*_`>\[\]()]/g, "").slice(0, 300),
      startDate: item.startDate!.toISOString().slice(0, 10),
      ...(item.endDate
        ? { endDate: item.endDate.toISOString().slice(0, 10) }
        : {}),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      ...(item.venue || item.area
        ? {
            location: {
              "@type": "Place",
              name: item.venue ?? item.area,
              address: {
                "@type": "PostalAddress",
                addressLocality: item.area ?? "London",
                addressCountry: "GB",
              },
            },
          }
        : {}),
      ...(item.website ? { url: item.website } : {}),
      ...(item.isFree
        ? {
            offers: {
              "@type": "Offer",
              price: 0,
              priceCurrency: "GBP",
              availability: "https://schema.org/InStock",
            },
          }
        : {}),
      // kind は分類なので、そのまま検索側の手がかりにしておく。
      keywords: getKindMeta(item.kind).label,
    }));

  return [article, ...events];
}
