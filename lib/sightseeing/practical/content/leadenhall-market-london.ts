import type { SpotPractical } from "../types";

/** レドンホール・マーケット。2026-11-04 に公式サイトで確かめた。 */
export const leadenhallMarket: SpotPractical = {
  slug: "leadenhall-market-london",
  checkedAt: "2026-11-04",
  sources: [
    { label: "Leadenhall Market – Visit", url: "https://leadenhallmarket.co.uk/visit/" },
    {
      label: "Leadenhall Market – Weekend Markets 2026",
      url: "https://leadenhallmarket.co.uk/weekend-markets-2026/",
    },
  ],
  access: [
    { label: "Monument駅(District・Circle線)", text: "公式の案内で徒歩4分。" },
    { label: "Bank駅", text: "公式の案内で徒歩6分。" },
    { label: "Aldgate駅", text: "公式の案内で徒歩8分。" },
  ],
  onSite: [
    "通路は24時間通れます。店・バー・レストランの営業時間は店ごとに違うので、目当ての店があれば店に確かめるよう公式は勧めています。",
    "週末も飲食店やパブは開いています(公式)。2026年は第2土曜の12〜17時にクラフトの市が立ち、残りは11月14日と12月12日です。",
    "保守工事のため足場が組まれていますが、市場はふだんどおり通れます(2026年11月時点)。",
  ],
};
