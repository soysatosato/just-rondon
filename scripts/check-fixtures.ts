/**
 * ロンドンの試合日程(lib/football/fixtures.ts)の点検。読むだけで、何も書かない。
 *
 *   npx tsx scripts/check-fixtures.ts
 *
 * 日程は公式の発表記事から手で写しているので、写し間違いと、発表の
 * 反映忘れを見る。放映カードの発表を反映したときと、月に1回流す。
 *
 * - 日付・時刻の形、ホームがロンドンのクラブか、相手がホームと違うか
 * - 節の並びと日付の並びが食い違っていないか、同じ節に同じクラブが2回無いか
 * - 第10節から最終節まで抜けている節が無いか
 * - 中継局が付いているのは確定した節だけか
 * - 未確定の節の時刻が日程表の決まり(週末15:00・平日20:00)どおりか
 * - 最終節が全試合16:00か
 * - 公式の発表予定日を1週間過ぎても、確定の範囲を上げていないか
 *
 * 問題があれば一覧を出して終了コード1で終わる。
 */

import { LONDON_CLUBS } from "../lib/football/clubs";
import {
  CONFIRMED_THROUGH,
  FINAL_MATCHWEEK,
  FIXTURES,
  FIXTURES_CHECKED_ON,
  PL_CLUB_NAMES,
  fixtureStatus,
  formatAnnouncement,
  nextAnnouncement,
  possibleWindow,
} from "../lib/football/fixtures";
import { londonDate } from "../lib/publish-schedule";

const FIRST_MATCHWEEK = 10;

function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function main() {
  const problems: string[] = [];
  const london = new Set<string>(LONDON_CLUBS.map((c) => c.slug));

  for (const f of FIXTURES) {
    const where = `第${f.matchweek}節 ${f.home} v ${f.away}`;
    if (!isRealDate(f.date)) problems.push(`${where}: 日付 ${f.date} が正しくない`);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.kickoff)) {
      problems.push(`${where}: 時刻 ${f.kickoff} が "HH:MM" でない`);
    }
    if (!london.has(f.home)) problems.push(`${where}: ホームがロンドンのクラブでない`);
    if (!(f.away in PL_CLUB_NAMES)) problems.push(`${where}: 相手 ${f.away} の呼び名が無い`);
    if (f.home === f.away) problems.push(`${where}: ホームと相手が同じ`);
    if (f.mayMoveTo && !isRealDate(f.mayMoveTo)) {
      problems.push(`${where}: 移り先の日付 ${f.mayMoveTo} が正しくない`);
    }

    const status = fixtureStatus(f);
    if (status === "provisional") {
      if (f.tv) problems.push(`${where}: 未確定の節に中継局が付いている`);
      const dow = new Date(`${f.date}T12:00:00Z`).getUTCDay();
      const expected = dow >= 2 && dow <= 4 ? "20:00" : "15:00";
      if (f.kickoff !== expected) {
        problems.push(
          `${where}: 未確定の節は日程表の決まりで ${expected} のはずが ${f.kickoff}`,
        );
      }
    }
    if (f.matchweek === FINAL_MATCHWEEK && f.kickoff !== "16:00") {
      problems.push(`${where}: 最終節は全試合16:00のはず`);
    }
  }

  // 節ごとの点検。
  const byMatchweek = new Map<number, typeof FIXTURES[number][]>();
  for (const f of FIXTURES) {
    byMatchweek.set(f.matchweek, [...(byMatchweek.get(f.matchweek) ?? []), f]);
  }
  for (let mw = FIRST_MATCHWEEK; mw <= FINAL_MATCHWEEK; mw++) {
    const rows = byMatchweek.get(mw) ?? [];
    if (rows.length === 0) problems.push(`第${mw}節: ロンドンのホーム試合が1つも無い`);
    const homes = rows.map((r) => r.home);
    if (new Set(homes).size !== homes.length) {
      problems.push(`第${mw}節: 同じクラブのホーム試合が2つある`);
    }
    const dates = rows.map((r) => r.date).sort();
    if (dates.length > 0) {
      const span =
        (Date.parse(dates[dates.length - 1]) - Date.parse(dates[0])) / 86_400_000;
      if (span > 4) problems.push(`第${mw}節: 試合の日付が${span}日に散らばっている`);
    }
  }
  const sortedMatchweeks = [...byMatchweek.keys()].sort((a, b) => a - b);
  for (let i = 1; i < sortedMatchweeks.length; i++) {
    const prev = byMatchweek.get(sortedMatchweeks[i - 1])!;
    const next = byMatchweek.get(sortedMatchweeks[i])!;
    const prevLast = prev.map((f) => possibleWindow(f).to).sort().pop()!;
    const nextFirst = next.map((f) => f.date).sort()[0];
    if (nextFirst < prevLast) {
      problems.push(
        `第${sortedMatchweeks[i]}節の日付が、前の節より前にある(${nextFirst})`,
      );
    }
  }

  // 発表の反映忘れ。
  const today = londonDate(new Date());
  const next = nextAnnouncement(today);
  if (next?.overdue) {
    problems.push(
      `公式は${formatAnnouncement(next)}に第${next.from}〜${next.to}節を発表する予定だった。` +
        `発表記事で日時を直し、CONFIRMED_THROUGH を上げる`,
    );
  }

  const confirmed = FIXTURES.filter((f) => fixtureStatus(f) === "confirmed").length;
  console.log(
    `${FIXTURES.length}試合(確定${confirmed}・未確定${FIXTURES.length - confirmed})、` +
      `第${CONFIRMED_THROUGH.matchweek}節まで確定(${CONFIRMED_THROUGH.announcedOn}発表)、` +
      `最終確認 ${FIXTURES_CHECKED_ON}`,
  );
  if (next) {
    console.log(`次の発表: ${formatAnnouncement(next)}(第${next.from}〜${next.to}節)`);
  }

  if (problems.length > 0) {
    console.log(`\n問題 ${problems.length}件`);
    for (const p of problems) console.log(`- ${p}`);
    process.exitCode = 1;
  } else {
    console.log("問題なし");
  }
}

main();
