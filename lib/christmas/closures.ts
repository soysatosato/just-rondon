import { seasonYear } from "./season";
import type { SeasonSource, VenueClosure } from "./types";

/**
 * 年末年始の休みと営業(12月24〜26日・31日・1月1日)。
 *
 * 公式サイトに書かれていることだけを載せる。早見表は、書かれている休みを
 * 「休」、短縮営業を「短」にし、休みでない日は openOtherDays が true の館
 * (公式が「◯日以外は毎日開く」と書いている館)だけ「開」にする。それ以外は
 * 「記載なし」のまま——書かれていない日を開館と言い切らない。
 *
 * 載せていない館は「休まない」という意味ではない。2026-10-18 の時点で
 * 年末年始の扱いを公式に確かめられなかった館(ケンジントン宮殿、
 * スタジオツアー、ザ・シャード、シーライフ、大英図書館、コートールド、
 * ソーン美術館など)は外してある。年末の営業は10〜11月に出るので、
 * 11月にもう一度見直すこと。
 *
 * キュー(kew.org)とハンプトン・コート(hrp.org.uk)、ロイヤル・ミュージアムズ・
 * グリニッジの一部、Royal Mail は WebFetch が403を返すので、2026-10-18 は
 * 検索エンジン経由の写しで確かめた。
 */

const CHECKED = "2026-10-18";
const DEC_24_26 = ["12-24", "12-25", "12-26"];

const IWM: SeasonSource = { label: "IWM London", url: "https://www.iwm.org.uk/visits/iwm-london" };
const TATE: SeasonSource = {
  label: "Tate – Frequently asked questions(テートの全館)",
  url: "https://www.tate.org.uk/about-us/frequently-asked-questions",
};

export const venueClosures: VenueClosure[] = [
  /* ---------------- 美術館・博物館 ---------------- */
  {
    id: "british-museum",
    name: "大英博物館",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [
      { spot: "british-museum-london", relation: "here" },
      { museum: "british-museum", relation: "here" },
    ],
    source: { label: "British Museum – Visit", url: "https://www.britishmuseum.org/visit" },
    checkedAt: CHECKED,
  },
  {
    id: "national-gallery",
    name: "ナショナル・ギャラリー",
    group: "museum",
    closed: [...DEC_24_26, "01-01"],
    openOtherDays: true,
    places: [
      { spot: "national-gallery-london", relation: "here" },
      { museum: "national-gallery", relation: "here" },
    ],
    source: {
      label: "National Gallery – Plan your visit",
      url: "https://www.nationalgallery.org.uk/visiting/plan-your-visit",
    },
    checkedAt: CHECKED,
  },
  {
    id: "national-portrait-gallery",
    name: "ナショナル・ポートレート・ギャラリー",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [{ museum: "national-portrait-gallery", relation: "here" }],
    source: { label: "National Portrait Gallery – FAQs", url: "https://www.npg.org.uk/about/faq/" },
    checkedAt: CHECKED,
  },
  {
    id: "tate-modern",
    name: "テート・モダン",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [
      { spot: "tate-modern", relation: "here" },
      { museum: "tate-modern", relation: "here" },
    ],
    source: TATE,
    checkedAt: CHECKED,
  },
  {
    id: "tate-britain",
    name: "テート・ブリテン",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [
      { spot: "tate-britain", relation: "here" },
      { museum: "tate-britain", relation: "here" },
    ],
    source: TATE,
    checkedAt: CHECKED,
  },
  {
    id: "victoria-and-albert-museum",
    name: "V&A(ヴィクトリア&アルバート博物館)",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [{ museum: "victoria-and-albert-museum", relation: "here" }],
    source: {
      label: "V&A – Visit V&A South Kensington",
      url: "https://www.vam.ac.uk/south-kensington/visit",
    },
    checkedAt: CHECKED,
  },
  {
    id: "natural-history-museum",
    name: "自然史博物館",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [
      { spot: "natural-history-museum", relation: "here" },
      { museum: "natural-history-museum", relation: "here" },
    ],
    source: { label: "Natural History Museum – Visit", url: "https://www.nhm.ac.uk/visit.html" },
    checkedAt: CHECKED,
  },
  {
    id: "science-museum",
    name: "サイエンス・ミュージアム",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [
      { spot: "science-museum", relation: "here" },
      { museum: "science-museum", relation: "here" },
    ],
    source: { label: "Science Museum – Visit", url: "https://www.sciencemuseum.org.uk/visit" },
    checkedAt: CHECKED,
  },
  {
    id: "imperial-war-museum",
    name: "帝国戦争博物館",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [
      { spot: "imperial-war-museum", relation: "here" },
      { museum: "imperial-war-museum", relation: "here" },
    ],
    source: IWM,
    checkedAt: CHECKED,
  },
  {
    id: "churchill-war-rooms",
    name: "チャーチル戦争指令室",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [{ spot: "churchill-war-rooms", relation: "here" }],
    source: {
      label: "IWM – Churchill War Rooms",
      url: "https://www.iwm.org.uk/visits/churchill-war-rooms",
    },
    checkedAt: CHECKED,
  },
  {
    id: "wallace-collection",
    name: "ウォレス・コレクション",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [{ museum: "the-wallace-collection", relation: "here" }],
    source: { label: "The Wallace Collection – Visit", url: "https://www.wallacecollection.org/visit/" },
    checkedAt: CHECKED,
  },
  {
    id: "design-museum",
    name: "デザイン博物館",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    season: 2026,
    places: [{ museum: "design-museum", relation: "here" }],
    source: {
      label: "Design Museum – Opening hours",
      url: "https://designmuseum.org/plan-your-visit/opening-hours",
    },
    checkedAt: CHECKED,
  },
  {
    id: "london-transport-museum",
    name: "ロンドン交通博物館",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [
      { spot: "london-transport-museum", relation: "here" },
      { museum: "london-transport-museum", relation: "here" },
    ],
    source: {
      label: "London Transport Museum – Christmas",
      url: "https://www.ltmuseum.co.uk/christmas",
    },
    checkedAt: CHECKED,
  },
  {
    id: "london-museum-docklands",
    name: "ドックランズ博物館",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [{ museum: "london-museum-docklands", relation: "here" }],
    source: {
      label: "London Museum Docklands – Need to know",
      url: "https://www.londonmuseum.org.uk/docklands/visit/need-to-know/",
    },
    checkedAt: CHECKED,
  },
  {
    id: "cutty-sark",
    name: "カティサーク",
    group: "museum",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [
      { spot: "cutty-sark", relation: "here" },
      { museum: "cutty-sark", relation: "here" },
    ],
    source: {
      label: "Royal Museums Greenwich – Plan your visit to Cutty Sark",
      url: "https://www.rmg.co.uk/cutty-sark/plan-your-visit",
    },
    checkedAt: CHECKED,
  },
  {
    id: "royal-observatory",
    name: "グリニッジ天文台",
    group: "museum",
    closed: [],
    closedFrom: "2026-11-02",
    notes: ["改修のための全館の休館で、再開の日は発表されていない。"],
    places: [
      { spot: "royal-observatory-greenwich", relation: "here" },
      { museum: "royal-observatory-greenwich", relation: "here" },
    ],
    source: {
      label: "Royal Museums Greenwich – Royal Observatory closures",
      url: "https://www.rmg.co.uk/royal-observatory/plan-your-visit/closures",
    },
    checkedAt: CHECKED,
  },
  {
    id: "sherlock-holmes-museum",
    name: "シャーロック・ホームズ博物館",
    group: "museum",
    closed: ["12-25"],
    openOtherDays: true,
    hours: [{ day: "12-24", text: "9:30〜16:00" }],
    places: [{ museum: "sherlock-holmes-museum", relation: "here" }],
    source: {
      label: "Sherlock Holmes Museum – Christmas Opening Hours",
      url: "https://www.sherlock-holmes.co.uk/christmas-opening-hours/",
    },
    checkedAt: CHECKED,
  },
  {
    id: "charles-dickens-museum",
    name: "チャールズ・ディケンズ博物館",
    group: "museum",
    closed: ["12-25", "12-26"],
    season: 2026,
    hours: [{ day: "12-24", text: "特別公開(予約制)" }],
    notes: [
      "24日はイブの特別公開で、15分ごとの時間指定(大人£25)。",
      "12月は火曜も開き、2〜23日は18:00まで開く。",
    ],
    places: [{ museum: "charles-dickens-museum", relation: "here" }],
    source: {
      label: "Charles Dickens Museum – Planned Closures",
      url: "https://dickensmuseum.com/pages/planned-closures-1",
    },
    checkedAt: CHECKED,
  },

  /* ---------------- 名所・眺め・動物 ---------------- */
  {
    id: "tower-of-london",
    name: "ロンドン塔",
    group: "sight",
    closed: [...DEC_24_26, "01-01"],
    openOtherDays: true,
    places: [{ spot: "tower-of-london", relation: "here" }],
    source: {
      label: "Historic Royal Palaces – Tower of London opening and closing times",
      url: "https://www.hrp.org.uk/tower-of-london/visit/opening-and-closing-times/",
    },
    checkedAt: CHECKED,
  },
  {
    id: "tower-bridge",
    name: "タワーブリッジ(内部の見学)",
    group: "sight",
    closed: DEC_24_26,
    openOtherDays: true,
    hours: [{ day: "01-01", text: "10:00から" }],
    places: [{ spot: "london-tower-bridge", relation: "here" }],
    source: {
      label: "Tower Bridge – Visitor information",
      url: "https://www.towerbridge.org.uk/plan-your-visit",
    },
    checkedAt: CHECKED,
  },
  {
    id: "hms-belfast",
    name: "HMS ベルファスト",
    group: "sight",
    closed: DEC_24_26,
    openOtherDays: true,
    places: [{ spot: "hms-belfast", relation: "here" }],
    source: { label: "IWM – HMS Belfast", url: "https://www.iwm.org.uk/visits/hms-belfast" },
    checkedAt: CHECKED,
  },
  {
    id: "westminster-abbey",
    name: "ウェストミンスター寺院",
    group: "sight",
    closed: [],
    worshipOnly: ["12-25"],
    notes: ["日曜も礼拝のためだけに開き、観光の見学はできない。"],
    places: [{ spot: "westminster-abbey", relation: "here" }],
    source: { label: "Westminster Abbey – FAQ", url: "https://www.westminster-abbey.org/faq" },
    checkedAt: CHECKED,
  },
  {
    id: "st-pauls-cathedral",
    name: "セント・ポール大聖堂",
    group: "sight",
    closed: [],
    season: 2026,
    notes: [
      "25日は11:00からの聖餐式と15:00からの夕べの祈りに、無料・予約なしで加われる。観光の見学の扱いは、まだ案内されていない。",
    ],
    places: [{ spot: "st-pauls-cathedral", relation: "here" }],
    source: {
      label: "St Paul's Cathedral – Advent and Christmas",
      url: "https://www.stpauls.co.uk/christmas",
    },
    checkedAt: CHECKED,
  },
  {
    id: "london-eye",
    name: "ロンドン・アイ",
    group: "sight",
    closed: ["12-25"],
    notes: ["1月には毎年、点検のための休みがある。"],
    places: [{ spot: "london-eye", relation: "here" }],
    source: {
      label: "London Eye – Opening & Closing Times",
      url: "https://www.londoneye.com/plan-your-visit/before-you-visit/opening-hours/",
    },
    checkedAt: CHECKED,
  },
  {
    id: "sky-garden",
    name: "スカイガーデン",
    group: "sight",
    closed: ["12-25"],
    hours: [{ day: "12-24", text: "18:00まで" }],
    places: [{ spot: "sky-garden-london", relation: "here" }],
    source: {
      label: "Sky Garden – Closure Dates",
      url: "https://skygarden.london/sky-garden-closure-dates/",
    },
    checkedAt: CHECKED,
  },
  {
    id: "madame-tussauds",
    name: "マダム・タッソー",
    group: "sight",
    closed: ["12-25"],
    openOtherDays: true,
    places: [{ spot: "madame-tussauds-london", relation: "here" }],
    source: {
      label: "Madame Tussauds London – Opening Times",
      url: "https://www.madametussauds.com/london/plan-your-visit/before-you-visit/opening-hours/",
    },
    checkedAt: CHECKED,
  },
  {
    id: "london-dungeon",
    name: "ロンドン・ダンジョン",
    group: "sight",
    closed: ["12-25"],
    places: [{ spot: "london-dungeon", relation: "here" }],
    source: {
      label: "Merlin London – When can I visit The London Dungeon?",
      url: "https://support.londoneye.com/hc/en-us/articles/213228725-When-can-I-visit-The-London-Dungeon-",
    },
    checkedAt: CHECKED,
  },
  {
    id: "shreks-adventure",
    name: "シュレック・アドベンチャー",
    group: "sight",
    closed: ["12-25"],
    places: [{ spot: "shreks-adventure-london", relation: "here" }],
    source: {
      label: "Merlin London – When can I visit Shrek's Adventure London?",
      url: "https://support.londoneye.com/hc/en-us/articles/10738678107933-When-can-I-visit-Shrek-s-Adventure-London",
    },
    checkedAt: CHECKED,
  },
  {
    id: "london-zoo",
    name: "ロンドン動物園",
    group: "sight",
    closed: ["12-25"],
    openOtherDays: true,
    places: [{ spot: "london-zoo", relation: "here" }],
    source: {
      label: "ZSL London Zoo – Opening Times",
      url: "https://www.zsl.org/zsl-london-zoo/visitor-information/opening-times",
    },
    checkedAt: CHECKED,
  },
  {
    id: "kew-gardens",
    name: "キュー・ガーデン(昼の庭園)",
    group: "sight",
    closed: ["12-24", "12-25"],
    openOtherDays: true,
    notes: ["夜のクリスマス・アット・キューは24日も21:00まで開く(25日は休み)。"],
    places: [{ spot: "kew-gardens-london", relation: "here" }],
    source: {
      label: "Kew – Opening and closing times",
      url: "https://www.kew.org/kew-gardens/visit-kew-gardens/opening-and-closing-times",
    },
    checkedAt: CHECKED,
  },
  {
    id: "hampton-court-maze",
    name: "ハンプトン・コート宮殿の迷路",
    group: "sight",
    closed: DEC_24_26,
    places: [{ spot: "hampton-court-palace", relation: "here" }],
    source: {
      label: "Historic Royal Palaces – The Maze",
      url: "https://www.hrp.org.uk/hampton-court-palace/whats-on/the-maze/",
    },
    checkedAt: CHECKED,
  },
  {
    id: "planetarium",
    name: "ピーター・ハリソン・プラネタリウム",
    group: "sight",
    closed: [],
    closedFrom: "2025-09-08",
    notes: ["天文台の改修に先立つ休館で、再開の日は発表されていない。"],
    places: [{ spot: "peter-harrison-planetarium-greenwich", relation: "here" }],
    source: {
      label: "Royal Museums Greenwich – Royal Observatory closures",
      url: "https://www.rmg.co.uk/royal-observatory/plan-your-visit/closures",
    },
    checkedAt: CHECKED,
  },

  /* ---------------- 店・市場 ---------------- */
  {
    /*
      個々の店の告知ではなく法律。イングランドとウェールズでは、床面積
      280㎡を超える店はクリスマス当日に開けない(日曜でも平日でも)。
    */
    id: "large-shops",
    name: "デパートなどの大型店",
    group: "shop",
    closed: ["12-25"],
    notes: [
      "床面積が280㎡を超える店は、法律でクリスマス当日に開けない(2004年クリスマス営業法)。",
    ],
    places: [
      { spot: "harrods-london", relation: "here" },
      { spot: "selfridges-london", relation: "here" },
      { spot: "liberty-london", relation: "here" },
      { spot: "fortnum-and-mason", relation: "here" },
      { spot: "hamleys-regent-street", relation: "here" },
    ],
    source: {
      label: "legislation.gov.uk – Christmas Day (Trading) Act 2004 解説",
      url: "https://www.legislation.gov.uk/ukpga/2004/26/notes",
    },
    checkedAt: CHECKED,
  },
  {
    id: "borough-market",
    name: "バラ・マーケット",
    group: "shop",
    closed: ["12-25", "12-26", "12-27"],
    season: 2026,
    hours: [{ day: "12-24", text: "8:00〜15:00" }],
    notes: ["11月30日から12月いっぱいは、日曜を含めて毎日開く(25〜27日を除く)。"],
    places: [{ spot: "borough-market", relation: "here" }],
    source: {
      label: "Borough Market – Christmas opening times",
      url: "https://boroughmarket.org.uk/events/christmas-opening-times",
    },
    checkedAt: CHECKED,
  },
];

/** 早見表の段の名前と並び。 */
export const CLOSURE_GROUPS: { key: VenueClosure["group"]; label: string }[] = [
  { key: "museum", label: "美術館・博物館" },
  { key: "sight", label: "名所・眺め・動物" },
  { key: "shop", label: "店・市場" },
];

/** その年の案内がその日に当てはまるか(season の無い決まりは毎年当てはまる)。 */
function inSeason(closure: VenueClosure, date: string): boolean {
  return closure.season === undefined || closure.season === seasonYear(date);
}

/** 長期休館の期間中か。 */
export function isLongTermClosed(closure: VenueClosure, date: string): boolean {
  return (
    !!closure.closedFrom &&
    date >= closure.closedFrom &&
    (!closure.reopens || date < closure.reopens)
  );
}

/** その日("YYYY-MM-DD")に休むか。 */
export function isClosedOn(closure: VenueClosure, date: string): boolean {
  if (isLongTermClosed(closure, date)) return true;
  return inSeason(closure, date) && closure.closed.includes(date.slice(5));
}

export type HolidayCell =
  | { kind: "closed"; longTerm: boolean }
  | { kind: "short"; text: string }
  | { kind: "worship" }
  | { kind: "open" }
  | { kind: "unknown" };

/** 早見表の1マス。 */
export function holidayCell(closure: VenueClosure, date: string): HolidayCell {
  if (isClosedOn(closure, date)) {
    return { kind: "closed", longTerm: isLongTermClosed(closure, date) };
  }
  if (!inSeason(closure, date)) return { kind: "unknown" };
  const monthDay = date.slice(5);
  if (closure.worshipOnly?.includes(monthDay)) return { kind: "worship" };
  const hours = closure.hours?.find((h) => h.day === monthDay);
  if (hours) return { kind: "short", text: hours.text };
  return closure.openOtherDays ? { kind: "open" } : { kind: "unknown" };
}

/**
 * ある日に休む館。longTerm を false にすると、改修などの長期休館を外す
 * (日めくりの札に毎日同じ館が並ばないように)。
 */
export function closedOn(date: string, { longTerm = true } = {}): VenueClosure[] {
  return venueClosures.filter(
    (c) => isClosedOn(c, date) && (longTerm || !isLongTermClosed(c, date)),
  );
}
