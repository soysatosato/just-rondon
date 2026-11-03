import type { SpotPractical } from "../types";

/**
 * 英国国会議事堂(音声ガイドの見学)。2026-11-04 に確かめた。
 * 議会の公式サイトはスクリプトからの取得を弾くので、検索結果に出る
 * 公式ページの本文で確かめている。
 */
export const housesOfParliament: SpotPractical = {
  slug: "houses-of-parliament-self-guided-audio-tour",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "UK Parliament – Tours",
      url: "https://www.parliament.uk/visiting/visiting-and-tours/",
    },
    {
      label: "UK Parliament – Audio tour tickets and dates",
      url: "https://tickets.parliament.uk/timeslot/uk-parliament-multimedia-tour",
    },
  ],
  tickets: {
    level: "advance",
    short: "土曜と休会中の平日。前売りが確実",
    points: [
      "音声ガイドで回る見学は、通年の土曜と、議会が休会中の月〜土曜に行われます。",
      "公式サイトか当日の窓口で買えますが、枠は早く埋まります。前もって買えば当日の入場が約束されます。",
      "大人1人につき、5〜15歳の子ども1人が無料になります。",
    ],
    url: "https://www.parliament.uk/visiting/visiting-and-tours/",
  },
  onSite: [
    "全員が空港と同じような保安検査を受けます。券の時刻の20分前までに着くよう案内されています。注目の審議がある日は、入口に列ができることがあります。",
    "見学はおよそ90分。途中で座れる場所は限られています。議会の都合で、急に中止や順路の変更になることがあります。",
  ],
};
