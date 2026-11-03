import type { SpotPractical } from "../types";

/**
 * ハンプトン・コート宮殿。2026-11-04 に確かめた。
 * Historic Royal Palaces の公式サイトはスクリプトからの取得を弾くので、
 * 検索結果に出る公式ページの本文で確かめている。
 */
export const hamptonCourtPalace: SpotPractical = {
  slug: "hampton-court-palace",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Historic Royal Palaces – Hampton Court Palace: Tickets and prices",
      url: "https://www.hrp.org.uk/hampton-court-palace/visit/tickets-and-prices/",
    },
    {
      label: "Historic Royal Palaces – Winter Palace FAQs",
      url: "https://www.hrp.org.uk/hampton-court-palace/whats-on/winter-palace/winter-palace-faqs/",
    },
  ],
  tickets: {
    level: "advance",
    short: "当日券あり。前もって買うのが勧められている",
    points: [
      "公式は前もって買うよう勧めています。料金は平日(オフピーク)と、週末・祝日(ピーク)で違います。",
      "2026年11月28日〜2027年1月3日は「ウィンター・パレス」の期間で料金が変わり、宮殿へは30分ごとの時間指定で入ります。",
    ],
    url: "https://www.hrp.org.uk/hampton-court-palace/visit/tickets-and-prices/",
  },
};
