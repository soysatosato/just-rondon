"use server";

import db from "../db";

/**
 * 「◯月のロンドン」(/events/<月>)が DB から読むもの。
 *
 * 年の決め方は lib/london-months/year.ts。ここは年と月を受け取って
 * 引くだけにする。
 */

/**
 * その年月に開催されるイベント(Event テーブル)。
 *
 * その年の分がまだ登録されていない月は、前の年の同じ月を fallback で返す。
 * 定番の行事は毎年ほぼ同じ時期に開かれるので、去年の日程でも時期を
 * 決める役には立つ。ページ側で「去年の日程」と必ず明示すること。
 *
 * 「登録済みか」は、その月に始まるイベントが1件でもあるかで見る。
 * 期間が重なるかで見ると、前の月から続くもの(12月に始まって1月3日に
 * 終わるウィンター・ワンダーランドなど)だけで「1月は登録済み」と
 * 判定され、1月に始まる行事が1件も出なくなる。前の月から続くものは
 * 本当の日付なので、fallback とは分けて events に残す。
 */
export const fetchMonthEvents = async (year: number, month: number) => {
  const inMonth = (y: number) =>
    db.event.findMany({
      where: {
        startDate: { lt: new Date(Date.UTC(y, month, 1)) },
        endDate: { gte: new Date(Date.UTC(y, month - 1, 1)) },
      },
      orderBy: [{ startDate: "asc" }, { displayOrder: "asc" }],
    });

  const events = await inMonth(year);
  const monthStart = Date.UTC(year, month - 1, 1);
  if (events.some((e) => e.startDate.getTime() >= monthStart)) {
    return { events, fallback: null };
  }

  const previous = await inMonth(year - 1);
  return {
    events,
    fallback: previous.length > 0 ? { year: year - 1, events: previous } : null,
  };
};

/** 週次ダイジェストの項目のうち、月別ページに載せる種類(「耳寄り」の側)。 */
const PICK_KINDS = ["event", "exhibition", "opening", "deal"];

/** 表記ゆれ(全角括弧・空白)を落として、同じ会場を同じ文字列にする。 */
function normaliseVenue(venue: string | null): string {
  return (venue ?? "").replace(/[\s()()]/g, "").toLowerCase();
}

/**
 * 「今週のロンドン」で取り上げた催し・展覧会のうち、その年月にかかるもの。
 *
 * - 終わったものは出さない(today より前に閉じたもの)。今月のページを
 *   月の途中で開いた人に、もう見られない展示を並べても役に立たない。
 * - timing が announced の項目(「来月チケット発売」のような予告)は除く。
 *   日付が催しそのものの会期ではないことがある。
 * - 同じ展覧会は「開幕」「見納め」と号をまたいで何度も載るので、
 *   会場と会期で1件にまとめ、いちばん新しい号の書き方を使う。
 */
export const fetchWeeklyPicksForMonth = async (
  year: number,
  month: number,
  today: string,
) => {
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 1));
  const todayStart = new Date(`${today}T00:00:00Z`);

  const items = await db.weeklyBriefItem.findMany({
    where: {
      kind: { in: PICK_KINDS },
      timing: "thisWeek",
      brief: { published: true },
      startDate: { lt: monthEnd },
      endDate: { gte: monthStart > todayStart ? monthStart : todayStart },
    },
    select: {
      id: true,
      kind: true,
      title: true,
      startDate: true,
      endDate: true,
      venue: true,
      isFree: true,
      brief: { select: { slug: true, weekStart: true } },
    },
    orderBy: { brief: { weekStart: "desc" } },
  });

  const seen = new Set<string>();
  const unique = items.filter((item) => {
    const key = `${normaliseVenue(item.venue)}|${item.startDate?.getTime()}|${item.endDate?.getTime()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const byStart = (a: (typeof unique)[number], b: (typeof unique)[number]) =>
    (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0);
  const byEnd = (a: (typeof unique)[number], b: (typeof unique)[number]) =>
    (a.endDate?.getTime() ?? 0) - (b.endDate?.getTime() ?? 0);

  return {
    // 展覧会は「いつまで見られるか」が決め手なので、会期末の近い順。
    exhibitions: unique.filter((i) => i.kind === "exhibition").sort(byEnd),
    // 催しは日付そのものが予定なので、始まる順。
    events: unique.filter((i) => i.kind !== "exhibition").sort(byStart),
  };
};

/**
 * その月に始まる週の号(年は問わない)。
 *
 * 号は年に50本ほどしか増えないので、全件を引いて月で振り分ける。
 * 去年の同じ月の号は、催しの中身は古くても「例年この時期に何があるか」を
 * 知る手がかりになるので、年をまたいで並べる。
 */
export const fetchBriefsForMonth = async (month: number) => {
  const briefs = await db.weeklyBrief.findMany({
    where: { published: true },
    orderBy: { weekStart: "desc" },
    select: { slug: true, title: true, weekStart: true, weekEnd: true },
  });
  return briefs.filter((b) => b.weekStart.getUTCMonth() + 1 === month);
};

/**
 * 本文をまだ書いていない月の導入文。月別の行(london-events-<年>)の
 * うち最も新しい年の mainText を借りる。どの年の行も、導入は季節の
 * 話だけで年に依存しない書き方になっている。
 */
export const fetchMonthIntroFallback = async (monthName: string) => {
  const rows = await db.content.findMany({
    where: {
      category: { startsWith: "london-events-" },
      slug: { endsWith: `-${monthName}` },
    },
    select: { category: true, mainText: true },
  });
  const latest = rows.sort((a, b) => b.category.localeCompare(a.category))[0];
  return latest?.mainText ?? null;
};
