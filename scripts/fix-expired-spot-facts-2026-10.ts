/**
 * 過ぎた日付や終わった催しのまま残っていた観光スポットの記述を直す。
 *
 *   npx tsx scripts/fix-expired-spot-facts-2026-10.ts           # 差分を表示
 *   npx tsx scripts/fix-expired-spot-facts-2026-10.ts --apply   # DBへ反映
 *
 * 2026-10-19 のコンテンツ監査で見つかったもの。歩き方(visitFlow)や本文
 * (stories)にその年の日付を直書きしていたため、日付が過ぎても気づけなかった。
 * 2026-10-20 に各公式の案内で確かめた:
 *
 *   - バッキンガム宮殿: 2026年の夏の公開は 7/9〜9/27 で終了、2027年は未発表。
 *     夏以外は冬と春の限られた日に少人数のガイドツアー(Royal Collection Trust)
 *   - ロンドン塔の鍵の儀式: 無料ではなく £10〜£50 から選ぶ方式(推奨 £30)。
 *     毎月第1営業日の13時に翌月分を発売、その日が金曜なら翌週の月曜(HRP)
 *   - ウェンブリーのツアー: 夏の休止が明け、2026-09-21 に再開
 *   - バンケティング・ハウス: 2024年5月から改修で閉館、2026-08-01 に再開。
 *     夏季公開(8/1〜9/20)のほかは日を限った公開日だけ(HRP)。本文の
 *     「現在一般公開は休止中」は改修前の記述のままだった
 *   - 第4の台座: 2026-09-10 にチャバララ・セルフ『Lady in Blue』を除幕。
 *     次は2028年にアンドラ・ウルスツァ(London.gov.uk)
 *   - モノポリー・ライフサイズド: 「8/30までの会期」ではなく、2027-01-03 に閉館
 *     (Time Out / BroadwayWorld、2026年10月)
 *   - オープン・ハウス: 2026年は 9/12〜20 で終了、2027年は未発表
 *   - プラネタリウム: 公式の休館案内に再開日は無い(本文の「2028年春の予定」は
 *     休館発表時の報道の見込み)。天文台の敷地全体も 2026-11-02 から休館(RMG)
 *   - ザ・ムーンウォーカーズ(2026-04-12 終了)とプレヒストリック・プラネット
 *     (ライトルームの上演一覧から消えた)は、Attraction.isPublished の説明に
 *     従って行を消さずに非公開にする
 *
 * 置換は find(置換前の部分文字列)で守る。find が無く置換後の文が既にあれば
 * 適用済みとして飛ばすので、二度流しても同じ結果になる。新しい本文は
 * react-markdown で描いて、生の ** が残らないことを確かめてから書く(CLAUDE.md)。
 */

import "dotenv/config";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prisma, PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

type TextFix = {
  slug: string;
  table: "story" | "visit";
  id: number;
  field: "heading" | "title" | "body";
  /** 置換前の部分文字列。whole のときは「これを含む値なら丸ごと置き換える」目印。 */
  find: string;
  replace: string;
  whole?: boolean;
};

type FieldFix = {
  slug: string;
  field: "openingHours" | "closedNote" | "summary";
  /** いまの値。違っていたら手で直された可能性があるので触らない。 */
  from: string | null;
  to: string | null;
};

const TEXT_FIXES: TextFix[] = [
  // ---------- バッキンガム宮殿 ----------
  {
    slug: "buckingham-palace",
    table: "visit",
    id: 91,
    field: "body",
    find: "2026年は7月9日〜9月27日。8月31日までは毎日9:30〜19:30、9月1日以降は木〜月のみ9:30〜18:30に変わります。7〜8月の時間枠は数週間前に埋まるので、予約は早めに。",
    replace:
      "2026年の公開は7月9日〜9月27日で、すでに終わっています。2027年の日程はまだ発表されていません(例年は7月から9月まで)。公開中も、7〜8月の時間枠は数週間前に埋まります。夏以外の時期は、冬と春の限られた日に少人数のガイドツアー(有料・要予約)が組まれることがあり、日程は公式サイトで発表されます。",
  },
  {
    slug: "buckingham-palace",
    table: "visit",
    id: 93,
    field: "title",
    find: "2026年は一部が見られない",
    replace: "工事で見られない部屋がある",
  },
  {
    slug: "buckingham-palace",
    table: "visit",
    id: 93,
    field: "body",
    find: "ホワイト・ドローイングルームは2026年の公開では見学できません。舞踏室とバウルームの一部にも仮囲いが入ります。",
    replace:
      "2026年の公開ではホワイト・ドローイングルームが見学できず、舞踏室とバウルームの一部にも仮囲いが入りました。工事の完了予定は2027年後半で、2027年にどこまで見られるかは公式の発表を待ってください。",
  },
  {
    slug: "buckingham-palace",
    table: "story",
    id: 2552,
    field: "body",
    find: "それ以外の時期に行っても、外から柵越しに眺めることしかできません。",
    replace:
      "それ以外の時期は、冬と春の限られた日に開かれる少人数のガイドツアー(有料・要予約)を除けば、柵の外から眺めることしかできません。",
  },

  // ---------- ロンドン塔(鍵の儀式) ----------
  {
    slug: "tower-of-london",
    table: "story",
    id: 2682,
    field: "heading",
    find: "夜の鍵の儀式は、無料で見られる",
    replace: "夜の鍵の儀式は、予約すれば見られる",
  },
  {
    slug: "tower-of-london",
    table: "story",
    id: 2682,
    field: "body",
    find: "観光客向けの追加公演ではなく、実際にその日の塔を閉める作業を見せているだけなので、**参加は無料**です。ただし人数が限られるため公式サイトでの事前予約制で、数か月先まで埋まっているのが普通です。次のチケット放出は2026年9月1日13時と告知されています。",
    replace:
      "観光客向けの追加公演ではなく、実際にその日の塔を閉める作業を見せているものです。人数が限られるため、**公式サイトでの事前予約制**です。料金は£10〜£50の範囲で自分で選ぶ方式で、推奨額は£30。チケットは毎月第1営業日の13時に翌月分が売り出され(その日が金曜なら翌週の月曜)、すぐに埋まります。",
  },

  // ---------- ウェンブリー・スタジアム・ツアー ----------
  {
    slug: "wembley-stadium-tour",
    table: "visit",
    id: 4542,
    field: "title",
    find: "2026年夏はツアーが休止している",
    replace: "コンサートの時期は休止する",
  },
  {
    slug: "wembley-stadium-tour",
    table: "visit",
    id: 4542,
    field: "body",
    find: "コンサート開催のため、2026年は7月・8月・9月前半のツアーが休止で、再開は9月21日の予定です。この時期に行っても入れません。",
    replace:
      "コンサートが続く夏は、ツアーが止まる期間があります。2026年は7月から9月前半まで休止し、9月21日に再開しました。",
  },

  // ---------- バンケティング・ハウス ----------
  {
    slug: "banqueting-house-london",
    table: "visit",
    id: 5513,
    field: "body",
    find: "通年公開ではありません。2026年は8月1日から9月20日までの夏季公開で、それ以外は行事や貸切に使われます。2年がかりの改修を経て2026年に再開したばかりで、公開日程は年によって変わります。訪問前に必ず公式サイトで確認してください。",
    replace:
      "通年公開ではありません。2024年5月から改修で閉まり、2026年8月1日に再開しました。2026年の夏季公開(8月1日〜9月20日)のあとは、日を限った公開日だけ入れます。行事や貸切の日は閉まるので、訪問前に必ず公式サイトで公開日を確認してください。",
  },
  {
    slug: "banqueting-house-london",
    table: "story",
    id: 2459,
    field: "heading",
    find: "営業時間",
    replace: "入れる日は限られている",
    whole: true,
  },
  {
    slug: "banqueting-house-london",
    table: "story",
    id: 2459,
    field: "body",
    find: "**一般公開は休止中**",
    whole: true,
    replace:
      "**2024年5月から改修で閉まっていましたが、2026年8月1日に再開しました。** 新しいエレベーターで、段差なしで天井画のある大広間まで上がれるようになっています。\n\n" +
      "ただし通年公開ではありません。夏季公開(2026年は8月1日〜9月20日)のほかは、日を限った公開日だけ入れます。行事や貸切に使われる日は閉まります。2026年の夏の料金は大人£10で、16歳未満は大人と一緒なら無料でした。\n\n" +
      "公開日は公式サイトで確認してから予定を組んでください。",
  },

  // ---------- 第4の台座 ----------
  {
    slug: "the-fourth-plinth-trafalgar-square",
    table: "visit",
    id: 4500,
    field: "title",
    find: "2026年9月に交代する",
    replace: "いまは『Lady in Blue』",
  },
  {
    slug: "the-fourth-plinth-trafalgar-square",
    table: "visit",
    id: 4500,
    field: "body",
    find: "これが2026年9月に、チャバララ・セルフ『Lady in Blue』へ入れ替わる予定。",
    whole: true,
    replace:
      "2026年9月10日、ニューヨークの作家チャバララ・セルフの『Lady in Blue』が除幕されました。青いドレスと青いハイヒールの若い女性をかたどった大きなブロンズ像で、身に着けた宝飾品はラピスラズリの色に塗られています。作家は、記念碑の主人公ではなく、この広場を毎日行き交う人々と同じ普通の人として作ったと語っています。2024年から載っていたテレサ・マルゴジェス『Mil Veces un Instante』からの交代で、次は2028年にアンドラ・ウルスツァの作品が載る予定です。",
  },

  // ---------- モノポリー・ライフサイズド ----------
  {
    slug: "monopoly-lifesized-london",
    table: "visit",
    id: 5451,
    field: "title",
    find: "期間限定。月曜休み",
    replace: "2027年1月3日で閉館。月曜休み",
  },
  {
    slug: "monopoly-lifesized-london",
    table: "visit",
    id: 5451,
    field: "body",
    find: "2026年8月30日までの会期です（延長される可能性はあります）。",
    replace:
      "2027年1月3日で営業を終えると発表されていて、それまでの冬のあいだは営業を続けます。",
  },

  // ---------- オープン・ハウス・フェスティバル ----------
  {
    slug: "open-house-festival-london",
    table: "visit",
    id: 5584,
    field: "body",
    find: "2026年は8月19日の正午に受付が始まりました。",
    replace:
      "2026年は8月19日の正午に受付が始まりました(2027年の日程と受付開始日は未発表)。",
  },

  // ---------- ピーター・ハリソン・プラネタリウム ----------
  {
    slug: "peter-harrison-planetarium-greenwich",
    table: "story",
    id: 2799,
    field: "heading",
    find: "現在は長期休館中(再開は2028年春の予定)",
    replace: "現在は長期休館中(再開の時期は未発表)",
  },
  {
    slug: "peter-harrison-planetarium-greenwich",
    table: "story",
    id: 2799,
    field: "body",
    find: "2025年9月8日に休館に入り、再開は**2028年春**の予定である。",
    replace:
      "2025年9月8日に休館に入った。休館が発表された当時は2028年春の再開見込みと伝えられたが、2026年10月時点の公式の休館案内に再開の日付は出ていない。2026年11月2日からは、王立天文台の敷地全体も同じ改修で休館に入る。",
  },
  {
    slug: "peter-harrison-planetarium-greenwich",
    table: "story",
    id: 2799,
    field: "body",
    find: "子午線の標示や公園、国立海事博物館、旧王立海軍学校は別の施設である。",
    replace:
      "公園、国立海事博物館、旧王立海軍学校は別の施設で、休館の対象ではない。本初子午線の標示がある天文台の中庭は、2026年11月2日から天文台と一緒に休館に入る。",
  },
  {
    slug: "peter-harrison-planetarium-greenwich",
    table: "story",
    id: 2800,
    field: "body",
    find: "休館中でも外観は見られる。",
    replace:
      "建物の外観は、天文台の敷地が開いていれば見られる(2026年11月2日からは敷地全体が休館)。",
  },
];

const FIELD_FIXES: FieldFix[] = [
  {
    slug: "buckingham-palace",
    field: "openingHours",
    from: "夏季公開 9:30〜19:30 (公開日は公式で確認)",
    to: "夏季のみ公開（2026年は7月9日〜9月27日で終了。2027年の日程は未発表）",
  },
  {
    slug: "banqueting-house-london",
    field: "openingHours",
    from: "10:00〜16:00 (夏季公開。会期は公式で確認)",
    to: "公開日の10:00〜16:00（最終入場15:00）",
  },
  {
    slug: "banqueting-house-london",
    field: "closedNote",
    from: "夏季のみ公開。会期は年によって変わる",
    to: "通年公開ではない（夏季公開と、日を限った公開日だけ）",
  },
  {
    slug: "open-house-festival-london",
    field: "openingHours",
    from: "毎年9月に9日間（2026年は9月12〜20日）",
    to: "毎年9月に9日間（2026年は9月12〜20日に終了。2027年の日程は未発表）",
  },
  {
    slug: "open-house-festival-london",
    field: "summary",
    from: "毎年9月に開かれる建築の祭り。官公庁、企業の本社、教会、個人の住宅、下水処理場まで、普段は一般公開されていない建物が一斉に扉を開ける。すべて無料。2026年は9月12日から20日までの9日間で、掲載は621件、うち143件が初参加。多くは予約不要で並べば入れるが、人気の建物は事前予約制で、受付開始と同時に埋まる。",
    to: "毎年9月に開かれる建築の祭り。官公庁、企業の本社、教会、個人の住宅、下水処理場まで、普段は一般公開されていない建物が一斉に扉を開ける。すべて無料。2026年は9月12日から20日までの9日間に開かれ、621件が参加した(うち143件が初参加)。2027年の日程は未発表。多くは予約不要で並べば入れるが、人気の建物は事前予約制で、受付開始と同時に埋まる。",
  },
  {
    // 休館中に開館時間だけが残ると、開いているように読める。休みは closedNote が持つ。
    slug: "peter-harrison-planetarium-greenwich",
    field: "openingHours",
    from: "10:00〜17:00",
    to: null,
  },
];

/** 終わった期間限定の催し。isPublished の説明どおり、行は消さずに伏せる。 */
const UNPUBLISH = ["the-moonwalkers-london", "prehistoric-planet-london"];

const renderMd = (md: string): string =>
  renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md),
  );

function brokenBold(text: string): boolean {
  return text.includes("**") && renderMd(text).includes("**");
}

async function attractionId(slug: string): Promise<string> {
  const spot = await db.attraction.findUnique({ where: { slug }, select: { id: true } });
  if (!spot) throw new Error(`${slug} が見つからない`);
  return spot.id;
}

async function main() {
  // 書く前に、新しい本文がすべて正しく描画されることを確かめる。
  const newTexts = [
    ...TEXT_FIXES.map((f) => f.replace),
    ...FIELD_FIXES.map((f) => f.to).filter((t): t is string => t !== null),
  ];
  const broken = newTexts.filter(brokenBold);
  if (broken.length > 0) {
    for (const t of broken) console.error("生の ** が残る:", t.slice(0, 80));
    throw new Error("太字が描画されない本文がある。直してから流すこと。");
  }

  let changed = 0;

  for (const fix of TEXT_FIXES) {
    const spotId = await attractionId(fix.slug);
    const row =
      fix.table === "story"
        ? await db.attractionStory.findUnique({ where: { id: fix.id } })
        : await db.attractionVisitStep.findUnique({ where: { id: fix.id } });
    if (!row || row.attractionId !== spotId) {
      throw new Error(`${fix.slug} の ${fix.table}#${fix.id} が見つからない`);
    }
    const current = (row as Record<string, unknown>)[fix.field] as string | null;
    if (current === null) throw new Error(`${fix.table}#${fix.id}.${fix.field} が空`);

    let next: string;
    if (current.includes(fix.find)) {
      next = fix.whole ? fix.replace : current.replace(fix.find, fix.replace);
    } else if (current.includes(fix.replace)) {
      console.log(`[済] ${fix.slug} ${fix.table}#${fix.id}.${fix.field}`);
      continue;
    } else {
      console.warn(`[飛ばす] ${fix.slug} ${fix.table}#${fix.id}.${fix.field} — 置換前の文が見つからない`);
      continue;
    }

    console.log(`\n[${fix.slug}] ${fix.table}#${fix.id}.${fix.field}`);
    console.log("  before:", JSON.stringify(current));
    console.log("  after: ", JSON.stringify(next));
    changed++;
    if (apply) {
      if (fix.table === "story") {
        await db.attractionStory.update({
          where: { id: fix.id },
          data: { [fix.field]: next } as Prisma.AttractionStoryUpdateInput,
        });
      } else {
        await db.attractionVisitStep.update({
          where: { id: fix.id },
          data: { [fix.field]: next } as Prisma.AttractionVisitStepUpdateInput,
        });
      }
    }
  }

  for (const fix of FIELD_FIXES) {
    const spot = await db.attraction.findUnique({
      where: { slug: fix.slug },
      select: { id: true, openingHours: true, closedNote: true, summary: true },
    });
    if (!spot) throw new Error(`${fix.slug} が見つからない`);
    const current = spot[fix.field];
    if (current === fix.to) {
      console.log(`[済] ${fix.slug}.${fix.field}`);
      continue;
    }
    if (current !== fix.from) {
      console.warn(`[飛ばす] ${fix.slug}.${fix.field} — いまの値が想定と違う: ${JSON.stringify(current)}`);
      continue;
    }
    console.log(`\n[${fix.slug}] ${fix.field}`);
    console.log("  before:", JSON.stringify(current));
    console.log("  after: ", JSON.stringify(fix.to));
    changed++;
    if (apply) {
      await db.attraction.update({
        where: { id: spot.id },
        data: { [fix.field]: fix.to } as Prisma.AttractionUpdateInput,
      });
    }
  }

  for (const slug of UNPUBLISH) {
    const spot = await db.attraction.findUnique({
      where: { slug },
      select: { id: true, isPublished: true },
    });
    if (!spot) throw new Error(`${slug} が見つからない`);
    if (!spot.isPublished) {
      console.log(`[済] ${slug} は非公開`);
      continue;
    }
    console.log(`\n[${slug}] isPublished: true → false`);
    changed++;
    if (apply) {
      await db.attraction.update({ where: { id: spot.id }, data: { isPublished: false } });
    }
  }

  console.log(
    apply ? `\n${changed}件を反映しました。` : `\n${changed}件(dry run。--apply で反映する)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
