import type { SeasonItem } from "./types";

/**
 * 屋外のスケートリンク。会期と料金は主催者の公式発表で確かめたものだけ。
 *
 * レスター・スクエアとバタシー発電所のリンクはマーケット比較のデータ
 * (markets.ts)が持っていて、特集では hubKind で「リンク」の段に置く。
 *
 * ハンプトン・コート宮殿の公式ページ(hrp.org.uk)は WebFetch が403を返すので、
 * 2026-10-18 は検索エンジン経由の写しで会期と時間を確かめた。
 */

const CHECKED = "2026-10-18";

export const christmasRinks: SeasonItem[] = [
  {
    slug: "somerset-house-skate",
    kind: "rink",
    title: "サマセット・ハウスのスケートリンク",
    shortTitle: "サマセット・ハウス",
    engTitle: "Skate at Somerset House",
    summary:
      "18世紀の官庁の建物に囲まれた中庭が、冬だけ屋外のリンクになる。滑るには日時指定の券が要るが、中庭から眺めるだけなら無料。",
    station: "テンプル駅",
    href: "/sightseeing/somerset-house",
    free: false,
    entry: "有料(日時指定)",
    usualTiming: "例年11月中旬〜1月中旬",
    editions: [
      {
        year: 2026,
        start: "2026-11-11",
        end: "2027-01-10",
        price: "大人£13〜£28.50、子ども£11〜£15(1枚につき手数料£1.50)",
        booking: {
          status: "9月25日から発売中",
          url: "https://somersethouse.org.uk/whats-on/skate-somerset-house",
        },
        sources: [
          {
            label: "Somerset House – Skate",
            url: "https://somersethouse.org.uk/whats-on/skate-somerset-house",
          },
          {
            label: "Somerset House – Skate 2026/27 のお知らせ",
            url: "https://www.somersethouse.org.uk/press/skate-at-somerset-house-with-virgin-holidays-returns-for-an-unforgettable-festive-season",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [{ spot: "somerset-house", relation: "here" }],
  },
  {
    slug: "hampton-court-ice-rink",
    kind: "rink",
    title: "ハンプトン・コート宮殿のスケートリンク",
    shortTitle: "ハンプトン・コート宮殿",
    engTitle: "Hampton Court Palace Ice Rink",
    summary:
      "ヘンリー8世の宮殿の前に出る屋外のリンク。中心部から電車で35分ほどかかるが、赤れんがの宮殿を背に滑れる。",
    station: "ハンプトン・コート駅(鉄道)",
    href: "/sightseeing/hampton-court-palace",
    free: false,
    entry: "有料(宮殿の入場券とは別)",
    usualTiming: "例年11月下旬〜1月上旬",
    editions: [
      {
        year: 2026,
        start: "2026-11-20",
        end: "2027-01-03",
        hours: "10:00〜20:00(時間ごとの入れ替え制)",
        christmasDay: "closed",
        booking: {
          status: "10月18日時点では「まもなく発売」の案内",
          url: "https://www.hrp.org.uk/hampton-court-palace/whats-on/hampton-court-palace-ice-rink/",
        },
        notes: ["リンクの券に宮殿の入場は含まれない。"],
        sources: [
          {
            label: "Historic Royal Palaces – Hampton Court Palace ice rink",
            url: "https://www.hrp.org.uk/hampton-court-palace/whats-on/hampton-court-palace-ice-rink/",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [{ spot: "hampton-court-palace", relation: "here" }],
  },
];
