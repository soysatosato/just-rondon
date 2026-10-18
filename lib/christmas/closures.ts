import type { VenueClosure } from "./types";

/**
 * 年末年始に休む主な館。
 *
 * 「12月24〜26日は休館」のように、毎年同じ規則として公式サイトに書かれて
 * いるものだけを載せる(日付は "MM-DD")。年ごとに変わる臨時の休みや、
 * その年だけの短縮営業はここに入れない。
 *
 * 載せていない館は「休まない」という意味ではない。2026-10-18 の時点で
 * 年末年始の扱いを公式に確かめられなかった館(ケンジントン宮殿、
 * スタジオツアーなど)は外してある。
 */

const CHECKED = "2026-10-18";
const DEC_24_26 = ["12-24", "12-25", "12-26"];

export const venueClosures: VenueClosure[] = [
  {
    id: "british-museum",
    name: "大英博物館",
    closed: DEC_24_26,
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
    closed: [...DEC_24_26, "01-01"],
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
    id: "tate-modern",
    name: "テート・モダン",
    closed: DEC_24_26,
    places: [
      { spot: "tate-modern", relation: "here" },
      { museum: "tate-modern", relation: "here" },
    ],
    source: {
      label: "Tate – Frequently asked questions(テートの全館)",
      url: "https://www.tate.org.uk/about-us/frequently-asked-questions",
    },
    checkedAt: CHECKED,
  },
  {
    id: "tate-britain",
    name: "テート・ブリテン",
    closed: DEC_24_26,
    places: [
      { spot: "tate-britain", relation: "here" },
      { museum: "tate-britain", relation: "here" },
    ],
    source: {
      label: "Tate – Frequently asked questions(テートの全館)",
      url: "https://www.tate.org.uk/about-us/frequently-asked-questions",
    },
    checkedAt: CHECKED,
  },
  {
    id: "natural-history-museum",
    name: "自然史博物館",
    closed: DEC_24_26,
    places: [
      { spot: "natural-history-museum", relation: "here" },
      { museum: "natural-history-museum", relation: "here" },
    ],
    source: {
      label: "Natural History Museum – Visit",
      url: "https://www.nhm.ac.uk/visit.html",
    },
    checkedAt: CHECKED,
  },
  {
    id: "science-museum",
    name: "サイエンス・ミュージアム",
    closed: DEC_24_26,
    places: [
      { spot: "science-museum", relation: "here" },
      { museum: "science-museum", relation: "here" },
    ],
    source: {
      label: "Science Museum – Visit",
      url: "https://www.sciencemuseum.org.uk/visit",
    },
    checkedAt: CHECKED,
  },
  {
    id: "victoria-and-albert-museum",
    name: "V&A(ヴィクトリア&アルバート博物館)",
    closed: DEC_24_26,
    places: [{ museum: "victoria-and-albert-museum", relation: "here" }],
    source: {
      label: "V&A – Visit V&A South Kensington",
      url: "https://www.vam.ac.uk/south-kensington/visit",
    },
    checkedAt: CHECKED,
  },
  {
    id: "imperial-war-museum",
    name: "帝国戦争博物館",
    closed: DEC_24_26,
    places: [
      { spot: "imperial-war-museum", relation: "here" },
      { museum: "imperial-war-museum", relation: "here" },
    ],
    source: { label: "IWM London", url: "https://www.iwm.org.uk/visits/iwm-london" },
    checkedAt: CHECKED,
  },
  {
    id: "tower-of-london",
    name: "ロンドン塔",
    closed: [...DEC_24_26, "01-01"],
    places: [{ spot: "tower-of-london", relation: "here" }],
    source: {
      label: "Historic Royal Palaces – Tower of London opening and closing times",
      url: "https://www.hrp.org.uk/tower-of-london/visit/opening-and-closing-times/",
    },
    checkedAt: CHECKED,
  },
  {
    id: "london-eye",
    name: "ロンドン・アイ",
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
    id: "kew-gardens",
    name: "キュー・ガーデン(昼の庭園)",
    closed: ["12-24", "12-25"],
    notes: ["夜のクリスマス・アット・キューは24日も21:00まで開く(25日は休み)。"],
    places: [{ spot: "kew-gardens-london", relation: "here" }],
    source: {
      label: "Kew – Opening and closing times",
      url: "https://www.kew.org/kew-gardens/visit-kew-gardens/opening-and-closing-times",
    },
    checkedAt: CHECKED,
  },
  {
    id: "westminster-abbey",
    name: "ウェストミンスター寺院",
    closed: [],
    notes: [
      "クリスマスと日曜は礼拝のためだけに開き、観光の見学はできない。",
    ],
    places: [{ spot: "westminster-abbey", relation: "here" }],
    source: {
      label: "Westminster Abbey – FAQ",
      url: "https://www.westminster-abbey.org/faq",
    },
    checkedAt: CHECKED,
  },
  {
    /*
      個々の店の告知ではなく法律。イングランドとウェールズでは、床面積
      280㎡を超える店はクリスマス当日に開けない(日曜でも平日でも)。
    */
    id: "large-shops",
    name: "デパートなどの大型店",
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
];

/** ある日("YYYY-MM-DD")に休む館。 */
export function closedOn(date: string): VenueClosure[] {
  const monthDay = date.slice(5);
  return venueClosures.filter((c) => c.closed.includes(monthDay));
}
