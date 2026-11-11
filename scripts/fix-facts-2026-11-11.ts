/**
 * 2026-11-11 の鮮度調査で見つかった、観光スポットと美術館の古い値・誤りを直す。
 *
 *   npx tsx scripts/fix-facts-2026-11-11.ts           # 差分を表示(書かない)
 *   npx tsx scripts/fix-facts-2026-11-11.ts --apply   # DBへ反映
 *
 * 値の直しは from(いまの値)で守る。いまの値が from と違えば、別の作業で
 * 直された可能性があるので触らない。二度流しても同じ結果になる。
 *
 * ------------------------------------------------------------------
 * 観光スポット(Attraction)
 * ------------------------------------------------------------------
 * - ロンドン・ブリッジ・エクスペリエンス: 非公開にする。2025年秋に「整備のため」
 *   閉めたまま、看板が外されて別業態の広告が出ていると報告され、公式ドメイン
 *   (thelondonbridgeexperience.com)は名前解決できない。閉業の公式発表は無いが、
 *   ザ・コールドロン(2026-11-05)と同じ扱いにする。行は消さない(isPublished の説明)。
 *     https://en.wikipedia.org/wiki/The_London_Bridge_Experience
 *     https://www.scaretour.co.uk/london-bridge-experience---review.html
 * - クリスタル・メイズ: 標準券は1人 £47〜(公式)。DB は大人も子どもも £79〜。
 *   子どもの料金は公式に別建てが無いので空にする。歩き方にも「1人あたり£79前後」
 *   と書いていた(事実はファクトバーが持つので、本文からは料金を外す)。
 *   9歳以上、16歳未満は18歳以上の同伴が必要(公式)。
 *     https://the-crystal-maze.com/london/tickets-prices/
 *     https://the-crystal-maze.com/london/plan-your-visit/
 * - ウェンブリー・スタジアムのツアー: 大人 £28・子ども £19(公式の予約ページ)。
 *     https://bookings.wembleytours.com/stadiumtours/booking/wembley-guided-stadium-tours.htm
 * - 郵便博物館: 大人 £20.50(メール・レール1回と1年間の入館込み。公式の券のページ)。
 *   観光側 £17.60・美術館側 £18.50 と、2ページで違う古い値が出ていた。子ども・
 *   若者の料金は確かめられなかったので空にする。座標は両方とも郵便番号
 *   WC1X 0DA(postcodes.io)に揃える。美術館側は約400m ずれていた。
 *   あわせて lib/museum-attraction-pairs.js に対を足し、ページを美術館側に一本化する。
 *     https://www.postalmuseum.org/visit/plan-your-visit/tickets/
 * - チェシントン / レゴランド: どちらも 2026年のメインシーズンが終わり、冬は
 *   クリスマスの催しの指定日だけ開く。開園中のように読めていたので closedNote に書く。
 *     https://www.chessington.com/explore/events/christmas/
 *     https://www.legoland.co.uk/explore/special-events/christmas/
 *     https://www.legoland.co.uk/plan-your-day/before-you-visit/opening-hours/
 * - 王立天文台: 「再開日は未発表」だったが、本初子午線の中庭は2027年夏に再開
 *   (券は2027年1月発売)、改修全体は2028年春に完了と発表されている。
 *     https://www.rmg.co.uk/royal-observatory/transformation
 * - シーライフ水族館: 「10:00〜15:45」は最終入場の時刻とも合わない。2026年11月の
 *   平日は 10:00〜17:00(最終入場16:00)。日によって変わる。
 *     https://www.visitsealife.com/london/plan-your-visit/before-you-visit/opening-hours/
 * - サイエンス・ミュージアム: 「2026年11月11日(水)は終日休館」は当日限りの知らせ。
 *   ロンドンの日付が 11/12 以降になってから流したときだけ消す。
 *
 * ------------------------------------------------------------------
 * 美術館(Museum / MuseumInfo / OpeningHours)。各館の公式サイトで 2026-11-11 に確認
 * ------------------------------------------------------------------
 * - シャーロック・ホームズ博物館: 大人 £19・子ども £14(6歳未満無料)。price が 0 で、
 *   一覧と冒頭に「無料」と出ていた(同じページの情報欄は £20)。
 *     https://www.sherlock-holmes.co.uk/plan-your-visit/
 * - ディケンズ博物館: 大人 £14・子ども £8。 https://dickensmuseum.com/pages/admissions
 * - ロンドン運河博物館: 大人 £8・子ども £4。 https://www.canalmuseum.org.uk/visit/admission.htm
 * - フロイト博物館: 寄付なしの大人 £14.90(寄付込み £16.90)。 https://www.freud.org.uk/
 * - レイトン・ハウス: 子ども(6〜18歳)£6。 https://www.rbkc.gov.uk/museums/plan-your-visit
 * - ガーデン・ミュージアム: 月曜休館、火〜金は16時閉館、土日は17時閉館。
 *     https://www.gardenmuseum.org.uk/visit/
 * - ファウンドリング博物館: 日曜は11時開館。 https://foundlingmuseum.org.uk/visit-us/
 * - 扇の博物館: 閉館は17時(16:30は最終入館)。 https://www.thefanmuseum.org.uk/
 * - ヴァギナ博物館: 開館は11時。 https://www.vaginamuseum.co.uk/visit
 * - ヴィクター・ウィンド博物館: website のドメイン(victorwyndmuseum.uk)が名前解決
 *   できない。公式は The Last Tuesday Society のサイト。英語名の綴りも Viktor が正しい。
 *     https://www.thelasttuesdaysociety.org/
 */

import "dotenv/config";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

type Value = string | number | boolean | null;

type AttractionFix = { slug: string; field: string; from: Value; to: Value; onlyAfter?: string };
type MuseumFix = { slug: string; field: string; from: Value; to: Value };
type InfoFix = { slug: string; field: string; from: Value; to: Value };
type HoursFix = {
  slug: string;
  day: string;
  from: { openTime: string | null; closeTime: string | null };
  to: { openTime: string | null; closeTime: string | null };
};
type VisitFix = { slug: string; id: number; find: string; replace: string };

/** 郵便番号 WC1X 0DA の代表点(postcodes.io)。 */
const POSTAL = { lat: 51.524762, lng: -0.114056 };

const ATTRACTION_FIXES: AttractionFix[] = [
  { slug: "london-bridge-experience-and-tombs", field: "isPublished", from: true, to: false },

  { slug: "the-crystal-maze-live-experience-london", field: "priceAdult", from: "£79〜", to: "£47〜" },
  { slug: "the-crystal-maze-live-experience-london", field: "priceChild", from: "£79〜", to: null },

  { slug: "wembley-stadium-tour", field: "priceAdult", from: "£25〜", to: "£28〜" },
  { slug: "wembley-stadium-tour", field: "priceChild", from: "£18〜", to: "£19〜" },

  { slug: "postal-museum", field: "priceAdult", from: "£17.60（1年間有効）", to: "£20.50（1年間有効）" },
  { slug: "postal-museum", field: "priceChild", from: "£10（3〜15歳）／£12.20（16〜24歳）", to: null },
  { slug: "postal-museum", field: "lat", from: 51.5236, to: POSTAL.lat },
  { slug: "postal-museum", field: "lng", from: -0.1119, to: POSTAL.lng },

  {
    slug: "chessington-world-of-adventures",
    field: "closedNote",
    from: null,
    to: "メインシーズン(3〜10月)の外は、クリスマスの催しの日(2026年は11月21日〜2027年1月3日のうちの指定日)だけ開く。行く日が開いているか公式で確認",
  },
  {
    // 公式の FAQ は「シーズン外は基本的に休園。冬の催しの日だけ開く」。2月の中間休みの
    // 日付も載っているが、営業日なのか催しの告知なのか読み取れなかったので書かない。
    slug: "legoland-windsor",
    field: "closedNote",
    from: null,
    to: "メインシーズン(3月〜11月初め)の外は休園。冬はクリスマスの催しの日(2026年は11月21日〜2027年1月3日のうちの指定日)など、一部の日だけ開く",
  },
  {
    slug: "royal-observatory-greenwich",
    field: "closedNote",
    from: "2026年11月2日から改修のため全館休館(再開日は未発表)",
    to: "2026年11月2日から改修のため休館。本初子午線の中庭は2027年夏に再開の予定(券は2027年1月発売)で、改修全体は2028年春に終わる予定",
  },
  {
    slug: "sea-life-london-aquarium",
    field: "openingHours",
    from: "10:00〜15:45",
    to: "10:00〜17:00(最終入場16:00。日によって変わる)",
  },
  {
    slug: "science-museum",
    field: "closedNote",
    from: "2026年11月11日(水)は終日休館",
    to: null,
    onlyAfter: "2026-11-11",
  },
];

const VISIT_FIXES: VisitFix[] = [
  {
    slug: "the-crystal-maze-live-experience-london",
    id: 4411,
    find: "1人あたり£79前後と安くはなく、9歳以上・大人の同伴が必須。",
    replace: "対象は9歳以上で、16歳未満は18歳以上の同伴が要ります。",
  },
];

const MUSEUM_FIXES: MuseumFix[] = [
  { slug: "sherlock-holmes-museum", field: "price", from: 0, to: 19 },
  { slug: "charles-dickens-museum", field: "price", from: 12.95, to: 14 },
  { slug: "london-canal-museum", field: "price", from: 7.5, to: 8 },
  { slug: "freud-museum", field: "price", from: 14.5, to: 14.9 },
  { slug: "postal-museum", field: "price", from: 18.5, to: 20.5 },
  { slug: "postal-museum", field: "lat", from: 51.5248, to: POSTAL.lat },
  { slug: "postal-museum", field: "lng", from: -0.108, to: POSTAL.lng },
  {
    slug: "victor-wynd-museum",
    field: "website",
    from: "https://www.victorwyndmuseum.uk",
    to: "https://www.thelasttuesdaysociety.org/",
  },
  {
    slug: "victor-wynd-museum",
    field: "engName",
    from: "Victor Wynd Museum of Curiosities",
    to: "Viktor Wynd Museum of Curiosities",
  },
];

const INFO_FIXES: InfoFix[] = [
  { slug: "sherlock-holmes-museum", field: "admissionFeeAdult", from: 20, to: 19 },
  { slug: "sherlock-holmes-museum", field: "admissionFeeChild", from: 15, to: 14 },
  { slug: "charles-dickens-museum", field: "admissionFeeAdult", from: 12.95, to: 14 },
  { slug: "charles-dickens-museum", field: "admissionFeeChild", from: 7.95, to: 8 },
  { slug: "london-canal-museum", field: "admissionFeeAdult", from: 7.5, to: 8 },
  { slug: "london-canal-museum", field: "admissionFeeChild", from: 3.75, to: 4 },
  { slug: "freud-museum", field: "admissionFeeAdult", from: 14.5, to: 14.9 },
  { slug: "leighton-house-museum", field: "admissionFeeChild", from: 0, to: 6 },
  { slug: "postal-museum", field: "admissionFeeAdult", from: 18.5, to: 20.5 },
  { slug: "postal-museum", field: "admissionFeeChild", from: 11, to: null },
  { slug: "postal-museum", field: "admissionFeeStudent", from: 12.5, to: null },
  // 観光側の所要時間(1時間30分〜2時間)に揃える。check-museum-pairs が突き合わせる。
  { slug: "postal-museum", field: "recommendedDuration", from: 180, to: 120 },
];

const open = (openTime: string | null, closeTime: string | null) => ({ openTime, closeTime });

const HOURS_FIXES: HoursFix[] = [
  { slug: "garden-museum", day: "Monday", from: open("10:00", "17:00"), to: open(null, null) },
  ...["Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => ({
    slug: "garden-museum",
    day,
    from: open("10:00", "17:00"),
    to: open("10:00", "16:00"),
  })),
  { slug: "foundling-museum", day: "Sunday", from: open("10:00", "17:00"), to: open("11:00", "17:00") },
  ...["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => ({
    slug: "fan-museum",
    day,
    from: open("11:00", "16:30"),
    to: open("11:00", "17:00"),
  })),
  ...["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => ({
    slug: "vagina-museum",
    day,
    from: open("10:00", "18:00"),
    to: open("11:00", "18:00"),
  })),
];

/** ロンドンの今日("YYYY-MM-DD")。 */
function londonToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
}

/** 置換後の本文に生の ** が残らないか(CLAUDE.md の太字の規則)。 */
function assertNoRawBold(text: string, label: string) {
  const html = renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, text),
  );
  if (html.includes("**")) throw new Error(`${label}: 生の ** が残る`);
}

let changed = 0;

function same(a: Value | undefined, b: Value): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-9;
  return (a ?? null) === b;
}

async function fixAttractions() {
  const today = londonToday();
  for (const fix of ATTRACTION_FIXES) {
    if (fix.onlyAfter && !(today > fix.onlyAfter)) {
      console.log(`[待ち] ${fix.slug}.${fix.field} — ロンドンの日付が ${fix.onlyAfter} を過ぎてから流す(いまは ${today})`);
      continue;
    }
    const row = await db.attraction.findUnique({ where: { slug: fix.slug } });
    if (!row) throw new Error(`スポット ${fix.slug} が見つからない`);
    const current = (row as Record<string, unknown>)[fix.field] as Value | undefined;
    if (same(current, fix.to)) {
      console.log(`[済] ${fix.slug}.${fix.field}`);
      continue;
    }
    if (!same(current, fix.from)) {
      console.warn(`[飛ばす] ${fix.slug}.${fix.field} — いまの値が想定と違う: ${JSON.stringify(current)}`);
      continue;
    }
    console.log(`[${fix.slug}] ${fix.field}: ${JSON.stringify(current)} → ${JSON.stringify(fix.to)}`);
    changed++;
    if (apply) await db.attraction.update({ where: { slug: fix.slug }, data: { [fix.field]: fix.to } });
  }

  for (const fix of VISIT_FIXES) {
    const spot = await db.attraction.findUnique({ where: { slug: fix.slug }, select: { id: true } });
    const step = await db.attractionVisitStep.findUnique({ where: { id: fix.id } });
    if (!spot || !step || step.attractionId !== spot.id) {
      console.warn(`[飛ばす] ${fix.slug} visit#${fix.id} — スポットか行が想定と違う`);
      continue;
    }
    if (step.body.includes(fix.replace)) {
      console.log(`[済] ${fix.slug} visit#${fix.id}`);
      continue;
    }
    if (!step.body.includes(fix.find)) {
      console.warn(`[飛ばす] ${fix.slug} visit#${fix.id} — 置換前の文が見つからない`);
      continue;
    }
    const body = step.body.replace(fix.find, fix.replace);
    assertNoRawBold(body, `${fix.slug} visit#${fix.id}`);
    console.log(`[${fix.slug}] visit#${fix.id}: 「${fix.find}」→「${fix.replace}」`);
    changed++;
    if (apply) await db.attractionVisitStep.update({ where: { id: fix.id }, data: { body } });
  }
}

async function fixMuseums() {
  for (const fix of MUSEUM_FIXES) {
    const row = await db.museum.findUnique({ where: { slug: fix.slug } });
    if (!row) throw new Error(`美術館 ${fix.slug} が見つからない`);
    const current = (row as Record<string, unknown>)[fix.field] as Value | undefined;
    if (same(current, fix.to)) {
      console.log(`[済] museum ${fix.slug}.${fix.field}`);
      continue;
    }
    if (!same(current, fix.from)) {
      console.warn(`[飛ばす] museum ${fix.slug}.${fix.field} — いまの値が想定と違う: ${JSON.stringify(current)}`);
      continue;
    }
    console.log(`[museum ${fix.slug}] ${fix.field}: ${JSON.stringify(current)} → ${JSON.stringify(fix.to)}`);
    changed++;
    if (apply) await db.museum.update({ where: { slug: fix.slug }, data: { [fix.field]: fix.to } });
  }

  for (const fix of INFO_FIXES) {
    const museum = await db.museum.findUnique({ where: { slug: fix.slug }, select: { museumInfo: true } });
    const info = museum?.museumInfo;
    if (!info) throw new Error(`美術館 ${fix.slug} の MuseumInfo が無い`);
    const current = (info as Record<string, unknown>)[fix.field] as Value | undefined;
    if (same(current, fix.to)) {
      console.log(`[済] info ${fix.slug}.${fix.field}`);
      continue;
    }
    if (!same(current, fix.from)) {
      console.warn(`[飛ばす] info ${fix.slug}.${fix.field} — いまの値が想定と違う: ${JSON.stringify(current)}`);
      continue;
    }
    console.log(`[info ${fix.slug}] ${fix.field}: ${JSON.stringify(current)} → ${JSON.stringify(fix.to)}`);
    changed++;
    if (apply) await db.museumInfo.update({ where: { id: info.id }, data: { [fix.field]: fix.to } });
  }

  for (const fix of HOURS_FIXES) {
    const museum = await db.museum.findUnique({ where: { slug: fix.slug }, select: { id: true } });
    if (!museum) throw new Error(`美術館 ${fix.slug} が見つからない`);
    const row = await db.openingHours.findUnique({
      where: { museumId_dayOfWeek: { museumId: museum.id, dayOfWeek: fix.day } },
    });
    if (!row) {
      console.warn(`[飛ばす] hours ${fix.slug} ${fix.day} — 行が無い`);
      continue;
    }
    if (row.openTime === fix.to.openTime && row.closeTime === fix.to.closeTime) {
      console.log(`[済] hours ${fix.slug} ${fix.day}`);
      continue;
    }
    if (row.openTime !== fix.from.openTime || row.closeTime !== fix.from.closeTime) {
      console.warn(`[飛ばす] hours ${fix.slug} ${fix.day} — いまの値が想定と違う: ${row.openTime}-${row.closeTime}`);
      continue;
    }
    console.log(
      `[hours ${fix.slug}] ${fix.day}: ${row.openTime ?? "休"}-${row.closeTime ?? ""} → ${fix.to.openTime ?? "休"}-${fix.to.closeTime ?? ""}`,
    );
    changed++;
    if (apply) await db.openingHours.update({ where: { id: row.id }, data: fix.to });
  }
}

async function main() {
  await fixAttractions();
  await fixMuseums();
  console.log(`\n${changed} 件${apply ? "を反映した" : "の差分(--apply で反映)"}。`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
