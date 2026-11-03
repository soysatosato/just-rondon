import type { SpotPractical } from "../types";

/** タワーブリッジ(内部の展示)。2026-11-04 に公式サイトで確かめた。 */
export const londonTowerBridge: SpotPractical = {
  slug: "london-tower-bridge",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Tower Bridge – Plan your visit",
      url: "https://www.towerbridge.org.uk/plan-your-visit",
    },
  ],
  tickets: {
    level: "advance",
    short: "当日券あり。前売りを勧めている",
    points: [
      "当日は全員が屋外に並んで入ります。公式は、前もって券を買い、時間に余裕を持って着くよう勧めています。",
      "券売所と入口は、北側の塔(ロンドン塔の側)の西面にあります。",
    ],
    url: "https://www.towerbridge.org.uk/plan-your-visit",
  },
  access: [
    {
      label: "Tower Hill駅(District・Circle線)",
      text: "券売所まで約500m、公式の案内で徒歩7分。ホームから地上まで段差なしで出られます。",
    },
    {
      label: "London Bridge駅(Northern・Jubilee線)",
      text: "南岸側にあるエンジンルームの入口まで約1km。",
    },
    {
      label: "船",
      text: "北岸のタワー・ピアと、南岸のロンドン・ブリッジ・シティ・ピアに観光船が着きます。",
    },
  ],
  onSite: [
    "全員の手荷物を検査します。持ち込めるのは45×35×20cm以内のバッグやリュックまでで、スーツケースやキャリーバッグは持ち込めません。",
    "塔の上の通路とエンジンルームにはエレベーターがあります。ガラスの床の近くには瓶などガラス製のものを持ち込めません。",
  ],
};
