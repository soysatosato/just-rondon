import type { SpotPractical } from "../types";

/**
 * バッキンガム宮殿(夏の一般公開)。2026-11-04 に確かめた。
 * Royal Collection Trust の公式サイトはスクリプトからの取得を弾くので、
 * 検索結果に出る公式ページの本文で確かめている。
 */
export const buckinghamPalace: SpotPractical = {
  slug: "buckingham-palace",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Royal Collection Trust – Buckingham Palace",
      url: "https://www.rct.uk/visit/buckingham-palace",
    },
  ],
  tickets: {
    level: "advance",
    short: "公開は夏だけ。2027年は7月8日〜9月26日",
    points: [
      "宮殿の中(ステート・ルーム)を見られるのは夏の公開期間だけで、2027年は7月8日〜9月26日です。それ以外の時期は、決まった日に行う別料金のガイドツアーだけです。",
      "当日に買うより、前もって公式サイトで買うほうが安くなります。",
      "買った券は、来館したときに申し出ると、1年間くり返し入れる券に切り替えられます。",
    ],
    url: "https://www.rct.uk/visit/buckingham-palace",
  },
};
