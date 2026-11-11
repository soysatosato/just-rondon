/**
 * 2026-11-11 の鮮度調査で見つかった、ミュージカルの古い値と誤りを直す。
 *
 *   npx tsx scripts/fix-musicals-2026-11.ts           # 差分を表示(書かない)
 *   npx tsx scripts/fix-musicals-2026-11.ts --apply   # DBへ反映
 *
 * 値の直しは from(いまの値)で守る。二度流しても同じ結果になる。
 * 終演日はDBではなく lib/musicals/runs.ts が持つ(出典つき)。
 *
 * ------------------------------------------------------------------
 * 直すもの
 * ------------------------------------------------------------------
 * - 呪いの子: 2026-10-09 から一部制。上演時間は休憩込みで2時間55分(175分)。
 *   DB は二部制の210分のままだった。休憩の長さは一部制では書かれていないので
 *   null(未確認)。見どころの「二部制で観られるのは2026年9月20日まで」は
 *   期限が過ぎたので、一部制に変わった事実の書き方に差し替える。
 *   原稿の scripts/story-content/family.ts も同じ文に直してある。
 *     https://nimaxtheatres.com/shows/harry-potter-and-the-cursed-child/
 *     https://www.londontheatredirect.com/news/harry-potter-and-the-cursed-child-to-become-a-one-part-show-in-the-west-end
 * - マジック・マイク・ライブ: 劇場がチャリング・クロス劇場(ヴィリアーズ通りの
 *   高架下、265席)になっていた。実際はレスター・スクエアのヒッポドローム・カジノの
 *   中の劇場で、2018年11月からここで上演している。劇場を新しく作って付け替える。
 *   客席数は公式で確かめられなかったので null。
 *     https://magicmikelive.com/london/plan-your-visit/
 *     https://www.broadwayworld.com/article/MAGIC-MIKE-LIVE-to-Extend-London-Run-Through-Early-2028-20260923
 *     https://en.wikipedia.org/wiki/Hippodrome,_London
 * - 「予約する」ボタンの飛び先(Musical.website):
 *     Operation Mincemeat → The Times の記事だった。公式は operationmincemeat.com
 *     Come Alive! → people.com の2024年の記事だった。公式は comealiveshow.com
 *     Magic Mike Live → 旧ドメインは magicmikelive.com/london/ へ転送されている
 *   ほかに先頭に空白が入っていたURLが4件(構造化データの販売先にもそのまま入る)。
 * - lastVerifiedAt: 2026-11-11 に上演状況を公式・劇場ニュースで確かめた作品に打つ。
 */

import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");
const NOW = new Date();

type Value = string | number | boolean | null;
type FieldFix = { slug: string; field: string; from: Value; to: Value };

const HIPPODROME = {
  slug: "hippodrome-casino",
  name: "The Theatre at the Hippodrome Casino",
  nameJa: "ヒッポドローム・カジノ劇場",
  address: "Cranbourn St, Leicester Square, London WC2H 7JH, UK",
  // 郵便番号 WC2H 7JH の代表点(postcodes.io)。
  lat: 51.511467,
  lng: -0.129017,
  nearestStation: "Leicester Square (Northern, Piccadilly) 徒歩1分",
  capacity: null,
  operator: "独立系",
  intro:
    "レスター・スクエアの角に立つ、ヒッポドロームの建物の中にある劇場です。建物は1900年にフランク・マッチャムの設計で開いた娯楽劇場で、いまはカジノとして使われています。2018年11月から、マジック・マイク・ライブのロンドン公演がここで続いています。",
};

const FIELD_FIXES: FieldFix[] = [
  // 呪いの子
  { slug: "harry-potter-cursed-child", field: "runtimeMinutes", from: 210, to: 175 },
  { slug: "harry-potter-cursed-child", field: "intervalMinutes", from: 20, to: null },
  {
    slug: "harry-potter-cursed-child",
    field: "englishNote",
    from: "歌のない戯曲で、筋は台詞だけで進みます。原作シリーズを読んでいることが実質的な前提で、登場人物の関係や過去の出来事の説明は最小限です。上演時間も長く、英語で筋を追う負担はウエストエンドの人気作の中では大きい部類です。",
    to: "歌のない戯曲で、筋は台詞だけで進みます。原作シリーズを読んでいることが実質的な前提で、登場人物の関係や過去の出来事の説明は最小限です。上演時間は休憩込みで3時間近くあり、英語で筋を追う負担はウエストエンドの人気作の中では大きい部類です。",
  },

  // マジック・マイク・ライブ(theatreId は下で付け替える)
  { slug: "magic-mike-live", field: "theatreName", from: "Charing Cross Theatre", to: HIPPODROME.name },
  { slug: "magic-mike-live", field: "address", from: "Villiers St, London WC2N 6NG, UK", to: HIPPODROME.address },
  { slug: "magic-mike-live", field: "lat", from: 51.508, to: HIPPODROME.lat },
  { slug: "magic-mike-live", field: "lng", from: -0.124, to: HIPPODROME.lng },
  { slug: "magic-mike-live", field: "website", from: " https://magicmikelondon.co.uk/", to: "https://magicmikelive.com/london/" },

  // 予約ボタンの飛び先
  {
    slug: "operation-mincemeat",
    field: "website",
    from: " https://www.thetimes.co.uk/article/operation-mincemeat-the-sleeper-west-end-hit-carried-by-its-fans-rtt7rrzzm",
    to: "https://www.operationmincemeat.com/",
  },
  {
    slug: "come-alive",
    field: "website",
    from: "https://people.com/greatest-showman-inspired-stage-show-to-open-london-september-2024-8678514",
    to: "https://www.comealiveshow.com/",
  },
  { slug: "the-book-of-mormon", field: "website", from: " https://www.bookofmormonlondon.com/", to: "https://www.bookofmormonlondon.com/" },
  {
    slug: "the-play-that-goes-wrong",
    field: "website",
    from: " https://www.mischiefcomedy.com/whats-on/the-play-that-goes-wrong/london/",
    to: "https://www.mischiefcomedy.com/whats-on/the-play-that-goes-wrong/london/",
  },
  { slug: "witness-for-the-prosecution", field: "website", from: " https://witnesscountyhall.com/", to: "https://witnesscountyhall.com/" },
  { slug: "mj-the-musical", field: "website", from: " https://london.mjthemusical.com/", to: "https://london.mjthemusical.com/" },
];

/** 呪いの子の見どころ(appeals)のうち、期限の過ぎた1件を差し替える。 */
const CURSED_CHILD_APPEAL = {
  fromTitle: "二部制で観られるのは2026年9月20日まで",
  to: {
    kind: "trivia",
    title: "2026年10月から一部制の新演出に",
    body: "2016年の初演から続いてきた「二部制」——物語を2回に分けて上演し、通しで観るには半日を使う形式——は、2026年9月20日の公演で終わりました。10月9日からは物語全体を1回の上演で見せる新演出に変わり、上演時間は休憩込みで2時間55分です。古い感想や旅行記にある「2日がかり」「5時間」は、二部制のころの話です。",
  },
};

/** 2026-11-11 に上演状況を確かめた作品(出典は lib/musicals/runs.ts と調査メモ)。 */
const VERIFIED_SLUGS = [
  "rent",
  "paddington-the-musical",
  "beetlejuice",
  "avenue-q",
  "into-the-woods",
  "one-day-the-musical",
  "the-hunger-games-on-stage",
  "jesus-christ-superstar",
  "sinatra-the-musical",
  "high-school-musical",
  "stranger-things",
  "hadestown",
  "my-neighbour-totoro",
  "the-devil-wears-prada",
  "titanique",
  "operation-mincemeat",
  "oliver",
  "magic-mike-live",
  "come-alive",
  "witness-for-the-prosecution",
  "harry-potter-cursed-child",
  "les-miserables",
  "phantom-of-the-opera",
  "hamilton",
];

let changed = 0;

function same(a: Value | undefined, b: Value): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-9;
  return (a ?? null) === b;
}

async function upsertHippodrome(): Promise<string | null> {
  const existing = await db.theatre.findUnique({ where: { slug: HIPPODROME.slug } });
  if (existing) {
    console.log(`[済] theatre ${HIPPODROME.slug}`);
    return existing.id;
  }
  console.log(`[theatre] ${HIPPODROME.slug} を作る: ${HIPPODROME.name} / ${HIPPODROME.address}`);
  changed++;
  if (!apply) return null;
  const created = await db.theatre.create({ data: { ...HIPPODROME, lastVerifiedAt: NOW } });
  return created.id;
}

async function main() {
  const hippodromeId = await upsertHippodrome();

  for (const fix of FIELD_FIXES) {
    const row = await db.musical.findUnique({ where: { slug: fix.slug } });
    if (!row) throw new Error(`作品 ${fix.slug} が見つからない`);
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
    if (apply) await db.musical.update({ where: { slug: fix.slug }, data: { [fix.field]: fix.to } });
  }

  // マジック・マイク・ライブの劇場を付け替える。
  const charingCross = await db.theatre.findUnique({ where: { slug: "charing-cross" }, select: { id: true } });
  const mml = await db.musical.findUnique({ where: { slug: "magic-mike-live" }, select: { theatreId: true } });
  if (mml && hippodromeId && mml.theatreId === hippodromeId) {
    console.log("[済] magic-mike-live.theatreId");
  } else if (mml && charingCross && mml.theatreId === charingCross.id) {
    console.log("[magic-mike-live] theatreId: charing-cross → hippodrome-casino");
    changed++;
    if (apply && hippodromeId) {
      await db.musical.update({ where: { slug: "magic-mike-live" }, data: { theatreId: hippodromeId } });
    }
  } else {
    console.warn("[飛ばす] magic-mike-live.theatreId — いまの劇場が想定と違う");
  }

  // 呪いの子の見どころ。
  const cc = await db.musical.findUnique({ where: { slug: "harry-potter-cursed-child" }, select: { appeals: true } });
  const appeals = (cc?.appeals ?? []) as { kind: string; title: string; body: string }[];
  const index = appeals.findIndex((a) => a.title === CURSED_CHILD_APPEAL.fromTitle);
  if (appeals.some((a) => a.title === CURSED_CHILD_APPEAL.to.title)) {
    console.log("[済] harry-potter-cursed-child.appeals");
  } else if (index === -1) {
    console.warn("[飛ばす] harry-potter-cursed-child.appeals — 差し替える見どころが見つからない");
  } else {
    console.log(`[harry-potter-cursed-child] appeals[${index}]: 「${CURSED_CHILD_APPEAL.fromTitle}」→「${CURSED_CHILD_APPEAL.to.title}」`);
    changed++;
    if (apply) {
      const next = [...appeals];
      next[index] = CURSED_CHILD_APPEAL.to;
      await db.musical.update({
        where: { slug: "harry-potter-cursed-child" },
        data: { appeals: next as unknown as Prisma.InputJsonValue, factsVerifiedAt: NOW },
      });
    }
  }

  // 上演状況を確かめた日。
  const found = await db.musical.findMany({ where: { slug: { in: VERIFIED_SLUGS } }, select: { slug: true } });
  const missing = VERIFIED_SLUGS.filter((s) => !found.some((f) => f.slug === s));
  if (missing.length > 0) throw new Error(`該当しない slug: ${missing.join(", ")}`);
  console.log(`[lastVerifiedAt] ${found.length}作品に ${NOW.toISOString().slice(0, 10)} を打つ`);
  if (apply) {
    await db.musical.updateMany({ where: { slug: { in: VERIFIED_SLUGS } }, data: { lastVerifiedAt: NOW } });
  }

  console.log(`\n${changed} 件${apply ? "を反映した" : "の差分(--apply で反映)"}。`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
