/**
 * DB内の本文で、太字(**)が描画されない箇所を直す。
 *
 * 壊れる条件・直し方は scripts/fix-markdown-bold.ts と同じ
 * (CommonMark の right-flanking 判定に日本語の句読点が引っかかるケース)。
 * あちらはソースコード中の静的文字列が対象で、こちらは以下のDBフィールドが対象:
 *
 *   - Content.summary / Content.mainText / ContentSection.description
 *     (カテゴリーを問わず全件。当初は column / british-english /
 *      modern-britain だけを見ていたが、thames-cruise・royal-london・
 *      visa・stadium-tour・events・jobs も同じ経路で markdown 描画される)
 *   - WeeklyBriefItem.description
 *     (WeeklyBrief.headline / summary はプレーンテキスト表示なので対象外)
 *   - AttractionStory.body
 *     (観光スポットの読み物。MarkdownBody で描画される)
 *   - Artwork.description
 *     (/museums/[slug]/artworks/[id] が ReactMarkdown で描画)
 *   - Brand.appeal / Brand.story / Brand.buying
 *     (splitMarkdownSections で割ってから MarkdownBody)
 *   - BrandFaq.answer          (GuideFaq が MarkdownBody で描画)
 *   - Musical.storyEnding      (MusicalSceneDescription が Markdown で描画)
 *   - Event.description        (EventDetailCard が ReactMarkdown で描画)
 *
 * ------------------------------------------------------------------
 * 対象に入れていないもの
 * ------------------------------------------------------------------
 * Attraction.summary / tagline と AttractionVisitStep.title / body は
 * 対象外。いずれもプレーンテキストで描画されるので、** があれば
 * 壊れているかどうかに関係なく記号のまま出る。直し方が違う(組み替えでは
 * なく削除)ため、この網に入れると誤った修正をする。現状はいずれも0件。
 *
 * ★ AttractionSection.description(61件)と News.content(52件)も対象外。
 *   こちらは描画方法ではなく「そもそも描画されない」ため。
 *
 *   - AttractionSection は AttractionStory へ移行済みで、詳細ページは
 *     stories だけを読む。components/sightseeing/sections.ts の冒頭にも
 *     「ここの関数はどこからも呼ばれていない」と書いてある。移行元の
 *     記録なので、直すより当時のまま残すほうがよい。
 *   - News は 207 行あるが、app/ と components/ のどこからも読まれて
 *     いない。旧DBから移ってきたまま使われていないテーブル。
 *   - Lyrics.lyrics(4件)も同じ。ReactMarkdown で描画するコードは
 *     あるが、utils/actions/lyrics.ts の関数18個がどこからも
 *     import されておらず、そのページに辿り着く経路が無い。
 *
 *   どちらも読者には1文字も見えていない。直しても表示は変わらず、
 *   差分だけが増える。状況が変わって描画するようになったら、
 *   そのとき collect... を足すこと。
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

/**
 * 閉じ ** を壊す句読点。全角・半角の両方。
 *
 * パーセント記号(% ％)と度(°)も入れてある。CommonMark 0.31 以降は
 * Unicode の記号カテゴリも約物として扱うので、「わずか**1.4%**にすぎない」
 * のように数値+単位で閉じる書き方が壊れる。
 *
 * 波ダッシュ類(〜 ～ — –)も入れてある。「**£13.95〜**と」のように
 * 数値の範囲を示す記号で閉じる書き方が価格表記で多用されており、
 * これも right-flanking を壊す。括弧ではないので、外へ出すのではなく
 * ** と入れ替える(**13.95**〜と)。
 *
 * 全角の引用符(” ’)も入れてある。CommonMark はこれを punctuation として
 * 扱うので、**…“魔法修行”**として のように閉じ ** の直前に来ると
 * right-flanking が成立せず、** が生のまま出る。日本語の本文では
 * 強調の中に “…” を入れる書き方が珍しくないので、対で外へ出せるよう
 * BRACKET_PAIRS 側にも登録している。
 */
const PUNCT = "。、！？：；）」』】〉》・，．”’!?:;)\\]\\.〜～—–%％°";

/**
 * 開き ** を壊す約物。
 *
 * CommonMark の left-flanking は「直後が約物なら、直前が空白か約物でないと
 * 成立しない」。日本語では **£13.95〜** のように通貨記号や鉤括弧から
 * 強調を始める書き方が普通にあり、直前が普通の文字(は・が・を等)なので
 * 開き ** がそのまま文字として出る。
 *
 *   NG  価格は**£13.95〜**と  → 開き ** が開かない
 *   OK  価格は£**13.95〜**と
 *
 * 句読点も入れてある。「翌8月1日は**、ジョージ1世が…**にあたる」の
 * ように、読点を太字の内側から書き始めてしまった箇所が多い。
 * この場合は読点を外へ出すのが常に正しい(日本語では句読点を強調の
 * 内側に入れる意味がない)ので、太字を落とさずに済む。
 *
 * 閉じ側(PUNCT)と違って通貨記号・開き括弧・波ダッシュ・句読点が中心になる。
 */
const OPEN_PUNCT = "£$€¥＄￥「『（(【〈《“‘〜～—–\\-\\[。、！？，．!?,.";

/**
 * 開き約物のうち、太字の外へ出してよいもの。
 *
 * 通貨記号と波ダッシュは、太字に入っていなくても見た目がほとんど変わらない。
 *   価格は**£13.95〜**と → 価格は£**13.95**〜と
 *
 * 逆に開き括弧は外へ出すと相方の閉じ括弧が太字の中に取り残されて
 * 対応が崩れる(『が外・』が中)。そちらは直前に空白を入れて開かせる。
 */
const MOVABLE_OPEN_PUNCT = "£$€¥＄￥〜～—–。、！？，．!?,.";

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
  "\u201d": "\u201c",
  "\u2019": "\u2018",
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
/** 描画結果に残る生の ** の個数。少ないほど良い。 */
function rawCount(text: string): number {
  return (renderMd(text).match(/\*\*/g) ?? []).length;
}

/** 描画結果で実際に太字になった箇所の数。減らしてはいけない。 */
function strongCount(text: string): number {
  return (renderMd(text).match(/<strong>/g) ?? []).length;
}

/**
 * その変形を採用してよいか。
 *
 * 生の ** が減ることだけを条件にすると、成立している太字を壊す変形まで
 * 通ってしまう。実例:
 *
 *   - **第一次大戦**: 1915〜1919年は開催なし
 *
 * ここの閉じ ** は正しく閉じているが、「直後が約物(:)で直前が普通の文字」
 * という形は、壊れた開き ** と見分けがつかない。約物を内側へ動かすと
 * **第一次大戦:** になり、見た目は変わらないのに書き手の意図から外れる。
 * 同じ形で本当に壊れている箇所と混ざっているので、位置だけでは判定できない。
 *
 * そこで結果で判定する。生の ** が減り、かつ実際に太字になっている箇所が
 * 減っていないことを両方求める。
 */
function isImprovement(
  trial: string,
  wasRaw: number,
  wasStrong: number,
): boolean {
  return rawCount(trial) < wasRaw && strongCount(trial) >= wasStrong;
}

/**
 * 閉じ ** が約物の直後にある箇所を1つ直す。直せなければ null。
 *
 * 開きの ** を探しに行かず、壊れている閉じ ** だけを見て最小限の変形をする
 * (fix-markdown-bold.ts の fixLine と同じ方針)。
 */
function stepClosing(current: string): string | null {
  const candidates = new RegExp(`([${PUNCT}])\\*\\*(?=[^\\s*])`, "g");
  const wasBad = rawCount(current);
  const wasStrong = strongCount(current);

  for (const c of [...current.matchAll(candidates)]) {
    if (c.index === undefined) continue;
    const punct = c[1];
    const at = c.index;
    const before = current.slice(0, at);
    const after = current.slice(at + 1 + 2);

    // 括弧ではない約物は、外へ出さずに ** と入れ替えるだけでよい。
    //   わずか**1.4%**にすぎない → わずか**1.4**%にすぎない
    const trials = /[。、！？，．!?〜～—–%％°]/.test(punct)
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

    for (const trial of trials) {
      if (trial === current) continue;
      if (isImprovement(trial, wasBad, wasStrong)) return trial;
    }
  }

  return null;
}

/**
 * 開き ** の直後が約物で、直前が普通の文字になっている箇所を1つ直す。
 *
 * 直前が空白か約物なら left-flanking は成立しているので触らない。
 * これを見落とすと、壊れていない **見出し**: のような箇所まで
 * 「開きが壊れている」と誤認して書き換えてしまう。
 *
 * 単独では生の ** が減らないことがある。開きと閉じの両方が壊れている
 *   価格は**£13.95〜**と
 * のような箇所は、片方だけ直しても数が変わらないためで、
 * そのときは閉じ側の修正を1手先読みして、その先で減るなら採用する。
 */
function stepOpening(current: string): string | null {
  const openBad = new RegExp(
    `([^\\s*${PUNCT}${OPEN_PUNCT}])\\*\\*(?=[${OPEN_PUNCT}])`,
    "g",
  );
  const wasBad = rawCount(current);
  const wasStrong = strongCount(current);

  for (const c of [...current.matchAll(openBad)]) {
    if (c.index === undefined) continue;
    const at = c.index + c[1].length;
    const before = current.slice(0, at);
    const after = current.slice(at + 2);
    const punct = after[0];

    // 約物を外へ出す案と、直前に空白を入れる案。
    // 通貨記号・波ダッシュ・句読点は外へ出しても意味が変わらないので先に試す。
    // 開き括弧は外へ出すと相方が太字の中に取り残されるので、空白を先に試す。
    const moveOut = `${before}${punct}**${after.slice(1)}`;
    const addSpace = `${before} **${after}`;
    const trials = MOVABLE_OPEN_PUNCT.includes(punct)
      ? [moveOut, addSpace]
      : [addSpace, moveOut];

    for (const trial of trials) {
      if (trial === current) continue;
      if (isImprovement(trial, wasBad, wasStrong)) return trial;

      // 1手先読み。閉じ側まで直せば減るなら、この手を通す。
      const next = stepClosing(trial);
      if (next && isImprovement(next, wasBad, wasStrong)) return trial;
    }
  }

  return null;
}

/**
 * 壊れている開き ** を、見つかったものすべて一度に直す。
 *
 * 1か所ずつでは直せない形があるため。
 *
 *   料金は大人約**£18.50〜**、子どもは約**£14.00〜**。
 *
 * ここは開きが2つとも壊れていて、CommonMark は2番目と3番目のデリミタを
 * 勝手に対にしてしまう(「、子どもは約」が太字になる)。片方の £ だけを
 * 外へ出しても生の ** の数は2のまま変わらないので、1手ずつ改善を
 * 求める stepOpening では採用されない。両方まとめて出せば0になる。
 *
 * 外へ出せる約物(MOVABLE_OPEN_PUNCT)に限る。開き括弧を一括で動かすと
 * 相方の閉じ括弧が太字の中に取り残されるため、そちらは対象にしない。
 */
function stepOpeningAll(current: string): string | null {
  const openBad = new RegExp(
    `([^\\s*${PUNCT}${OPEN_PUNCT}])\\*\\*(?=[${MOVABLE_OPEN_PUNCT}])`,
    "g",
  );
  const matches = [...current.matchAll(openBad)];
  if (matches.length < 2) return null;

  // 後ろから書き換える。前を変えると後ろの位置がずれる。
  let next = current;
  for (const c of [...matches].reverse()) {
    if (c.index === undefined) continue;
    const at = c.index + c[1].length;
    const punct = next[at + 2];
    next = next.slice(0, at) + punct + "**" + next.slice(at + 3);
  }

  return isImprovement(next, rawCount(current), strongCount(current))
    ? next
    : null;
}

/**
 * 壊れている ** を1つずつ直す。直しきれなければ null を返す。
 *
 * 直せたところまでを取り出したいときは fixTextPartial を使う。
 */
function fixText(text: string): string | null {
  const { text: out, ok } = fixTextPartial(text);
  if (!ok) return null;
  return out === text ? null : out;
}

/** 直せるところまで直した文字列と、直しきれたかどうかを返す。 */
function fixTextPartial(text: string): { text: string; ok: boolean } {
  let current = text;

  for (let guard = 0; guard < 30; guard++) {
    if (!hasBrokenBold(current)) return { text: current, ok: true };
    const next =
      stepClosing(current) ?? stepOpening(current) ?? stepOpeningAll(current);
    if (next === null) return { text: current, ok: false };
    current = next;
  }

  return { text: current, ok: !hasBrokenBold(current) };
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

/*
 * Content は category を絞らない。
 *
 * 当初は読み物3種(column / british-english / modern-britain)だけを見て
 * いたが、そのせいで thames-cruise・royal-london・visa・stadium-tour・
 * events・jobs の本文に壊れた太字が残っていた。いずれも
 * ExpandableText / MarkdownBody / ReactMarkdown のどれかを通っており、
 * 読者に生の ** が見えている点は読み物3種と変わらない。
 *
 * プレーンテキストで描く経路が増えたら、そのときは category ではなく
 * 「どう描画されるか」で外すこと。カテゴリー名は描画方法を表さない。
 */
async function collectContentTargets(): Promise<Target[]> {
  const contents = await db.content.findMany({
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

/**
 * 観光スポットの読み物(AttractionStory.body)。
 *
 * 旧 AttractionSection から機械的に移した節(source: "migrated")に、
 * 日本語の閉じ括弧・句読点の直後で ** を閉じている箇所が残っている。
 * 移行元がそう書かれていたので、移行スクリプトはそのまま運んだ。
 *
 * 表示側の事情がひとつある。visitFlow が入っているページでは
 * kind: "highlight" の節が伏せられる(components/sightseeing/stories.ts)。
 * 伏せられている節の ** は読者には見えないが、歩き方を外せば出てくるので
 * ここでは区別せず直す。ラベルに [非表示] と出るのは、直った結果を
 * ブラウザで確かめようとして「見つからない」と悩まないための目印。
 */
async function collectAttractionStoryTargets(): Promise<Target[]> {
  const attractions = await db.attraction.findMany({
    select: {
      slug: true,
      isPublished: true,
      _count: { select: { visitFlow: true } },
      stories: {
        select: { id: true, kind: true, body: true, displayOrder: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  const targets: Target[] = [];

  for (const a of attractions) {
    for (const st of a.stories) {
      const hiddenByVisitFlow = a._count.visitFlow > 0 && st.kind === "highlight";
      const marks = [
        a.isPublished ? "" : "[非公開]",
        hiddenByVisitFlow ? "[非表示]" : "",
      ]
        .filter(Boolean)
        .join("");

      targets.push({
        label: `/sightseeing/${a.slug} story#${st.displayOrder} ${st.kind}${marks ? " " + marks : ""}`,
        text: st.body,
        apply: async (fixed) => {
          await db.attractionStory.update({
            where: { id: st.id },
            data: { body: fixed },
          });
        },
      });
    }
  }

  return targets;
}

/**
 * 作品解説(Artwork.description)。
 *
 * /museums/[slug]/artworks/[id] が ReactMarkdown で描画する。
 * 47館ぶんの作品データのうち、旧DBから移ってきた解説に
 * 「**〜である。**次に」の形が大量に残っている。
 */
async function collectArtworkTargets(): Promise<Target[]> {
  const artworks = await db.artwork.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      museum: { select: { slug: true } },
    },
  });

  return artworks
    .filter((a) => a.description)
    .map((a) => ({
      label: `/museums/${a.museum.slug}/artworks "${a.title}"`,
      text: a.description as string,
      apply: async (fixed) => {
        await db.artwork.update({ where: { id: a.id }, data: { description: fixed } });
      },
    }));
}

/**
 * ブランド紹介(Brand.appeal / story / buying)と、そのFAQ(BrandFaq.answer)。
 *
 * 本文3種は splitMarkdownSections で段落に割ってから MarkdownBody に通す。
 * 割ってから描画するので、壊れた太字が段落をまたぐことはない。
 */
async function collectBrandTargets(): Promise<Target[]> {
  const brands = await db.brand.findMany({
    select: {
      id: true,
      slug: true,
      appeal: true,
      story: true,
      buying: true,
      faqs: { select: { id: true, question: true, answer: true } },
    },
  });

  const targets: Target[] = [];

  for (const b of brands) {
    const fields = [
      ["appeal", b.appeal],
      ["story", b.story],
      ["buying", b.buying],
    ] as const;

    for (const [field, text] of fields) {
      if (!text) continue;
      targets.push({
        label: `/brands/${b.slug} ${field}`,
        text,
        apply: async (fixed) => {
          await db.brand.update({ where: { id: b.id }, data: { [field]: fixed } });
        },
      });
    }

    for (const faq of b.faqs) {
      if (!faq.answer) continue;
      targets.push({
        label: `/brands/${b.slug} faq "${faq.question.slice(0, 24)}"`,
        text: faq.answer,
        apply: async (fixed) => {
          await db.brandFaq.update({ where: { id: faq.id }, data: { answer: fixed } });
        },
      });
    }
  }

  return targets;
}

/**
 * ミュージカルのあらすじの結末(Musical.storyEnding)。
 *
 * MusicalSceneDescription が Markdown で描画する。設計上、結末は
 * 折りたたみの中に置いてある(musicals-story-layers)。閉じていても
 * 開けば読者に見えるので、表に出ている本文と区別せず直す。
 *
 * ★ Lyrics.lyrics は対象外。ReactMarkdown で描画するコードは残って
 *   いるが、utils/actions/lyrics.ts の関数18個が app/ からも
 *   components/ からも1つも import されておらず、どのページからも
 *   辿り着けない。News と同じ、旧DBから残ったまま使われていない
 *   テーブルなので、直しても読者の画面は変わらない。
 */
async function collectMusicalTargets(): Promise<Target[]> {
  const musicals = await db.musical.findMany({
    select: { id: true, slug: true, storyEnding: true },
  });

  return musicals
    .filter((m) => m.storyEnding)
    .map((m) => ({
      label: `/musicals/${m.slug} storyEnding`,
      text: m.storyEnding as string,
      apply: async (fixed) => {
        await db.musical.update({ where: { id: m.id }, data: { storyEnding: fixed } });
      },
    }));
}

/** 催し(Event.description)。EventDetailCard が ReactMarkdown で描画する。 */
async function collectEventTargets(): Promise<Target[]> {
  const events = await db.event.findMany({
    select: { id: true, title: true, description: true },
  });

  return events
    .filter((e) => e.description)
    .map((e) => ({
      label: `/events "${e.title}"`,
      text: e.description,
      apply: async (fixed) => {
        await db.event.update({ where: { id: e.id }, data: { description: fixed } });
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
    ...(await collectAttractionStoryTargets()),
    ...(await collectArtworkTargets()),
    ...(await collectBrandTargets()),
    ...(await collectMusicalTargets()),
    ...(await collectEventTargets()),
  ].filter((t) => (only ? t.label.includes(only) : true));

  let fixedCount = 0;
  const skipped: { label: string; text: string }[] = [];

  for (const t of targets) {
    if (!hasBrokenBold(t.text)) continue;

    let fixed = fixText(t.text);
    let stripped = false;

    /*
     * デリミタを動かして直せない箇所だけ、太字を落とす側に回す。
     *
     * 落とす前に fixTextPartial で直せるところまで直しておく。
     * 1つの節に「直せる箇所」と「意図が読み取れない箇所」が混在している
     * ことが多く、原文に対して strip をかけると、直せたはずの太字まで
     * 巻き添えで消える。実例(doggett のコラム)では、原文へ直接 strip を
     * かけると節の太字が全部消えたが、部分修正を挟むと消えるのは
     * 1文だけで済む。
     */
    if ((fixed === null || hasBrokenBold(fixed)) && strip) {
      const partial = fixTextPartial(t.text).text;
      fixed = stripBrokenBold(partial);
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
