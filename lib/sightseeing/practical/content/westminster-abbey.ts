import type { SpotPractical } from "../types";

/** ウェストミンスター寺院。2026-11-04 に公式サイトで確かめた。 */
export const westminsterAbbey: SpotPractical = {
  slug: "westminster-abbey",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Westminster Abbey – Visit the Abbey",
      url: "https://www.westminster-abbey.org/visit-us/",
    },
    {
      label: "Westminster Abbey – Opening times and prices",
      url: "https://www.westminster-abbey.org/visit-us/opening-times-and-prices/",
    },
  ],
  tickets: {
    level: "advance",
    short: "当日券あり。混む時期は前売りが確実",
    points: [
      "公式サイトで前もって買えます。入口でも買えますが、公式は、混む時期に確実に入るには前もって買うよう強く勧めています。",
      "公式サイトで買った券は、来館したときに申し出ると無料で年間パスに切り替えられ、1年のうちに3回まで入れます。第三者の販売サイトで買った券は対象外です。",
      "日曜は礼拝のための日で、見学では入れません。礼拝に出席するのは無料です。",
    ],
    url: "https://www.westminster-abbey.org/visit-us/opening-times-and-prices/",
  },
  access: [
    {
      label: "Westminster駅(Jubilee・District・Circle線)",
      text: "約300m、徒歩4分ほど。見学の入口は、パーラメント・スクエアに面した北入口です。",
    },
    {
      label: "St James's Park駅(District・Circle線)",
      text: "約500m、徒歩6分ほど。",
    },
  ],
  onSite: [
    "入口ですべての人の手荷物を検査します。機内持ち込みサイズ(55×40×20cm)を超える荷物は持ち込めず、公式はヴィクトリア駅の手荷物預かりを案内しています。",
    "車椅子は入口で無料で借りられます。見学の順路のほとんどは段差がありません。",
  ],
};
