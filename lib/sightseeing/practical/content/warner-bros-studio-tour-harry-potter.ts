import type { SpotPractical } from "../types";

/** ワーナー・ブラザース スタジオツアー ロンドン。2026-11-04 に公式サイトで確かめた。 */
export const warnerBrosStudioTour: SpotPractical = {
  slug: "warner-bros-studio-tour-harry-potter",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Warner Bros. Studio Tour London",
      url: "https://www.wbstudiotour.co.uk/",
    },
    {
      label: "Warner Bros. Studio Tour London – Getting here",
      url: "https://www.wbstudiotour.co.uk/plan-your-visit/getting-here/",
    },
  ],
  tickets: {
    level: "timed",
    short: "前もっての予約が必要",
    points: [
      "入場券は前もって予約が要ります(公式)。2027年の分も売り出されています。",
      "ワトフォード・ジャンクション駅との往復のシャトルバスは、入場券に含まれています。",
    ],
    url: "https://www.wbstudiotour.co.uk/",
  },
  access: [
    {
      label: "ロンドンから電車で",
      text: "ユーストン駅からワトフォード・ジャンクション駅まで直通で約20分。この区間ではオイスターカードが使えます(公式)。",
    },
    {
      label: "シャトルバス(ワトフォード・ジャンクション駅から)",
      text: "約15分。9:20から少なくとも30分おきに出ます(最初のツアーが9:00の日は8:15から増便)。帰りの最終便は閉館の時刻に出ます。",
    },
  ],
};
