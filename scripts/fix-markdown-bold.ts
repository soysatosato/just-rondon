/**
 * 日本語本文で太字(**)が描画されない箇所を直す。
 *
 * ## 何が起きているか
 *
 * CommonMark は閉じの ** を「右隣接(right-flanking)」でないと閉じ記号と
 * みなさない。閉じ ** の直前が句読点で、直後が文字(CJKまたは英字)だと、
 * その ** はどちらのフランクにもならず、生の "**" として出力される。
 *
 *   **無視されていません。**イギリスの…  → ** がそのまま出る
 *   **無視されていません**。イギリスの…  → 正しく <strong> になる
 *
 * 直後が空白・行末・全角開き括弧なら問題ない。日本語は分かち書きを
 * しないので、この条件を踏み抜きやすい。
 *
 * ## 直し方は2通りある
 *
 * 1. 句読点が「太字の中身の末尾」の場合 → 外に出す
 *      **…です。**あ  →  **…です**。あ
 *    文の意味は変わらず、句点が太字でなくなるだけ。
 *
 * 2. 句読点が「語の一部」の場合(括弧や中黒で終わる語) → 前後に空白を入れる
 *      **ハンドポンプ（手動のレバー）**が  →  **…（手動のレバー）** が
 *    語を壊せないのでこちらを使う。半角空白は日本語組版では
 *    ほぼ見えず、既存記事でも同じ書き方が使われている。
 *
 * ## なぜ一括置換だけで済ませないか
 *
 * `**A。**B**C**` のような並びだと、正規表現が誤った ** の組で
 * マッチして文を壊す(実際に1行壊した)。そのため
 * 「1行ごとに置換 → その行を実際に描画 → ** が消えたか確認」まで
 * やって、直らない/壊れた行はスキップして報告する。
 *
 * 実行: npx tsx scripts/fix-markdown-bold.ts --dry
 *      npx tsx scripts/fix-markdown-bold.ts
 */

import fs from "fs";
import { execSync } from "child_process";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const renderMd = (md: string): string =>
  renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md),
  );

/**
 * その行を描画したときに生の ** が残るか。
 *
 * 判定の前に2つ正規化する。どちらも怠ると誤検知する:
 *
 * 1. 行頭の空白を落とす。TSのソースはインデントされているので、
 *    そのまま渡すと remark が「字下げコードブロック」と解釈し、
 *    markdown として一切描画されない(= ** が必ず残る)。
 * 2. テンプレートリテラルの ${...} を1文字に置き換える。
 *    描画できないうえ、金額や日付が入る位置なので
 *    「文字がある」ことさえ再現できれば太字の判定には足りる。
 */
function normalize(line: string): string {
  return (
    line
      .replace(/^\s+/, "")
      /*
        TS のプロパティ宣言(`body: \``, `answer: "` など)を落とす。
        これを残すと、行頭の ** の直前がバッククォートや引用符
        (= 句読点扱い)になり、本来は正常な開き ** まで
        「壊れている」と誤判定される。
      */
      .replace(/^(?:const\s+\w+\s*=\s*)?\w+:\s*(?:`|"|')/, "")
      /*
        エスケープされた改行を実際の改行に戻す。
        data.ts 系は本文を1行の文字列に "\n\n" 区切りで詰め込んでいて、
        そのままだと段落が繋がって別の ** と誤って対になる。
      */
      .replace(/\\n/g, "\n")
      .replace(/\$\{[^}]*\}/g, "X")
  );
}

function hasBrokenBold(line: string): boolean {
  const probe = normalize(line);
  if ((probe.match(/\*\*/g) ?? []).length < 2) return false;
  return renderMd(probe).includes("**");
}

/** 閉じ ** を壊す句読点。全角・半角の両方。 */
const PUNCT = "。、！？：；）」』】〉》・，．!?:;)\\]\\.";

/**
 * 壊れている閉じ ** を1つずつ直す。
 *
 * 開きの ** を探しに行かないのがポイント。`**A。**B**C**` のような
 * 並びだと「どれが対応する開きか」を正規表現で当てるのは不可能で、
 * 実際にそれで1行壊した。ここでは壊れている閉じ ** だけを見て、
 * その場で最小限の変形をする。
 *
 *  - 直前が文の区切り(。、！？) → 句読点を ** の外に出す
 *      …です。**あ  →  …です**。あ
 *  - 直前が括弧など語の一部     → 閉じ ** の直後に半角空白を入れる
 *      …（レバー）**が  →  …（レバー）** が
 *
 * 1つ直すたびに描画して確認し、直らなければ諦めて null を返す。
 */
function fixLine(line: string): string | null {
  let current = line;

  for (let guard = 0; guard < 30; guard++) {
    if (!hasBrokenBold(current)) return current === line ? null : current;

    /*
      「直前が句読点の **」は行内に複数あり、その大半は正常な開き ** の
      手前にある句読点(例:「…迎えます。**金曜と…」)。位置だけで選ぶと
      開きの ** を壊すので、候補を順に試して「実際に壊れが減ったもの」
      だけを採用する。
    */
    const candidates = new RegExp(`([${PUNCT}])\\*\\*(?=[^\\s*])`, "g");
    let applied: string | null = null;

    for (const c of [...current.matchAll(candidates)]) {
      if (c.index === undefined) continue;
      const punct = c[1];
      const at = c.index;
      const before = current.slice(0, at);
      const after = current.slice(at + 1 + 2); // punct + "**" の後ろ

      const trials = /[。、！？，．!?]/.test(punct)
        ? [`${before}**${punct}${after}`] // 句読点を外に出す
        : [
            `${before}${punct}** ${after}`, // 語の一部 → 閉じ側に空白
            /*
              「**「バングラタウン」**と」のように、太字が全角括弧で
              始まって全角括弧で終わる場合は、開き ** も左隣接に
              ならないため閉じ側だけ空けても直らない。両側を空ける。
            */
            (() => {
              const open = before.lastIndexOf("**");
              if (open <= 0) return "";
              // 開き ** の「左」と、閉じ ** の「右」に空白を入れる
              return (
                before.slice(0, open) +
                " **" +
                before.slice(open + 2) +
                `${punct}** ${after}`
              );
            })(),
          ].filter(Boolean);

      /*
        生の ** が減った候補だけを採用する。減らない変形は
        「その候補は壊れ箇所ではなかった」ということなので捨てる。
        こうしないと、正常な開き ** の手前にある句読点を
        掴んで文を壊す。
      */
      const wasBad = (renderMd(normalize(current)).match(/\*\*/g) ?? []).length;

      for (const trial of trials) {
        if (trial === current) continue;
        const nowBad = (renderMd(normalize(trial)).match(/\*\*/g) ?? []).length;
        if (nowBad < wasBad) {
          applied = trial;
          break;
        }
      }

      if (applied !== null) break;
    }

    if (applied === null) return null;

    // 1箇所直すごとにループ先頭へ戻り、hasBrokenBold で再判定する。
    // 残りが直っていればそこで確定し、まだ壊れていれば次の箇所へ進む。
    current = applied;
  }

  return null;
}

function main() {
  const dry = process.argv.includes("--dry");

  const files = execSync(
    "grep -rl '\\*\\*' components lib app --include=*.ts --include=*.tsx",
  )
    .toString()
    .trim()
    .split("\n")
    .filter(Boolean);

  let fixedLines = 0;
  let skipped: { file: string; line: number; text: string }[] = [];
  const touched: string[] = [];

  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    const lines = src.split("\n");
    let changed = false;

    lines.forEach((line, i) => {
      if (!hasBrokenBold(line)) return;

      const fixed = fixLine(line);
      if (fixed === null || hasBrokenBold(fixed)) {
        skipped.push({ file, line: i + 1, text: line.trim().slice(0, 90) });
        return;
      }

      lines[i] = fixed;
      changed = true;
      fixedLines++;
    });

    if (changed) {
      touched.push(file);
      if (!dry) fs.writeFileSync(file, lines.join("\n"));
    }
  }

  console.log(dry ? "=== dry run ===" : "=== 修正しました ===");
  console.log(`対象ファイル: ${touched.length}`);
  console.log(`修正した行  : ${fixedLines}`);
  console.log(`手動が必要  : ${skipped.length}`);
  if (skipped.length > 0) {
    const withInterp = skipped.filter((s) => s.text.includes("${")).length;
    console.log(
      `  うち \${...} を含む行: ${withInterp} / それ以外: ${skipped.length - withInterp}`,
    );
    console.log("\n--- 自動で直せなかった行 ---");
    for (const s of skipped) {
      console.log(`${s.file}:${s.line}\n    ${s.text}`);
    }
  }
}

main();
