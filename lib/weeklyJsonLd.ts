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

  // offers.validFrom は「その値段でいつから買えるか」。調査日を使うのは、
  // 販売開始日をDBに持っていないため。実際に確認が取れた日より前を名乗ると
  // 確認していない期間を保証することになる。
  const validFrom = brief.researchedAt.toISOString().slice(0, 10);

  const events = brief.items
    .filter(
      (item) =>
        item.startDate &&
        PARTICIPABLE_KINDS.has(item.kind) &&
        // 中止になりうるものを確定情報として出すと、閉幕済みの催しを
        // 案内してしまうことになる。
        item.status === "confirmed"
    )
    .map((item) => {
      // description は Google の必須フィールド。マークダウン記号を落とした
      // 結果が空になる項目でもフィールドごと消えないよう、タイトルにフォールバックする。
      const description =
        item.description.replace(/[#*_`>\[\]()]/g, "").trim().slice(0, 300) ||
        item.title;

      // location も Event の必須フィールド。会場も地域も分からない催しは
      // 開催都市(London)だけを Place として出す。省くと Google が
      // 「Missing field location」でエラーにする。
      const location = {
        "@type": "Place",
        name: item.venue ?? item.area ?? "London",
        address: {
          "@type": "PostalAddress",
          addressLocality: item.area ?? "London",
          addressCountry: "GB",
        },
      };

      return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: item.title,
        description,
        startDate: item.startDate!.toISOString().slice(0, 10),
        ...(item.endDate
          ? { endDate: item.endDate.toISOString().slice(0, 10) }
          : {}),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location,
        ...(item.website ? { url: item.website } : {}),
        // 号のビジュアルを催しの image として借りる。催し個別の画像はDBにないが、
        // 号の画像はその週の催しを写したものなので、無関係な絵にはならない。
        ...(brief.image ? { image: brief.image } : {}),
        // 有料の催しは priceInfo が「大人£33、18〜24歳£21.50」のような日本語の
        // 散文で、price に入れられる数値がない。値段を捏造するかわりに、
        // 買える場所(website)だけを Offer として出す。
        ...(item.isFree
          ? {
              offers: {
                "@type": "Offer",
                price: 0,
                priceCurrency: "GBP",
                availability: "https://schema.org/InStock",
                validFrom,
              },
            }
          : item.website
            ? {
                offers: {
                  "@type": "Offer",
                  url: item.website,
                  availability: "https://schema.org/InStock",
                  validFrom,
                },
              }
            : {}),
        // kind は分類なので、そのまま検索側の手がかりにしておく。
        keywords: getKindMeta(item.kind).label,
      };
    });

  return [article, ...events];
}
