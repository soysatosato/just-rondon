import type { SpotPractical } from "../types";

/** スペンサー・ハウス。2026-11-04 に公式サイトで確かめた。 */
export const spencerHouse: SpotPractical = {
  slug: "spencer-house-london",
  checkedAt: "2026-11-04",
  sources: [
    { label: "Spencer House – Tours", url: "https://www.spencerhouse.co.uk/tours/" },
  ],
  tickets: {
    level: "advance",
    short: "日曜のガイドツアー。前売りを勧めている",
    points: [
      "一般に入れるのは毎週日曜で、ブルーバッジ・ガイドの案内で8つのステート・ルームを回るツアーです。4〜10月は天気が良ければ庭にも出ます。",
      "公式は、サイトで日時を選んで前もって買うよう勧めています。当日、受付で空きがあれば買えますが、1枚につき£1.50が上乗せされます。支払いはカードなどで、現金は使えません。",
    ],
    url: "https://www.spencerhouse.co.uk/tours/",
  },
};
