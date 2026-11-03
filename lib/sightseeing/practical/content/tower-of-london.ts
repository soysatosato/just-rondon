import type { SpotPractical } from "../types";

/**
 * ロンドン塔。2026-11-04 に確かめた。
 * 公式(Historic Royal Palaces)はスクリプトからの取得を弾くので、
 * 検索結果に出る公式ページの本文で確かめている。
 */
export const towerOfLondon: SpotPractical = {
  slug: "tower-of-london",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Historic Royal Palaces – Tower of London: Tickets and prices",
      url: "https://www.hrp.org.uk/tower-of-london/visit/tickets-and-prices/",
    },
    {
      label: "Historic Royal Palaces – Yeoman Warder tours",
      url: "https://www.hrp.org.uk/tower-of-london/whats-on/yeoman-warder-tours/",
    },
  ],
  tickets: {
    level: "advance",
    short: "当日券あり。前もって買うのが確実",
    points: [
      "公式サイトで前もって買うか、当日に窓口で買えます。入場者数に上限があり、公式は、確実に入るには前もって買うよう勧めています。",
      "衛士(ヨーマン・ウォーダー)のガイドツアーは入場料に含まれていて、前もっての予約はできません。",
    ],
    url: "https://www.hrp.org.uk/tower-of-london/visit/tickets-and-prices/",
  },
};
