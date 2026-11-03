import type { SpotPractical } from "../types";

/** ザ・ビュー・フロム・ザ・シャード(展望台)。2026-11-04 に公式サイトで確かめた。 */
export const theViewFromTheShard: SpotPractical = {
  slug: "the-view-from-the-shard",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "The View from The Shard – Plan your visit",
      url: "https://www.theviewfromtheshard.com/plan-your-visit/",
    },
    {
      label: "The View from The Shard – Ticket types",
      url: "https://www.theviewfromtheshard.com/ticket-types/",
    },
    {
      label: "The View from The Shard – FAQ",
      url: "https://www.theviewfromtheshard.com/en/faq/",
    },
  ],
  tickets: {
    level: "advance",
    short: "当日券あり。前もって買うのが確実",
    points: [
      "当日も、空きがあれば入口横(ジョイナー・ストリート)の券売所で買えます。ただし売り切れることがあり、前売りの割引は当日券には付かないことがあります。",
      "視界が悪く、ロンドン・アイ、セント・ポール大聖堂、タワーブリッジなど公式が挙げる5つの建物のうち3つが見えなかったときは、係員に申し出ると3か月有効の再訪券がもらえます(ビュー・ギャランティー)。",
      "18歳未満が券を買って入るときは、身分証を持った18歳以上の大人の同伴が要ります。4歳未満は無料です。",
    ],
    url: "https://www.theviewfromtheshard.com/ticket-types/",
  },
  access: [
    {
      label: "London Bridge駅",
      text: "入口はジョイナー・ストリート側(住所 Joiner Street, SE1 9QU)。駅から徒歩2分です。",
    },
  ],
};
