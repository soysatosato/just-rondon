/**
 * 曜日で探すページ(/sightseeing/open/<曜日>)。
 *
 * 休みの曜日は観光スポットの closedWeekdays が持つ(0=月 〜 6=日)。旅行プランの
 * 休館の警告と、スポットのページの「休館日」の欄も同じ列を読むので、
 * このページだけが食い違うことは無い。載せるのは closedDaysCheckedAt の
 * ある行(公式で確かめた行)だけ。未調査の行を「開いている」と出すと、
 * 何も出さないより悪い(prisma/schema.prisma の closedWeekdays の注記)。
 *
 * 作るのは日曜と月曜の2本だけ(2026-11 にユーザーと決めた方針)。火〜土は
 * 休む所が3〜14か所しかなく、1ページにすると中身が薄くなる。日曜は寺院と
 * 大聖堂の見学・市場・店の営業時間が変わり、月曜は休む美術館や宮殿が最も多い。
 *
 * 曜日ならではの注意(notes)は本文としてここに書く。出典の無いことは書かない。
 */

export type OpenDaySlug = "sunday" | "monday";

export type OpenDayNote = {
  title: string;
  body: string;
  link?: { href: string; label: string };
};

export type OpenDayPage = {
  slug: OpenDaySlug;
  /** 0=月 〜 6=日。closedWeekdays と同じ並び。 */
  weekday: number;
  /** "日曜" */
  short: string;
  /** パンくずに使う呼び名。"日曜日のロンドン" */
  name: string;
  h1: string;
  title: string;
  notes: OpenDayNote[];
  sources: { label: string; url: string }[];
};

export const OPEN_DAY_PAGES: Record<OpenDaySlug, OpenDayPage> = {
  sunday: {
    slug: "sunday",
    weekday: 6,
    short: "日曜",
    name: "日曜日のロンドン",
    h1: "日曜日のロンドン観光",
    title: "日曜日のロンドン観光｜休みの所・日曜だけの所・店の営業時間",
    notes: [
      {
        title: "大きな店は6時間しか開かない",
        body: "イングランドとウェールズでは、床面積が280㎡を超える店は、日曜は10時から18時までのあいだの連続6時間しか開けられません(日曜営業法)。百貨店はこの枠で開け、たとえばリバティは12時〜18時(11時半から見て回るだけはできる)です。小さな店はこの決まりの外です。イースターの日曜とクリスマスは、大きな店は開けません。",
      },
      {
        title: "寺院と大聖堂は礼拝だけ",
        body: "ウェストミンスター寺院とセント・ポール大聖堂は、日曜は礼拝のための時間で、観光の見学はできません。中を見たいなら月曜から土曜に行きます。",
      },
      {
        title: "衛兵交代式は日曜には無い",
        body: "バッキンガム宮殿の11時の衛兵交代は月・水・金です。日曜は10時のパレードがある日があります。行く週の予定は公式の予定表で確かめられます。",
        link: {
          href: "/sightseeing/changing-the-guard-buckingham-palace",
          label: "衛兵交代式(今日から7日間の予定)",
        },
      },
      {
        title: "市場は日曜で顔ぶれが変わる",
        body: "コロンビア・ロードの花市場は日曜の朝だけ立ちます。ポートベロー・ロードは日曜は露店が出ません。",
        link: { href: "/shopping/markets", label: "マーケットの曜日表" },
      },
    ],
    sources: [
      {
        label: "Sunday Trading Act 1994, Schedule 1(大型店の日曜営業)",
        url: "https://www.legislation.gov.uk/ukpga/1994/20/schedule/1",
      },
      {
        label: "Christmas Day (Trading) Act 2004, section 1",
        url: "https://www.legislation.gov.uk/ukpga/2004/26/section/1",
      },
    ],
  },
  monday: {
    slug: "monday",
    weekday: 0,
    short: "月曜",
    name: "月曜日のロンドン",
    h1: "月曜日に休むロンドンの観光地",
    title: "月曜日に休むロンドンの観光地｜美術館・宮殿の休館日と開いている所",
    notes: [
      {
        title: "月曜と火曜を続けて休む所がある",
        body: "サー・ジョン・ソーン美術館やケンジントン宮殿のように、月曜と火曜を続けて休む所があります。月曜に行けなかった分を火曜に回す前に、上の一覧の「休み」で火曜も確かめてください。",
      },
      {
        title: "衛兵交代式は月曜にある",
        body: "バッキンガム宮殿の11時の衛兵交代は月・水・金です。悪天候や式典で中止になる日もあるので、行く週の予定は公式の予定表で確かめられます。",
        link: {
          href: "/sightseeing/changing-the-guard-buckingham-palace",
          label: "衛兵交代式(今日から7日間の予定)",
        },
      },
      {
        title: "祝日の月曜は扱いが分かれる",
        body: "バンク・ホリデー(祝日)の月曜は、ふだん月曜に休む館が開くことも、逆に休むこともあります。一覧の注記に書いてある館は、それに従ってください。",
      },
      {
        title: "バラ・マーケットは月曜が休み",
        body: "食べ歩きの市場、バラ・マーケットは月曜に休み、火曜から日曜まで開いています。",
        link: { href: "/shopping/markets", label: "マーケットの曜日表" },
      },
    ],
    sources: [],
  },
};

export const OPEN_DAY_SLUGS = Object.keys(OPEN_DAY_PAGES) as OpenDaySlug[];

export function openDayPath(slug: OpenDaySlug): string {
  return `/sightseeing/open/${slug}`;
}

/** 0=月 〜 6=日。lib/plan/dates.ts の WEEKDAY_LABELS と同じ並び。 */
const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

export function weekdaysLabel(days: number[]): string {
  return [...days].sort((a, b) => a - b).map((d) => WEEKDAY_LABELS[d]).join("・");
}

/**
 * スポットのページの「休館日」から張るリンク。休む曜日のうち、一覧のページが
 * ある曜日(日曜・月曜)の分だけ。
 */
export function openDayLinksFor(
  closedWeekdays: number[],
): { href: string; label: string }[] {
  return Object.values(OPEN_DAY_PAGES)
    .filter((page) => closedWeekdays.includes(page.weekday))
    .sort((a, b) => a.weekday - b.weekday)
    .map((page) => ({
      href: openDayPath(page.slug),
      label: `${page.short}に休む所の一覧`,
    }));
}

export type OpenDaySpot = {
  slug: string;
  name: string;
  category: string;
  closedWeekdays: number[];
  closedNote: string | null;
  openingHours: string | null;
  mustSee: boolean;
  recommendLevel: number | null;
  views: number;
};

/** 「定番」に数える条件。おすすめ度か必見の印で選ぶ。 */
const STAPLE_LEVEL = 4;
/** 「開いている定番」に出す数。全部並べると一覧ページと変わらない。 */
const STAPLE_COUNT = 12;
/** これ以上の曜日を休む所は「その曜日だけ開く所」に数える。 */
const MOSTLY_CLOSED_DAYS = 4;

/**
 * 確かめた行(呼び出し側で closedDaysCheckedAt のある行だけを渡す)を、
 * その曜日について3つに分ける。並びは閲覧数の多い順。
 */
export function splitByWeekday(spots: OpenDaySpot[], weekday: number) {
  const byViews = [...spots].sort((a, b) => b.views - a.views);
  const closed = byViews.filter((s) => s.closedWeekdays.includes(weekday));
  const openSpots = byViews.filter((s) => !s.closedWeekdays.includes(weekday));
  const onlyThisDay = openSpots.filter(
    (s) => s.closedWeekdays.length >= MOSTLY_CLOSED_DAYS,
  );
  const staples = openSpots
    .filter(
      (s) =>
        s.closedWeekdays.length < MOSTLY_CLOSED_DAYS &&
        s.category !== "seasonal" &&
        (s.mustSee || (s.recommendLevel ?? 0) >= STAPLE_LEVEL),
    )
    .slice(0, STAPLE_COUNT);
  return { closed, onlyThisDay, staples, openCount: openSpots.length };
}
