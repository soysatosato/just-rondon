import type { SpotPractical } from "../types";

/** ハイドパーク。2026-11-04 に公式サイト(The Royal Parks)で確かめた。 */
export const hydePark: SpotPractical = {
  slug: "hyde-park-london",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "The Royal Parks – Hyde Park",
      url: "https://www.royalparks.org.uk/visit/parks/hyde-park",
    },
    {
      label: "The Royal Parks – Hyde Park FAQs",
      url: "https://www.royalparks.org.uk/visit/parks/hyde-park/faqs",
    },
  ],
  access: [
    { label: "Hyde Park Corner駅(Piccadilly線)", text: "公園の南東の角に出ます。" },
    { label: "Knightsbridge駅(Piccadilly線)", text: "公園の南側に出ます。" },
    { label: "Marble Arch駅(Central線)", text: "公園の北東の角に出ます。スピーカーズ・コーナーがある側です。" },
    { label: "Lancaster Gate駅(Central線)", text: "公園の北側に出ます。" },
    {
      label: "Paddington駅(エリザベス線・ヒースロー・エクスプレス)",
      text: "公園の北、園内の道(ウェスト・キャリッジ・ドライブ)から約500m。",
    },
  ],
  onSite: [
    "公衆トイレは1回20p。支払いはカードやスマートフォンのタッチ決済だけで、現金は使えません。",
    "主なカフェは4つ(サーペンタイン・バー&キッチン、サーペンタイン・リド・カフェ、ザ・ロッジ・カフェ、パーク・スポーツ・カフェ)。",
  ],
};
