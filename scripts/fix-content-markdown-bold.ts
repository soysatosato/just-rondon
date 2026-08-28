/**
 * DB内の本文で、太字(**)が描画されない箇所を直す。
 *
 * 壊れる条件・直し方は scripts/fix-markdown-bold.ts と同じ
 * (CommonMark の right-flanking 判定に日本語の句読点が引っかかるケース)。
 * あちらはソースコード中の静的文字列が対象で、こちらは以下のDBフィールドが対象:
 *
 *   - Content.summary / Content.mainText / ContentSection.description
 *     (category: column / british-english / modern-britain)
 *   - WeeklyBriefItem.description
 *     (WeeklyBrief.headline / summary はプレーンテキスト表示なので対象外)
 *
 * 実行: npx tsx scripts/fix-content-markdown-bold.ts --dry
 *      npx tsx scripts/fix-content-markdown-bold.ts
 *
 * --only=<文字列> でラベルの部分一致に絞れる。全体を一度に書き換えると
 * 何が変わったかを追えないので、区分ごとに確認しながら流すときに使う。
 *   例: --only=/events/week   --only=/column/the-lion
 *
 * --diff を付けると、書き換わる行を before/after で並べて出す。
 *
 * --strip を付けると、デリミタを動かしても直せなかった箇所について、
 * 太字そのものを諦めて余った ** を落とす。太字の範囲が本文の意図と
 * ずれている(どこを強調したいのか読み取れない)ものが対象で、
 * 強調を推測して置き直すより、生の ** を読者に見せないほうを優先する。
 */

import "dotenv/config";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import db from "../utils/db";

const renderMd = (md: string): string =>
  renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md),
  );

function hasBrokenBold(text: string): boolean {
  if ((text.match(/\*\*/g) ?? []).length < 2) return false;
  return renderMd(text).includes("**");
}

/** 閉じ ** を壊す句読点。全角・半角の両方。 */
const PUNCT = "。、！？：；）」』】〉》・，．!?:;)\\]\\.";

/** 閉じ括弧と、それに対応する開き括弧。 */
const BRACKET_PAIRS: Record<string, string> = {
  ")": "(",
  "）": "（",
  "」": "「",
  "』": "『",
  "】": "【",
  "〉": "〈",
  "》": "《",
  "]": "[",
};

/**
 * 閉じ括弧で終わる太字を、括弧が外に出るように組み替える。
 *
 * 括弧が太字の途中から始まるか、太字の全体を包んでいるかで結果が変わる。
 *
 *   **8月28日(金)**なので   → **8月28日**(金)なので     途中から
 *   **「顔・表情」**のことだ → 「**顔・表情**」のことだ   全体を包む
 *
 * 全体を包む場合に閉じ括弧だけを外へ出すと、太字の中身が空になって
 * **** が残る。この形は括弧の対ごと外に出し、中身だけを太字にする。
 *
 * 対応する開き括弧が太字の開始より前にある(=対になっていない)場合は、
 * 動かすと文が壊れるので何も返さない。
 */
function moveBracketOut(before: string, punct: string, after: string): string {
  const open = BRACKET_PAIRS[punct];
  if (!open) return "";

  const openBracket = before.lastIndexOf(open);
  const openBold = before.lastIndexOf("**");
  if (openBracket < 0 || openBold < 0 || openBracket <= openBold) return "";

  // 開き括弧が ** の直後にある = 太字の中身がまるごと括弧の中。
  if (openBracket === openBold + 2) {
    return (
      before.slice(0, openBold) +
      open +
      "**" +
      before.slice(openBracket + open.length) +
      "**" +
      punct +
      after
    );
  }

  return (
    before.slice(0, openBracket) +
    "**" +
    before.slice(openBracket) +
    punct +
    after
  );
}

/**
 * 壊れている閉じ ** を1つずつ直す。fix-markdown-bold.ts の fixLine と同じ方針:
 * 開きの ** を探しに行かず、壊れている閉じ ** だけを見て最小限の変形をする。
 */
function fixText(text: string): string | null {
  let current = text;

  for (let guard = 0; guard < 30; guard++) {
    if (!hasBrokenBold(current)) return current === text ? null : current;

    const candidates = new RegExp(`([${PUNCT}])\\*\\*(?=[^\\s*])`, "g");
    let applied: string | null = null;

    for (const c of [...current.matchAll(candidates)]) {
      if (c.index === undefined) continue;
      const punct = c[1];
      const at = c.index;
      const before = current.slice(0, at);
      const after = current.slice(at + 1 + 2);

      const trials = /[。、！？，．!?]/.test(punct)
        ? [`${before}**${punct}${after}`]
        : [
            /*
             * 閉じ括弧の場合、句読点と同じように ** と入れ替えると
             * 開き括弧だけが太字の内側に残って対応が壊れる
             * (**8月28日(金**)なので)。括弧の対を丸ごと外に出す。
             *   **8月28日(金)**なので → **8月28日**(金)なので
             * 「**用語(読み)**」「**日付(曜日)**」は日本語の本文で繰り返し
             * 現れる形なので、空白を挟む案より先にこれを試す。
             */
            moveBracketOut(before, punct, after),
            `${before}${punct}** ${after}`,
            (() => {
              const open = before.lastIndexOf("**");
              if (open <= 0) return "";
              return (
                before.slice(0, open) +
                " **" +
                before.slice(open + 2) +
                `${punct}** ${after}`
              );
            })(),
          ].filter(Boolean);

      const wasBad = (renderMd(current).match(/\*\*/g) ?? []).length;

      for (const trial of trials) {
        if (trial === current) continue;
        const nowBad = (renderMd(trial).match(/\*\*/g) ?? []).length;
        if (nowBad < wasBad) {
          applied = trial;
          break;
        }
      }

      if (applied !== null) break;
    }

    if (applied === null) return null;
    current = applied;
  }

  return null;
}

/** 文字列中の ** の位置を全部返す。 */
function delimiterOffsets(text: string): number[] {
  const offsets: number[] = [];
  for (let i = text.indexOf("**"); i !== -1; i = text.indexOf("**", i + 2)) {
    offsets.push(i);
  }
  return offsets;
}

function removeAt(text: string, offsets: number[]): string {
  // 後ろから消さないと、前を消した時点で後ろの位置がずれる。
  return [...offsets]
    .sort((a, b) => b - a)
    .reduce((acc, at) => acc.slice(0, at) + acc.slice(at + 2), text);
}

/**
 * 成立していない太字を、対ごと落とす。
 *
 * fixText はデリミタを動かして太字を残そうとするが、開き側の位置が
 * 本文の意図とずれている場合(読点から始まる・鉤括弧の直前で開く等)は
 * どこを強調したいのかが読み取れず、動かし先を決められない。
 * そういう箇所は強調を推測せず、生の ** が消えることだけを目的にする。
 *
 * どれを落とすかは**描画結果からではなく、書き手が打った対から決める**。
 * 1番目と2番目、3番目と4番目……が書き手の意図した対で、その対だけを
 * 残して他を全部外した文字列を描画し、生の ** が出るなら壊れた対とみなす。
 *
 * 描画結果を基準にできない。デリミタが食い違うと、CommonMark は書き手の
 * 意図と関係のない組み合わせで太字を作ってしまうためで、それを「元から
 * あった太字」として温存すると、本文の無関係な範囲が太字のまま残る。実例:
 *
 *   …ために**、2日間で6レース**がまとめて…同様に**、…消化**している
 *
 * ここは1番目と4番目が余り、2番目と3番目が対になって
 * 「がまとめて実施された。…同様に」が太字として描画されていた。
 * 対で見れば (1,2) も (3,4) も壊れているので、4つとも落とすのが正しい。
 */
function stripBrokenBold(text: string): string | null {
  const offsets = delimiterOffsets(text);
  const drop: number[] = [];

  for (let i = 0; i < offsets.length; i += 2) {
    const pair = offsets.slice(i, i + 2);

    // 奇数個で余った最後の1つは、相方がいないので必ず落とす。
    if (pair.length < 2) {
      drop.push(pair[0]);
      break;
    }

    // この対だけを残した状態で描画し、生の ** が出るなら成立していない。
    const others = offsets.filter((o) => !pair.includes(o));
    if (renderMd(removeAt(text, others)).includes("**")) drop.push(...pair);
  }

  if (drop.length === 0) return null;

  const stripped = removeAt(text, drop);
  // 落としきれていなければ、判断を人に返す。
  return renderMd(stripped).includes("**") ? null : stripped;
}

type Target = {
  label: string;
  text: string;
  apply: (fixed: string) => Promise<void>;
};

const CONTENT_CATEGORIES = ["column", "british-english", "modern-britain"];

async function collectContentTargets(): Promise<Target[]> {
  const contents = await db.content.findMany({
    where: { category: { in: CONTENT_CATEGORIES } },
    select: {
      id: true,
      slug: true,
      category: true,
      summary: true,
      mainText: true,
      sections: { select: { id: true, description: true, displayOrder: true } },
    },
  });

  const targets: Target[] = [];

  for (const c of contents) {
    const path = `/${c.category}/${c.slug}`;
    if (c.summary) {
      targets.push({
        label: `${path} summary`,
        text: c.summary,
        apply: async (fixed) => {
          await db.content.update({ where: { id: c.id }, data: { summary: fixed } });
        },
      });
    }
    if (c.mainText) {
      targets.push({
        label: `${path} mainText`,
        text: c.mainText,
        apply: async (fixed) => {
          await db.content.update({ where: { id: c.id }, data: { mainText: fixed } });
        },
      });
    }
    for (const sec of c.sections) {
      if (!sec.description) continue;
      targets.push({
        label: `${path} section#${sec.displayOrder}`,
        text: sec.description,
        apply: async (fixed) => {
          await db.contentSection.update({
            where: { id: sec.id },
            data: { description: fixed },
          });
        },
      });
    }
  }

  return targets;
}

async function collectWeeklyBriefTargets(): Promise<Target[]> {
  const items = await db.weeklyBriefItem.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      brief: { select: { slug: true } },
    },
  });

  return items.map((item) => ({
    label: `/events/week/${item.brief.slug} item "${item.title}"`,
    text: item.description,
    apply: async (fixed) => {
      await db.weeklyBriefItem.update({ where: { id: item.id }, data: { description: fixed } });
    },
  }));
}

/** 書き換わった行だけを before/after で並べる。 */
function printDiff(before: string, after: string) {
  const a = before.split("\n");
  const b = after.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === b[i]) continue;
    if (a[i] !== undefined) console.log(`    - ${a[i]}`);
    if (b[i] !== undefined) console.log(`    + ${b[i]}`);
  }
}

async function main() {
  const dry = process.argv.includes("--dry");
  const diff = process.argv.includes("--diff");
  const strip = process.argv.includes("--strip");
  const only = process.argv
    .find((a) => a.startsWith("--only="))
    ?.slice("--only=".length);

  const targets = [
    ...(await collectContentTargets()),
    ...(await collectWeeklyBriefTargets()),
  ].filter((t) => (only ? t.label.includes(only) : true));

  let fixedCount = 0;
  const skipped: { label: string; text: string }[] = [];

  for (const t of targets) {
    if (!hasBrokenBold(t.text)) continue;

    let fixed = fixText(t.text);
    let stripped = false;

    // デリミタを動かして直せない箇所だけ、太字を落とす側に回す。
    if ((fixed === null || hasBrokenBold(fixed)) && strip) {
      fixed = stripBrokenBold(t.text);
      stripped = fixed !== null;
    }

    if (fixed === null || hasBrokenBold(fixed)) {
      skipped.push({ label: t.label, text: t.text.slice(0, 200) });
      continue;
    }

    console.log(`${stripped ? "太字を削除" : "修正"}: ${t.label}`);
    if (diff) printDiff(t.text, fixed);
    if (!dry) await t.apply(fixed);
    fixedCount++;
  }

  console.log(dry ? "\n=== dry run ===" : "\n=== 修正しました ===");
  console.log(`修正した箇所: ${fixedCount}`);
  console.log(`手動が必要  : ${skipped.length}`);
  if (skipped.length > 0) {
    console.log("\n--- 自動で直せなかった箇所 ---");
    for (const s of skipped) {
      console.log(`${s.label}\n    ${s.text}\n`);
    }
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
