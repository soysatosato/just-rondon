import type { SpotPractical } from "../types";

/** セント・ポール大聖堂。2026-11-04 に公式サイト(チケットのFAQ)で確かめた。 */
export const stPaulsCathedral: SpotPractical = {
  slug: "st-pauls-cathedral",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "St Paul's Cathedral – Booking tickets FAQ",
      url: "https://www.stpauls.co.uk/booking-tickets-faq",
    },
    {
      label: "St Paul's Cathedral – Book sightseeing tickets",
      url: "https://www.stpauls.co.uk/book-tickets",
    },
  ],
  tickets: {
    level: "advance",
    short: "当日券あり。公式サイトの日時指定券が早い",
    points: [
      "公式サイトで日付と入場時間を選んで買えます。6か月前から当日まで買えて、公式はいちばん早く入れるのはこの券だとしています。",
      "予約なしで行って入口で買うこともできます(現金も使えます)。",
      "日時の変更は、予約した時刻の24時間前まで。ロンドンパスや旅行会社の引換券で入るときは予約は要りません。",
    ],
    url: "https://www.stpauls.co.uk/book-tickets",
  },
};
