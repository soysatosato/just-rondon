import type { SpotPractical } from "../types";

/**
 * ケンジントン宮殿。2026-11-04 に確かめた。
 * Historic Royal Palaces の公式サイトはスクリプトからの取得を弾くので、
 * 検索結果に出る公式ページの本文で確かめている。
 */
export const kensingtonPalace: SpotPractical = {
  slug: "kensington-palace",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Historic Royal Palaces – Kensington Palace: Tickets and prices",
      url: "https://www.hrp.org.uk/kensington-palace/visit/tickets-and-prices/",
    },
  ],
  tickets: {
    level: "advance",
    short: "当日券は空きがあれば。前売りが確実",
    points: [
      "公式サイトで前もって買えます。当日も窓口で売っていますが、空きがある場合に限られます。",
      "料金は日によって変わります。行く日の料金は公式の料金表で確かめてください。",
    ],
    url: "https://www.hrp.org.uk/kensington-palace/visit/tickets-and-prices/",
  },
};
