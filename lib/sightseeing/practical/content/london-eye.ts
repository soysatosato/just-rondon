import type { SpotPractical } from "../types";

/** ロンドン・アイ。2026-11-04 に公式サイトの料金ページで確かめた。 */
export const londonEye: SpotPractical = {
  slug: "london-eye",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "London Eye – Tickets & Prices",
      url: "https://www.londoneye.com/tickets-and-prices/",
    },
  ],
  tickets: {
    level: "advance",
    short: "時間指定。オンラインの前売りが安い",
    points: [
      "標準の券は乗る時間帯を選ぶ時間指定です。公式は、オンラインで前もって買う券は現地の窓口より常に安く、早く買うほど安いとしています。料金は日と空き具合で変わります。",
      "時間帯を選ばず、その日のうちならいつでも専用の入口から優先して乗れる券(フレキシ・ファストトラック)もあります。",
      "マダム・タッソーなど近くの施設と組み合わせた券は、最初の施設に行った日から7日以内にほかを回れます。",
    ],
    url: "https://www.londoneye.com/tickets-and-prices/",
  },
};
