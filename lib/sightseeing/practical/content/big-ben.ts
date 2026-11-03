import type { SpotPractical } from "../types";

/**
 * ビッグ・ベン(エリザベス・タワー)の内部見学。2026-11-04 に確かめた。
 * 議会の公式サイトはスクリプトからの取得を弾くので、検索結果に出る
 * 公式ページの本文で確かめている。
 */
export const bigBen: SpotPractical = {
  slug: "big-ben",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "UK Parliament – Big Ben and the Elizabeth Tower tours",
      url: "https://www.parliament.uk/visiting/visiting-and-tours/big-ben-tour/",
    },
    {
      label: "UK Parliament – Further information before you book",
      url: "https://www.parliament.uk/visiting/visiting-and-tours/big-ben-tour/before-you-book/",
    },
  ],
  tickets: {
    level: "timed",
    short: "内部見学は毎月第2水曜に3か月先を発売",
    points: [
      "外から見るだけなら券は要りません。",
      "時計塔の内部見学の券は、毎月第2水曜の10:00に3か月先の分が、公式サイトだけで売り出されます。売り切れる日があり、払い戻しはできません。",
      "参加できるのは見学日に11歳以上の人で、11〜17歳は大人の同伴が要ります。年齢の分かるものを求められることがあります。",
    ],
    url: "https://www.parliament.uk/visiting/visiting-and-tours/big-ben-tour/",
  },
  onSite: [
    "334段の狭いらせん階段を上り下りします。エレベーターは無く、公式は、足腰に不安のある人や高い所・狭い所が苦手な人には勧めていません。",
    "開始の30分前までに着くこと。遅れると参加できず、払い戻しもありません。全体で約1時間45分かかります。",
    "スマートフォンやカメラは開始前にロッカーに預けます。靴はかかとが低く、つま先が覆われたものに限られます。",
  ],
};
