import type { SeasonSource } from "./types";

/**
 * 12月24日から1月1日までの、旅程に響く日の事実。
 *
 * 交通は TfL と National Rail の案内から。TfL のその年の年末年始の運行は
 * 例年11月下旬に発表されるので、それまでは前の年の案内を出典にして
 * 「例年」と書く(2026-10-18 時点は2025年の案内)。発表が出たら出典と
 * 文面を直すこと。
 *
 * 美術館の休みはここに書かない。closures.ts の休館日から日ごとに数える。
 * 振替休日も書かない。gov.uk の祝日データ(lib/london-months/holidays.ts)から
 * 年ごとに出す(2026年はボクシング・デーが土曜で、28日の月曜が振替休日)。
 */

export type DayNote = { text: string; source?: SeasonSource };

export type SpecialDay = {
  /** "MM-DD" */
  monthDay: string;
  name: string;
  /** stop = 街が止まる日 / warn = 予定が崩れやすい日 / info = 催しの日 */
  tone: "stop" | "warn" | "info";
  /** 1行の要約。日めくりの札の見出しに出す。 */
  headline: string;
  transport: DayNote[];
  life: DayNote[];
  links?: { href: string; label: string }[];
};

const TFL_FESTIVE_2025: SeasonSource = {
  label: "TfL – 2025年の年末年始の運行",
  url: "https://tfl-newsroom.prgloo.com/news/majority-of-tfl-services-running-over-christmas-and-new-year-to-help-customers-make-the-most-of-london-this-festive-season",
};

const NATIONAL_RAIL_BANK_HOLIDAYS: SeasonSource = {
  label: "National Rail – Bank Holiday Information(Elizabeth line)",
  url: "https://www.nationalrail.co.uk/travel-information/bank-holiday-information-elizabeth-line/",
};

const CHRISTMAS_TRADING_ACT: SeasonSource = {
  label: "legislation.gov.uk – Christmas Day (Trading) Act 2004 解説",
  url: "https://www.legislation.gov.uk/ukpga/2004/26/notes",
};

export const SPECIAL_DAYS: SpecialDay[] = [
  {
    monthDay: "12-24",
    name: "クリスマス・イブ",
    tone: "warn",
    headline: "交通は早じまい、主な美術館は休館",
    transport: [
      {
        text: "地下鉄・バスは動くが、例年いつもより早く終わる。",
        source: TFL_FESTIVE_2025,
      },
    ],
    life: [
      { text: "マーケットやリンクも、多くは夕方で早じまいする。" },
    ],
  },
  {
    monthDay: "12-25",
    name: "クリスマス",
    tone: "stop",
    headline: "地下鉄もバスも鉄道も止まる",
    transport: [
      {
        text: "地下鉄・バス・エリザベス線など、TfL の交通は例年ほぼすべて運休。動くのは貸自転車のサンタンデール・サイクルとタクシーくらいになる。",
        source: TFL_FESTIVE_2025,
      },
      {
        text: "鉄道も走らない。空港と市内を結ぶ列車も止まるので、この日に着く便は移動の手配が要る。",
        source: NATIONAL_RAIL_BANK_HOLIDAYS,
      },
    ],
    life: [
      {
        text: "デパートなど床面積280㎡を超える店は、法律でこの日は開けない。",
        source: CHRISTMAS_TRADING_ACT,
      },
      {
        text: "美術館・博物館も、マーケットとリンクも、ほとんどが休み。教会は礼拝のために開く(観光の見学ではなく、礼拝に加わる形になる)。",
      },
    ],
    links: [{ href: "/sightseeing/travel-tips#calendar", label: "旅の実用情報(25日の過ごし方)" }],
  },
  {
    monthDay: "12-26",
    name: "ボクシング・デー",
    tone: "warn",
    headline: "冬のセールの初日、交通は減便",
    transport: [
      {
        text: "地下鉄・バスは本数を減らして動く。エリザベス線などは一部の区間が運休する年が多い。",
        source: TFL_FESTIVE_2025,
      },
      {
        text: "鉄道はほとんどの路線が運休し、動く路線もごくわずか。",
        source: NATIONAL_RAIL_BANK_HOLIDAYS,
      },
    ],
    life: [{ text: "冬のセールの初日で、繁華街は混み合う。" }],
  },
  {
    monthDay: "12-31",
    name: "大晦日",
    tone: "info",
    headline: "年越し花火(チケット制)",
    transport: [],
    life: [
      {
        text: "テムズ川沿いの年越し花火はチケット制で、チケットの無い人は川沿いの会場に近づけない。夜は会場の周りの道路と駅に規制がかかる。",
      },
    ],
    links: [{ href: "/events/new-years-eve-fireworks", label: "ロンドンの年越し花火" }],
  },
  {
    monthDay: "01-01",
    name: "元日",
    tone: "info",
    headline: "元日のパレード、店は休みか短縮",
    transport: [],
    life: [
      { text: "店や飲食店は休みか短縮営業が多い。" },
    ],
    links: [{ href: "/events/new-years-day-parade", label: "元日のロンドン・パレード" }],
  },
];
