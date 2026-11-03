import { formatJst, londonOffsetMs } from "@/lib/publish-schedule";
import {
  DIFFICULTY_LABELS,
  LONDON_CLUBS,
  type ClubSlug,
  type LondonClub,
} from "./clubs";

/**
 * ロンドンのクラブのプレミアリーグのホーム試合(/sightseeing/football/fixtures)。
 *
 * 旅行の日程を決める人の問いは「その日に試合があるか」と「その日時はもう
 * 動かないか」の2つ。日程表は開幕前に出るが、キックオフは放映カードの
 * 発表で金〜月のどこかへ動く。どこまで確定しているかは、プレミアリーグが
 * 発表の予定日ごと公表しているので、公式を根拠に言い切れる。
 *
 * 元データの取り方(2026-11 にユーザーと決めた方針):
 * 公式の発表記事(下の FIXTURE_SOURCES)を読んで、ロンドンの6クラブの
 * ホーム試合だけを手で写す。公式ファンタジー(FPL)の非公開 API でも
 * 全試合が取れるが、使わない。
 * - 未確定の試合も「確定」の印で返ってきて、確定かどうかの判断に使えない
 * - premierleague.com の規約は、商用での利用と「サイトから得た素材で
 *   データベースを作ること」を禁じている。広告のあるサイトで毎日機械的に
 *   取り込むのはこれに反するおそれがある
 * 確定の範囲は人が公式の発表で上げるもので、自動にしても手間は減らない。
 *
 * 公式が放映カードを発表したらやること(予定日は ANNOUNCEMENTS):
 * 1. 発表記事(「Fixture amendments for Premier League matches in ◯◯」)を開き、
 *    その節のロンドンのホーム試合の日付・時刻・中継局を ROWS で直す
 * 2. CONFIRMED_THROUGH を、発表された最後の節と発表日に上げる
 * 3. FIXTURE_SOURCES に記事を足し、FIXTURES_CHECKED_ON を直す
 * 4. npx tsx scripts/check-fixtures.ts
 * 予定日を1週間過ぎても 2 をしていないと、ページが「まだ反映していない」と出す。
 *
 * シーズンが替わったら、ROWS を新しい日程表(「All 380 fixtures for …」)で
 * 入れ直し、昇降格は lib/football/clubs.ts の LONDON_CLUBS で直す。
 */

/**
 * 対戦相手として出てくる20クラブの呼び名。表記はサッカーの記事
 * (components/sightseeing/football)にそろえ、「ヴ」は使わない。
 * satisfies は、ロンドンの6クラブ(ClubSlug)が欠けていないことの確認。
 */
export const PL_CLUB_NAMES = {
  arsenal: "アーセナル",
  "aston-villa": "アストン・ビラ",
  bournemouth: "ボーンマス",
  brentford: "ブレントフォード",
  brighton: "ブライトン",
  chelsea: "チェルシー",
  coventry: "コベントリー",
  "crystal-palace": "クリスタル・パレス",
  everton: "エバートン",
  fulham: "フラム",
  hull: "ハル・シティ",
  ipswich: "イプスウィッチ",
  leeds: "リーズ",
  liverpool: "リバプール",
  "man-city": "マンチェスター・シティ",
  "man-utd": "マンチェスター・ユナイテッド",
  newcastle: "ニューカッスル",
  "nottm-forest": "ノッティンガム・フォレスト",
  sunderland: "サンダーランド",
  tottenham: "トッテナム",
} as const satisfies Record<ClubSlug, string> & Record<string, string>;

export type PlClub = keyof typeof PL_CLUB_NAMES;

/** 英国で生中継する局。発表済みの節で、中継のある試合にだけ付く。 */
export type Broadcaster = "Sky Sports" | "TNT Sports";

export type Fixture = {
  matchweek: number;
  /** ロンドンの日付。未確定の試合は日程表の仮の日付。 */
  date: string;
  /** ロンドンの時刻 "15:00"。 */
  kickoff: string;
  home: ClubSlug;
  away: PlClub;
  tv?: Broadcaster;
  /**
   * 発表後でも、条件しだいで移る日(公式の「Possible fixture changes」)。
   * 移りうる範囲に含めるので、旅程の判定に効く。
   */
  mayMoveTo?: string;
  /** 公式が添えた条件。1文。 */
  note?: string;
};

type Row = [
  matchweek: number,
  date: string,
  kickoff: string,
  home: ClubSlug,
  away: PlClub,
  tv?: Broadcaster,
];

/**
 * 第10節(2026-11-06〜)以降のロンドンのホーム試合。各節3試合ずつ、計87試合。
 *
 * 第10〜12節: Fixture amendments … in November(2026-09-21)
 * 第13〜16節: Fixture amendments … in December(2026-10-19)
 * 第17〜20節: SEVEN Boxing Day matches confirmed …(2026-10-19)
 * 第21〜38節: All 380 fixtures for 2026/27(週末の節は15:00、平日の節は20:00。
 *             最終節だけは開幕前から全試合16:00と決まっている)
 */
const ROWS: Row[] = [
  [10, "2026-11-07", "15:00", "arsenal", "hull"],
  [10, "2026-11-07", "15:00", "fulham", "newcastle"],
  [10, "2026-11-08", "14:00", "crystal-palace", "liverpool", "Sky Sports"],

  [11, "2026-11-21", "15:00", "chelsea", "leeds"],
  [11, "2026-11-21", "15:00", "tottenham", "ipswich"],
  [11, "2026-11-23", "20:00", "brentford", "everton", "Sky Sports"],

  [12, "2026-11-29", "14:05", "crystal-palace", "hull", "Sky Sports"],
  [12, "2026-11-29", "14:05", "fulham", "bournemouth", "Sky Sports"],
  [12, "2026-11-29", "16:30", "arsenal", "man-city", "Sky Sports"],

  [13, "2026-12-02", "19:30", "chelsea", "crystal-palace", "Sky Sports"],
  [13, "2026-12-02", "20:15", "brentford", "arsenal", "Sky Sports"],
  [13, "2026-12-03", "20:00", "tottenham", "fulham", "Sky Sports"],

  [14, "2026-12-05", "12:30", "chelsea", "liverpool", "TNT Sports"],
  [14, "2026-12-05", "20:00", "brentford", "man-city", "Sky Sports"],
  [14, "2026-12-06", "16:30", "tottenham", "arsenal", "Sky Sports"],

  [15, "2026-12-12", "15:00", "fulham", "brentford"],
  [15, "2026-12-13", "14:00", "arsenal", "bournemouth", "Sky Sports"],
  [15, "2026-12-13", "19:00", "crystal-palace", "man-utd", "TNT Sports"],

  [16, "2026-12-19", "12:30", "brentford", "newcastle", "TNT Sports"],
  [16, "2026-12-20", "16:30", "arsenal", "man-utd", "Sky Sports"],
  [16, "2026-12-21", "20:00", "chelsea", "aston-villa", "Sky Sports"],

  [17, "2026-12-26", "15:00", "fulham", "brighton"],
  [17, "2026-12-26", "15:00", "tottenham", "bournemouth"],
  [17, "2026-12-27", "19:00", "crystal-palace", "arsenal", "Sky Sports"],

  [18, "2026-12-29", "19:30", "tottenham", "brighton", "Sky Sports"],
  [18, "2026-12-30", "19:30", "crystal-palace", "bournemouth", "Sky Sports"],
  [18, "2026-12-30", "19:30", "fulham", "arsenal", "Sky Sports"],

  [19, "2027-01-02", "15:00", "arsenal", "ipswich"],
  [19, "2027-01-02", "15:00", "brentford", "crystal-palace"],
  [19, "2027-01-03", "14:00", "chelsea", "newcastle", "Sky Sports"],

  [20, "2027-01-05", "19:30", "arsenal", "brentford", "Sky Sports"],
  [20, "2027-01-06", "19:30", "crystal-palace", "chelsea", "Sky Sports"],
  [20, "2027-01-06", "19:30", "fulham", "tottenham", "Sky Sports"],

  [21, "2027-01-16", "15:00", "brentford", "brighton"],
  [21, "2027-01-16", "15:00", "chelsea", "sunderland"],
  [21, "2027-01-16", "15:00", "tottenham", "leeds"],

  [22, "2027-01-23", "15:00", "arsenal", "newcastle"],
  [22, "2027-01-23", "15:00", "crystal-palace", "tottenham"],
  [22, "2027-01-23", "15:00", "fulham", "aston-villa"],

  [23, "2027-01-30", "15:00", "brentford", "man-utd"],
  [23, "2027-01-30", "15:00", "chelsea", "nottm-forest"],
  [23, "2027-01-30", "15:00", "tottenham", "sunderland"],

  [24, "2027-02-06", "15:00", "arsenal", "liverpool"],
  [24, "2027-02-06", "15:00", "crystal-palace", "coventry"],
  [24, "2027-02-06", "15:00", "fulham", "man-city"],

  [25, "2027-02-10", "20:00", "crystal-palace", "brentford"],
  [25, "2027-02-10", "20:00", "fulham", "nottm-forest"],
  [25, "2027-02-10", "20:00", "tottenham", "man-city"],

  [26, "2027-02-20", "15:00", "arsenal", "fulham"],
  [26, "2027-02-20", "15:00", "brentford", "coventry"],
  [26, "2027-02-20", "15:00", "chelsea", "ipswich"],

  [27, "2027-02-27", "15:00", "crystal-palace", "sunderland"],
  [27, "2027-02-27", "15:00", "fulham", "leeds"],
  [27, "2027-02-27", "15:00", "tottenham", "liverpool"],

  [28, "2027-03-03", "20:00", "arsenal", "crystal-palace"],
  [28, "2027-03-03", "20:00", "brentford", "ipswich"],
  [28, "2027-03-03", "20:00", "chelsea", "coventry"],

  [29, "2027-03-13", "15:00", "chelsea", "arsenal"],
  [29, "2027-03-13", "15:00", "crystal-palace", "fulham"],
  [29, "2027-03-13", "15:00", "tottenham", "nottm-forest"],

  [30, "2027-03-20", "15:00", "arsenal", "sunderland"],
  [30, "2027-03-20", "15:00", "brentford", "bournemouth"],
  [30, "2027-03-20", "15:00", "fulham", "liverpool"],

  [31, "2027-04-10", "15:00", "chelsea", "fulham"],
  [31, "2027-04-10", "15:00", "crystal-palace", "everton"],
  [31, "2027-04-10", "15:00", "tottenham", "brentford"],

  [32, "2027-04-17", "15:00", "arsenal", "aston-villa"],
  [32, "2027-04-17", "15:00", "brentford", "leeds"],
  [32, "2027-04-17", "15:00", "fulham", "sunderland"],

  [33, "2027-04-24", "15:00", "brentford", "fulham"],
  [33, "2027-04-24", "15:00", "chelsea", "man-city"],
  [33, "2027-04-24", "15:00", "tottenham", "hull"],

  [34, "2027-05-01", "15:00", "arsenal", "tottenham"],
  [34, "2027-05-01", "15:00", "crystal-palace", "aston-villa"],
  [34, "2027-05-01", "15:00", "fulham", "everton"],

  [35, "2027-05-08", "15:00", "brentford", "aston-villa"],
  [35, "2027-05-08", "15:00", "fulham", "ipswich"],
  [35, "2027-05-08", "15:00", "tottenham", "chelsea"],

  [36, "2027-05-15", "15:00", "arsenal", "nottm-forest"],
  [36, "2027-05-15", "15:00", "chelsea", "everton"],
  [36, "2027-05-15", "15:00", "crystal-palace", "brighton"],

  [37, "2027-05-23", "15:00", "brentford", "hull"],
  [37, "2027-05-23", "15:00", "fulham", "coventry"],
  [37, "2027-05-23", "15:00", "tottenham", "man-utd"],

  [38, "2027-05-30", "16:00", "arsenal", "brighton"],
  [38, "2027-05-30", "16:00", "chelsea", "brentford"],
  [38, "2027-05-30", "16:00", "crystal-palace", "leeds"],
];

/**
 * 発表後でも条件しだいで動く試合(公式の「Possible Premier League fixture
 * changes in 2026/27」に載っているもの)。キーは「節-ホーム」。
 */
const CONDITIONAL: Record<string, Pick<Fixture, "mayMoveTo" | "note">> = {
  "16-chelsea": {
    mayMoveTo: "2026-12-19",
    note: "EFLカップの日程しだいで、12月19日(土)20:00に移ります(公式発表)。",
  },
};

export const FIXTURES: readonly Fixture[] = ROWS.map(
  ([matchweek, date, kickoff, home, away, tv]) => ({
    matchweek,
    date,
    kickoff,
    home,
    away,
    ...(tv ? { tv } : {}),
    ...CONDITIONAL[`${matchweek}-${home}`],
  }),
);

/** 放映カードの発表で日時が決まった最後の節と、その発表の日。 */
export const CONFIRMED_THROUGH = {
  matchweek: 20,
  announcedOn: "2026-10-19",
} as const;

/** 最終節。全試合が同じ時刻(16:00)で、開幕前から決まっている。 */
export const FINAL_MATCHWEEK = 38;

/**
 * 公式の発表予定(「Dates when 2026/27 Premier League live TV fixtures will
 * be announced」、2026-06-19)。weekOf はその週の月曜。第37節は
 * 「FAカップ準決勝のあと」とだけあって日付が無い。
 */
export const ANNOUNCEMENTS: readonly {
  from: number;
  to: number;
  weekOf: string | null;
}[] = [
  { from: 21, to: 23, weekOf: "2026-11-30" },
  { from: 24, to: 27, weekOf: "2026-12-21" },
  { from: 28, to: 30, weekOf: "2027-01-18" },
  { from: 31, to: 33, weekOf: "2027-02-22" },
  { from: 34, to: 34, weekOf: "2027-03-22" },
  { from: 35, to: 35, weekOf: "2027-03-29" },
  { from: 36, to: 36, weekOf: "2027-04-05" },
  { from: 37, to: 37, weekOf: null },
];

/** 最後に公式の記事と照らした日。 */
export const FIXTURES_CHECKED_ON = "2026-11-03";

export const FIXTURE_SOURCES = [
  {
    label: "Premier League – All 380 fixtures for 2026/27 Premier League season",
    url: "https://www.premierleague.com/en/news/4675097/all-380-fixtures-for-202627-premier-league-season",
  },
  {
    label: "Premier League – Fixture schedule released for Season 2026/27(最終節の時刻・変更の告知期間)",
    url: "https://www.premierleague.com/en/news/4675508/premier-league-fixture-schedulereleased-for-season-202627",
  },
  {
    label: "Premier League – Dates when 2026/27 live TV fixtures will be announced",
    url: "https://www.premierleague.com/en/news/4675211/dates-when-202627-premier-league-live-tv-fixtures-will-be-announced",
  },
  {
    label: "Premier League – Fixture amendments for matches in November",
    url: "https://www.premierleague.com/en/news/4725574/fixture-amendments-for-premier-league-matches-in-november",
  },
  {
    label: "Premier League – Fixture amendments for matches in December",
    url: "https://www.premierleague.com/en/news/4743152/fixture-amendments-for-premier-league-matches-in-december",
  },
  {
    label: "Premier League – Festive fixtures (26 December – 7 January)",
    url: "https://www.premierleague.com/en/news/4713230",
  },
  {
    label: "Premier League – Possible fixture changes in 2026/27",
    url: "https://www.premierleague.com/en/news/3774835",
  },
] as const;

/* ------------------------------------------------------------------ *
 * 日付
 * ------------------------------------------------------------------ */

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

/** ISO 日付に日数を足す。UTC の正午で計算して夏時間の境目でずれないようにする。 */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days, 12)).toISOString().slice(0, 10);
}

/** 0=日 〜 6=土。 */
function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

/** "2026-11-07" → "11月7日(土)" */
export function formatMatchDay(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}月${d}日(${WEEKDAY_JA[weekdayOf(iso)]})`;
}

/** 同じ月なら後ろの月を省く。"1月15日(金)〜18日(月)" */
export function formatDayRange(from: string, to: string): string {
  if (from === to) return formatMatchDay(from);
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const end = formatMatchDay(to);
  return `${formatMatchDay(from)}〜${sameMonth ? end.replace(/^\d+月/, "") : end}`;
}

/** キックオフの瞬間。キックオフは夏時間の切り替え(深夜1〜2時)にかからない。 */
function kickoffInstant(fixture: Fixture): Date {
  const [y, m, d] = fixture.date.split("-").map(Number);
  const [hh, mm] = fixture.kickoff.split(":").map(Number);
  const asUtc = Date.UTC(y, m - 1, d, hh, mm);
  return new Date(asUtc - londonOffsetMs(new Date(asUtc)));
}

/* ------------------------------------------------------------------ *
 * 確定・未確定
 * ------------------------------------------------------------------ */

export type FixtureStatus = "confirmed" | "provisional";

export function fixtureStatus(fixture: Fixture): FixtureStatus {
  return fixture.matchweek <= CONFIRMED_THROUGH.matchweek ||
    fixture.matchweek === FINAL_MATCHWEEK
    ? "confirmed"
    : "provisional";
}

/**
 * 試合が行われうる範囲(ロンドンの日付)。
 *
 * 未確定の試合は、放映に選ばれると同じ週末の金〜月(平日の節は火〜木)の
 * どこかへ動く。確定した試合はその日だけ。ただし条件つきで移る試合は、
 * 移り先の日まで広げる。
 */
export function possibleWindow(fixture: Fixture): { from: string; to: string } {
  if (fixtureStatus(fixture) === "confirmed") {
    if (!fixture.mayMoveTo) return { from: fixture.date, to: fixture.date };
    const [a, b] = [fixture.date, fixture.mayMoveTo].sort();
    return { from: a, to: b };
  }
  const dow = weekdayOf(fixture.date);
  if (dow >= 2 && dow <= 4) {
    return { from: addDays(fixture.date, 2 - dow), to: addDays(fixture.date, 4 - dow) };
  }
  // 週末の節。金曜を起点に数える(日=0 は前の金曜から2日目)。
  const sinceFriday = (dow + 2) % 7;
  const friday = addDays(fixture.date, -sinceFriday);
  return { from: friday, to: addDays(friday, 3) };
}

/** その節の放映カードの発表予定。発表済みと最終節は null。 */
export function announcementFor(matchweek: number) {
  if (matchweek <= CONFIRMED_THROUGH.matchweek || matchweek === FINAL_MATCHWEEK) {
    return null;
  }
  return ANNOUNCEMENTS.find((a) => matchweek >= a.from && matchweek <= a.to) ?? null;
}

/** "2026-11-30" → "11月30日の週"。日付の無い第37節は公式の書き方をそのまま。 */
export function formatAnnouncement(a: { weekOf: string | null }): string {
  if (!a.weekOf) return "FAカップ準決勝のあと";
  const [, m, d] = a.weekOf.split("-").map(Number);
  return `${m}月${d}日の週`;
}

/**
 * 次に発表される節。予定日を1週間過ぎても CONFIRMED_THROUGH を上げて
 * いなければ overdue。ページはそのとき「まだ反映していない」と出す。
 */
export function nextAnnouncement(today: string) {
  const next = ANNOUNCEMENTS.find((a) => a.from > CONFIRMED_THROUGH.matchweek);
  if (!next) return null;
  const overdue = !!next.weekOf && addDays(next.weekOf, 7) <= today;
  return { ...next, overdue };
}

/* ------------------------------------------------------------------ *
 * 表示用
 * ------------------------------------------------------------------ */

function clubOf(slug: ClubSlug): LondonClub {
  const club = LONDON_CLUBS.find((c) => c.slug === slug);
  if (!club) {
    throw new Error(`lib/football/fixtures.ts: ${slug} は LONDON_CLUBS に無い`);
  }
  return club;
}

const LONDON_CLUB_SLUGS = new Set<string>(LONDON_CLUBS.map((c) => c.slug));

/** ページとクライアントに渡す形。日付の文字列はサーバーで作っておく。 */
export type FixtureView = {
  id: string;
  matchweek: number;
  date: string;
  dateLabel: string;
  /** "2026-11" */
  month: string;
  kickoff: string;
  /** "11/8(日) 0:00" */
  jst: string;
  homeName: string;
  awayName: string;
  stadium: string;
  status: FixtureStatus;
  window: { from: string; to: string };
  /** 動きうる範囲の表記。確定して動かない試合は null。 */
  windowLabel: string | null;
  /** 未確定の試合が確定する見込み。"11月30日の週" */
  confirmsIn: string | null;
  tv: Broadcaster | null;
  difficulty: LondonClub["difficulty"];
  difficultyLabel: string;
  derby: "north-london" | "london" | null;
  note: string | null;
};

export function toView(fixture: Fixture): FixtureView {
  const club = clubOf(fixture.home);
  const window = possibleWindow(fixture);
  const status = fixtureStatus(fixture);
  const announcement = announcementFor(fixture.matchweek);
  const pair = new Set<string>([fixture.home, fixture.away]);
  return {
    id: `${fixture.matchweek}-${fixture.home}`,
    matchweek: fixture.matchweek,
    date: fixture.date,
    dateLabel: formatMatchDay(fixture.date),
    month: fixture.date.slice(0, 7),
    kickoff: fixture.kickoff,
    jst: formatJst(kickoffInstant(fixture)),
    homeName: PL_CLUB_NAMES[fixture.home],
    awayName: PL_CLUB_NAMES[fixture.away],
    stadium: club.stadiumJa,
    status,
    window,
    windowLabel:
      window.from === window.to ? null : formatDayRange(window.from, window.to),
    confirmsIn: announcement ? formatAnnouncement(announcement) : null,
    tv: fixture.tv ?? null,
    difficulty: club.difficulty,
    difficultyLabel: DIFFICULTY_LABELS[club.difficulty],
    derby:
      pair.has("arsenal") && pair.has("tottenham")
        ? "north-london"
        : LONDON_CLUB_SLUGS.has(fixture.away)
          ? "london"
          : null,
    note: fixture.note ?? null,
  };
}

/**
 * まだ終わっていない試合(今日の試合を含む)。今日はロンドンの日付。
 * 試合の終わった日の翌日に、ページの再生成(1日1回)で消える。
 */
export function upcomingFixtures(today: string): FixtureView[] {
  return FIXTURES.filter((f) => possibleWindow(f).to >= today)
    .map(toView)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.kickoff.localeCompare(b.kickoff) ||
        a.homeName.localeCompare(b.homeName, "ja"),
    );
}

/**
 * ロンドンでプレミアリーグのホーム試合が1つも無い週末(土曜の日付)。
 * 未確定の試合が動きうる週末は「試合あり」に数える。
 */
export function weekendsWithoutMatches(fixtures: FixtureView[]): string[] {
  if (fixtures.length === 0) return [];
  const first = fixtures[0].date;
  const last = fixtures[fixtures.length - 1].date;
  let saturday = addDays(first, (6 - weekdayOf(first) + 7) % 7);
  const empty: string[] = [];
  while (saturday <= last) {
    const friday = addDays(saturday, -1);
    const monday = addDays(saturday, 2);
    const hasMatch = fixtures.some(
      (f) => f.window.from <= monday && f.window.to >= friday,
    );
    if (!hasMatch) empty.push(saturday);
    saturday = addDays(saturday, 7);
  }
  return empty;
}

/** "2026-11" → "2026年11月" */
export function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${y}年${m}月`;
}

export const FIXTURES_PATH = "/sightseeing/football/fixtures";

/** 試合を探すページへのリンク。日程を入れた状態で開く。 */
export function fixturesHref(range?: { from: string; to: string }): string {
  return range
    ? `${FIXTURES_PATH}?from=${range.from}&to=${range.to}`
    : FIXTURES_PATH;
}
