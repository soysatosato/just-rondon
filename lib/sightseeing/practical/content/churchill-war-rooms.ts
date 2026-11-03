import type { SpotPractical } from "../types";

/**
 * チャーチル戦争指令室。2026-11-04 に確かめた。
 * 帝国戦争博物館(IWM)の公式サイトはスクリプトからの取得を弾くので、
 * 検索結果に出る公式ページと券売サイトの本文で確かめている。
 */
export const churchillWarRooms: SpotPractical = {
  slug: "churchill-war-rooms",
  checkedAt: "2026-11-04",
  sources: [
    {
      label: "IWM – Churchill War Rooms: Book tickets",
      url: "https://www.iwm.org.uk/visits/churchill-war-rooms/booking",
    },
    {
      label: "IWM – Families at Churchill War Rooms",
      url: "https://www.iwm.org.uk/visits/churchill-war-rooms/families-at-churchill-war-rooms",
    },
  ],
  tickets: {
    level: "timed",
    short: "時間指定。売り切れる日がある",
    points: [
      "入場は時間指定で、日や時間帯によっては売り切れます。公式は前もって買うよう勧めています。",
      "選んだ時間帯の開始から30分以内に着けば入れます。時間帯より前に着いても、入れるとは限りません。",
    ],
    url: "https://www.iwm.org.uk/visits/churchill-war-rooms/booking",
  },
};
