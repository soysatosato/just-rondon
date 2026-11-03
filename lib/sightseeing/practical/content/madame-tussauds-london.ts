import type { SpotPractical } from "../types";

/** マダム・タッソー・ロンドン。2026-11-04 に公式サイトの料金ページで確かめた。 */
export const madameTussaudsLondon: SpotPractical = {
  slug: "madame-tussauds-london",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Madame Tussauds London – Prices & Tickets",
      url: "https://www.madametussauds.com/london/tickets/",
    },
  ],
  tickets: {
    level: "advance",
    short: "時間指定。オンラインの前売りが安い",
    points: [
      "標準の券は入場時間を選ぶ時間指定です。公式は、オンラインで前もって買うほうが入口で買うより常に安く、早いほど安いとしています。料金は日と空き具合で変わります。",
      "ロンドン・アイやシーライフ水族館と組み合わせた券は、マダム・タッソーに行った日から7日以内にほかを回れます。",
    ],
    url: "https://www.madametussauds.com/london/tickets/",
  },
};
