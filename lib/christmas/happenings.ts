import type { SeasonItem } from "./types";

/**
 * 入場の要る季節の催し(光の小道、映画のセット、礼拝など)。
 * 会期・料金・発売は主催者の公式発表で確かめたものだけ。
 *
 * ハイド・パークのウィンター・ワンダーランドはマーケット比較のデータ
 * (markets.ts)が持っていて、特集では hubKind で「催し」の段に置く。
 *
 * キュー(kew.org)とハンプトン・コート(hrp.org.uk)、スタジオツアーの
 * 公式ページは WebFetch が403/404を返すので、2026-10-18 は検索エンジン
 * 経由の写しで確かめた。
 */

const CHECKED = "2026-10-18";

export const christmasHappenings: SeasonItem[] = [
  {
    slug: "christmas-at-kew",
    kind: "event",
    title: "クリスマス・アット・キュー",
    shortTitle: "キュー・ガーデン",
    engTitle: "Christmas at Kew",
    summary:
      "夜の植物園を、光の作品をたどって歩く小道。日時指定の入場制で、中心部から地下鉄で30分ほど。",
    station: "キュー・ガーデンズ駅",
    href: "/sightseeing/kew-gardens-london",
    free: false,
    entry: "有料(日時指定)",
    usualTiming: "例年11月中旬〜1月上旬",
    editions: [
      {
        year: 2026,
        start: "2026-11-13",
        end: "2027-01-03",
        closedDates: ["2026-11-16", "2026-11-23", "2026-11-28"],
        christmasDay: "closed",
        hours:
          "入場は16:20〜19:40の時間指定(門によって違う)、22:00まで。12月24日は21:00まで",
        price: "大人£29.50〜£37、子ども(4〜15歳)£20〜£24(予約手数料£1込み)",
        booking: {
          status: "発売中。前売りの予約が必須",
          url: "https://www.kew.org/kew-gardens/whats-on/christmas",
        },
        notes: ["昼の庭園は12月24・25日が休み。"],
        sources: [
          {
            label: "Kew – Christmas at Kew",
            url: "https://www.kew.org/kew-gardens/whats-on/christmas",
          },
          {
            label: "Kew – Everything you need to know for Christmas at Kew",
            url: "https://www.kew.org/kew-gardens/whats-on/christmas/everything-you-need-to-know",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [{ spot: "kew-gardens-london", relation: "here" }],
  },
  {
    slug: "hogwarts-in-the-snow",
    kind: "event",
    title: "ホグワーツ・イン・ザ・スノー",
    shortTitle: "ホグワーツ・イン・ザ・スノー",
    engTitle: "Hogwarts in the Snow",
    summary:
      "ワーナー・ブラザーズのスタジオツアーで、映画のセットが冬の飾りになる。大広間にはツリーとごちそうが並び、最後に見るホグワーツ城の模型は雪に覆われる。",
    station: "ワトフォード・ジャンクション駅からシャトルバス",
    href: "/sightseeing/warner-bros-studio-tour-harry-potter",
    free: false,
    entry: "スタジオツアーの日時指定券",
    usualTiming: "例年11月中旬〜1月中旬",
    editions: [
      {
        year: 2026,
        start: "2026-11-14",
        end: "2027-01-17",
        booking: {
          status: "スタジオツアーの券(日時指定)で見られる",
          url: "https://www.wbstudiotour.co.uk/the-experience/whats-on/hogwarts-in-the-snow/",
        },
        sources: [
          {
            label: "Warner Bros. Studio Tour London – Hogwarts in the Snow",
            url: "https://www.wbstudiotour.co.uk/the-experience/whats-on/hogwarts-in-the-snow/",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [
      { spot: "warner-bros-studio-tour-harry-potter", relation: "here" },
    ],
  },
  {
    slug: "chelsea-winter-village",
    kind: "event",
    title: "チェルシー・ウィンタービレッジ",
    shortTitle: "チェルシー・ウィンタービレッジ",
    engTitle: "Chelsea Winter Village & Illuminations",
    summary:
      "王立チェルシー病院の庭に、光の小道と屋台の村が出る。病院で暮らす退役軍人(チェルシー・ペンショナーズ)の合唱も聴ける。",
    station: "スローン・スクエア駅",
    href: "/sightseeing/chelsea-winter-village",
    free: false,
    entry: "有料(日時指定)",
    usualTiming: "例年11月下旬〜12月下旬",
    editions: [
      {
        year: 2026,
        start: "2026-11-25",
        end: "2026-12-28",
        price: "大人£18〜£29.95、子ども£12〜£19.95(2歳未満は無料)",
        booking: {
          status: "発売中",
          url: "https://events.liveit.io/chelsea-winter-village/chelsea-winter-illuminations/",
        },
        notes: ["今年は会場が病院の敷地内の広い場所に移る。"],
        sources: [
          {
            label: "Chelsea Winter Illuminations(主催者の券売ページ)",
            url: "https://events.liveit.io/chelsea-winter-village/chelsea-winter-illuminations/",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
  },
  {
    slug: "winter-palace-hampton-court",
    kind: "event",
    title: "ハンプトン・コート宮殿のウィンター・パレス",
    shortTitle: "ウィンター・パレス",
    engTitle: "Winter Palace at Hampton Court",
    summary:
      "ハンプトン・コート宮殿の中で開かれる冬の催し。2026年に始まったもので、宮殿の入場券で見られる。",
    station: "ハンプトン・コート駅(鉄道)",
    href: "/sightseeing/hampton-court-palace",
    free: false,
    entry: "宮殿の入場券",
    usualTiming: "11月下旬〜1月上旬",
    editions: [
      {
        year: 2026,
        start: "2026-11-28",
        end: "2027-01-03",
        hours: "10:00〜16:30(延長の日あり)",
        christmasDay: "closed",
        closedDates: [
          "2026-11-30",
          "2026-12-01",
          "2026-12-07",
          "2026-12-08",
          "2026-12-14",
          "2026-12-15",
          "2026-12-24",
          "2026-12-26",
        ],
        booking: {
          status: "宮殿の入場は30分ごとの時間指定",
          url: "https://www.hrp.org.uk/hampton-court-palace/christmas/",
        },
        sources: [
          {
            label: "Historic Royal Palaces – Christmas at Hampton Court Palace",
            url: "https://www.hrp.org.uk/hampton-court-palace/christmas/",
          },
          {
            label: "Historic Royal Palaces – Winter Palace FAQs",
            url: "https://www.hrp.org.uk/hampton-court-palace/whats-on/winter-palace/winter-palace-faqs/",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [{ spot: "hampton-court-palace", relation: "here" }],
  },
  {
    slug: "westminster-abbey-carols",
    kind: "event",
    title: "ウェストミンスター寺院のキャロル礼拝",
    shortTitle: "ウェストミンスター寺院のキャロル礼拝",
    engTitle: "Lessons and Carols at Westminster Abbey",
    summary:
      "聖書の朗読とキャロルを交互に重ねる、英国の伝統的な聖歌礼拝(レッスンズ・アンド・キャロルズ)。礼拝は無料だが、入るには券が要る。",
    station: "ウェストミンスター駅",
    href: "/sightseeing/westminster-abbey",
    free: true,
    entry: "無料(券が要る)",
    usualTiming: "例年12月、クリスマスの前",
    editions: [
      {
        year: 2026,
        booking: {
          status: "券は11月16日(月)と18日(水)の9:30と14:30に配られる",
          url: "https://www.westminster-abbey.org/worship-and-music/services-and-times/advent-and-christmas",
        },
        notes: ["礼拝の日時は、まだ案内されていない。"],
        sources: [
          {
            label: "Westminster Abbey – Christmas",
            url: "https://www.westminster-abbey.org/worship-and-music/services-and-times/advent-and-christmas",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [{ spot: "westminster-abbey", relation: "here" }],
  },
  {
    slug: "st-pauls-carol-service",
    kind: "event",
    title: "セント・ポール大聖堂のキャロル礼拝",
    shortTitle: "セント・ポールのキャロル礼拝",
    engTitle: "Christmas Carol Service at St Paul's",
    summary:
      "クリスマス直前の夕方に、大聖堂でキャロル(聖歌)を歌う礼拝。観光の見学ではなく礼拝に加わる形なので、礼拝中の写真撮影は控える。",
    station: "セント・ポール駅",
    href: "/sightseeing/st-pauls-cathedral",
    free: true,
    entry: "無料(チケット制)",
    usualTiming: "例年12月23・24日の夕方",
    editions: [
      {
        year: 2026,
        start: "2026-12-23",
        end: "2026-12-24",
        hours: "両日とも16:00〜17:00",
        booking: {
          status: "無料だがチケット制。配り方はまだ案内されていない",
          url: "https://www.stpauls.co.uk/whats-on/christmas-carol-service-3",
        },
        sources: [
          {
            label: "St Paul's Cathedral – Christmas Carol Service(12月23日)",
            url: "https://www.stpauls.co.uk/whats-on/christmas-carol-service-3",
          },
          {
            label: "St Paul's Cathedral – Christmas Carol Service(12月24日)",
            url: "https://www.stpauls.co.uk/whats-on/christmas-carol-service-4",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [{ spot: "st-pauls-cathedral", relation: "here" }],
  },
];
