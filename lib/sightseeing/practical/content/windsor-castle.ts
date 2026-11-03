import type { SpotPractical } from "../types";

/**
 * ウィンザー城。2026-11-04 に確かめた。
 * Royal Collection Trust の公式サイトはスクリプトからの取得を弾くので、
 * 検索結果に出る公式ページの本文で確かめている。
 */
export const windsorCastle: SpotPractical = {
  slug: "windsor-castle",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Royal Collection Trust – Windsor Castle",
      url: "https://www.rct.uk/visit/windsor-castle",
    },
    {
      label: "Royal Collection Trust – Practical information for visiting Windsor Castle",
      url: "https://www.rct.uk/visit/windsor-castle/practical-information-for-visiting-windsor-castle",
    },
  ],
  tickets: {
    level: "advance",
    short: "当日券あり。前売りのほうが安い",
    points: [
      "前もって公式サイトで買うほうが、当日に城の窓口で買うより安くなります。窓口ではその日の分だけを売っていて、売り切れることがあります。",
      "開館直後から昼まではいちばん混みます。公式は、前もって券を買って昼過ぎに着くよう勧めています。",
      "現役の王室の住まいなので、急に閉まる日があります。行く日の開館時間と休館日は公式の一覧で確かめてください。",
    ],
    url: "https://www.rct.uk/visit/windsor-castle",
  },
  access: [
    {
      label: "Windsor & Eton Central駅 / Windsor & Eton Riverside駅",
      text: "どちらからも歩いて10分かかりません。リバーサイド駅からは急な上り坂を歩きます。",
    },
    {
      label: "バス",
      text: "ヴィクトリア駅の近くからウィンザーの中心部まで、ウィンザー・エクスプレスの702番が出ています。",
    },
  ],
  onSite: ["城は急な坂の上にあり、公式は歩きやすい靴を勧めています。"],
};
