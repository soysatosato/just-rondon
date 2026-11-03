import type { SpotPractical } from "../types";

/**
 * キューガーデン。2026-11-04 に確かめた。
 * 公式サイトはスクリプトからの取得を弾くので、検索結果に出る公式ページの
 * 本文で確かめている。
 */
export const kewGardens: SpotPractical = {
  slug: "kew-gardens-london",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Kew Gardens – Tickets and prices",
      url: "https://www.kew.org/kew-gardens/visit-kew-gardens/tickets",
    },
    {
      label: "Kew Gardens – Ways to save",
      url: "https://www.kew.org/kew-gardens/visit-kew-gardens/ways-to-save",
    },
  ],
  tickets: {
    level: "advance",
    short: "当日券あり。オンラインのほうが安い",
    points: [
      "どの券も入口で買えますが、公式は、オンラインで買うのがいちばん安いとしています。料金は季節(ピーク・オフピーク)で変わります。",
      "2026年は9月8日〜12月29日の毎週火曜に、火曜だけ使える割安な券が出ています。",
    ],
    url: "https://www.kew.org/kew-gardens/visit-kew-gardens/tickets",
  },
};
