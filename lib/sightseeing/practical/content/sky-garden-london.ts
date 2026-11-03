import type { SpotPractical } from "../types";

/** スカイガーデン。2026-11-04 に公式サイトの予約ページで確かめた。 */
export const skyGardenLondon: SpotPractical = {
  slug: "sky-garden-london",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "Sky Garden – Booking your visit",
      url: "https://skygarden.london/booking/",
    },
  ],
  tickets: {
    level: "free-booking",
    short: "無料。3週間先まで予約できる",
    points: [
      "入場は無料ですが、日時指定の無料券を公式サイトで予約します。予約できるのは3週間先まで。入場から1時間が持ち時間です。",
      "空きがあれば予約なしでも入れることがありますが、平日の17時以降は予約なしでは入れません。公式は、混む週末を中心に予約を勧めています。",
      "中のレストランやバーを予約していれば、無料券は要りません。",
    ],
    url: "https://skygarden.london/booking/book-a-free-ticket/",
  },
  onSite: [
    "18歳以上でも25歳未満に見える人は、写真付きの身分証(パスポートなど)を持って行くよう公式は勧めています。",
  ],
};
