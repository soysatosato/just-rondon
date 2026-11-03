/**
 * 2026-11 の観光スポットページの見直しで見つかった、事実の誤りと古い値を直す。
 *
 *   npx tsx scripts/fix-spot-facts-2026-11.ts           # 差分を表示(書かない)
 *   npx tsx scripts/fix-spot-facts-2026-11.ts --apply   # DBへ反映
 *
 * 2026-11-04 に各公式で確かめた(出典は lib/sightseeing/practical の各ファイル):
 *
 *   - ウェストミンスター寺院: 開館は平日 9:30〜16:30・土 9:00〜16:00(最終入場は
 *     閉館の1時間前)。DB の「9:30〜15:30」は最終入場の時刻を閉館としていた。
 *   - バッキンガム宮殿: 2027年の夏の公開は 7/8〜9/26 と発表済み(RCT)。
 *   - クラレンス・ハウス: RCT は「現在は見学を受け付けていない」。ページは
 *     「毎年8月に公開・10:00〜16:30・£10.30」と案内していた。
 *   - ビッグ・ベン: 種類を「外から見る名所」にしたので、時間の欄は外観の話にする。
 *     内部見学の発売日は lib/sightseeing/practical/content/big-ben.ts が持つ。
 *   - チャーチル戦争指令室: 大人 £34、2026年4月〜2027年3月は金・土が9:00開館。
 *   - マダム・タッソー: オンラインの最安が大人 £27〜・子ども £24〜。
 *   - キューガーデン: 11〜1月のオフピークのオンライン券が大人 £17。
 *   - ウィンザー城: 大人の前売りが £32(当日 £36)。
 *   - レドンホール・マーケット: 最寄駅は Monument(徒歩4分、公式)。週末も飲食店と
 *     パブは開いている(公式)のに「週末は無人」と書いていた。ハリー・ポッターの
 *     撮影は「ダイアゴン横丁の外観」ではなく「漏れ鍋」へ向かう場面(同じページの
 *     豆知識と食い違っていた)。歩き方のローマの節は歴史の節とほぼ同文だった。
 *   - 最寄駅の誤り・空欄: TfL の Journey Planner の徒歩経路(lib/tfl/nearest-station)
 *     と公式で確かめた。「駅」「目的地によって駅」「🚆 最寄駅」「出発駅」のような
 *     値は、ページの早わかりにそのまま出ていた。
 *   - ビスター・ヴィレッジ: 所要時間の「46分」はロンドン(メリルボーン駅)からの
 *     電車の時間だった(公式)。所要時間は確かめられないので空にする。
 *
 * 値の直しは from(いまの値)で守る。いまの値が from と違えば、別の作業で
 * 直された可能性があるので触らない。本文の置換は find で守り、置換後の文が
 * 既にあれば適用済みとして飛ばす(二度流しても同じ結果になる)。
 * 新しい本文は react-markdown で描いて、生の ** が残らないことを確かめてから書く(CLAUDE.md)。
 */

import "dotenv/config";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

type FieldName =
  | "openingHours"
  | "closedNote"
  | "summary"
  | "tagline"
  | "nearestStation"
  | "priceAdult"
  | "priceChild"
  | "durationText";

type FieldFix = {
  slug: string;
  field: FieldName;
  /** いまの値。違っていたら手で直された可能性があるので触らない。 */
  from: string | null;
  to: string | null;
};

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

const FIELD_FIXES: FieldFix[] = [
  // --- 開館時間・公開期間
  {
    slug: "westminster-abbey",
    field: "openingHours",
    from: "9:30〜15:30",
    to: "月〜金 9:30〜16:30 / 土 9:00〜16:00(最終入場は閉館の1時間前)",
  },
  {
    slug: "buckingham-palace",
    field: "openingHours",
    from: "夏季のみ公開（2026年は7月9日〜9月27日で終了。2027年の日程は未発表）",
    to: "夏季のみ公開(2027年は7月8日〜9月26日)",
  },
  {
    slug: "big-ben",
    field: "openingHours",
    from: "ツアーのみ (第2水曜10:00に3か月先を発売)",
    to: "外観はいつでも見られる(内部はツアーのみ)",
  },
  {
    slug: "churchill-war-rooms",
    field: "openingHours",
    from: "9:30〜18:00 (最終入場17:00)",
    to: "9:30〜18:00(金・土は9:00から。最終入場17:00)",
  },
  {
    slug: "clarence-house-london",
    field: "openingHours",
    from: "10:00〜16:30",
    to: "現在は見学を受け付けていない(2026年11月時点)",
  },

  // --- 料金
  { slug: "clarence-house-london", field: "priceAdult", from: "£10.30", to: null },
  { slug: "clarence-house-london", field: "priceChild", from: "£6.20", to: null },
  { slug: "churchill-war-rooms", field: "priceAdult", from: "£33.00〜", to: "£34〜" },
  { slug: "madame-tussauds-london", field: "priceAdult", from: "£29〜", to: "£27〜" },
  { slug: "madame-tussauds-london", field: "priceChild", from: "£26〜", to: "£24〜" },
  { slug: "kew-gardens-london", field: "priceAdult", from: "£16〜", to: "£17〜" },
  { slug: "windsor-castle", field: "priceAdult", from: "£31〜", to: "£32〜" },

  // --- 最寄駅
  {
    slug: "leadenhall-market-london",
    field: "nearestStation",
    from: "リバプール・ストリート駅",
    to: "Monument駅 徒歩4分",
  },
  { slug: "harrods-london", field: "nearestStation", from: "Victoria駅 徒歩26分", to: "Knightsbridge駅 徒歩1分" },
  {
    slug: "hyde-park-london",
    field: "nearestStation",
    from: "目的地によって駅",
    to: "Hyde Park Corner駅・Marble Arch駅ほか(入口による)",
  },
  {
    slug: "harry-potter-shop-platform-934",
    field: "nearestStation",
    from: "ショップはキングス・クロス駅",
    to: "King's Cross St Pancras駅(キングス・クロス駅の構内)",
  },
  { slug: "bicester-village", field: "nearestStation", from: "出発駅", to: "Bicester Village駅(敷地の隣)" },
  { slug: "london-stadium-tour", field: "nearestStation", from: "🚆 最寄駅", to: "Pudding Mill Lane駅 徒歩8分" },
  { slug: "chessington-world-of-adventures", field: "nearestStation", from: "駅", to: "Chessington South駅 徒歩13分" },
  {
    slug: "queen-charlottes-cottage",
    field: "nearestStation",
    from: "駅",
    to: "Kew Gardens駅(キューガーデンの園内)",
  },
  // 郊外で TfL の半径に入らず、確かめられなかった。誤った「駅」を出すより空にする。
  { slug: "legoland-windsor", field: "nearestStation", from: "駅", to: null },
  { slug: "royal-mews", field: "nearestStation", from: "Victoria Coach Station 徒歩10分", to: "Victoria駅 徒歩4分" },
  { slug: "fenton-house-hampstead", field: "nearestStation", from: null, to: "Hampstead駅 徒歩6分" },
  { slug: "chelsea-stamford-bridge-tour", field: "nearestStation", from: null, to: "Fulham Broadway駅 徒歩8分" },
  { slug: "chelsea-winter-village", field: "nearestStation", from: null, to: "Sloane Square駅 徒歩9分" },
  { slug: "jack-the-ripper-museum", field: "nearestStation", from: null, to: "Tower Gateway駅 徒歩8分" },

  // --- 所要時間
  { slug: "bicester-village", field: "durationText", from: "46分", to: null },

  // --- 紹介文
  {
    slug: "leadenhall-market-london",
    field: "summary",
    from: "レドンホール・マーケットは14世紀から続く市場で、いまの鉄骨とガラスの屋根は19世紀にホレス・ジョーンズが設計した。宝飾店や衣料品店、ワインバー、レストラン、カフェが入り、映画『ハリー・ポッターと賢者の石』のダイアゴン横丁のロケ地としても知られる。",
    to: "レドンホール・マーケットは14世紀から続く市場で、いまの鉄骨とガラスの屋根は19世紀にホレス・ジョーンズが設計した。宝飾店や衣料品店、ワインバー、レストラン、カフェが入る。映画『ハリー・ポッターと賢者の石』では、ハリーとハグリッドが「漏れ鍋」へ向かう場面がこの一帯で撮られた。",
  },
  {
    slug: "clarence-house-london",
    field: "summary",
    from: "クラレンス・ハウスは、ロンドン中心部セント・ジェームズ地区に位置する王室の公式邸宅のひとつです。1825〜1827年に建築家ジョン・ナッシュによって建てられ、もともとはジョージ3世の三男で後に国王ウィリアム4世となるクラレンス公のための邸宅でした。長年にわたり王室メンバーの住居として使われ、特にエリザベス王太后が約50年間暮らしたことで知られています。現在はチャールズ3世国王とカミラ王妃の公邸であり、毎年8月のみ、事前予約制のガイドツアーで一般公開されます。",
    to: "クラレンス・ハウスは、ロンドン中心部セント・ジェームズ地区に位置する王室の公式邸宅のひとつです。1825〜1827年に建築家ジョン・ナッシュによって建てられ、もともとはジョージ3世の三男で後に国王ウィリアム4世となるクラレンス公のための邸宅でした。長年にわたり王室メンバーの住居として使われ、特にエリザベス王太后が約50年間暮らしたことで知られています。現在はチャールズ3世国王とカミラ王妃の公邸です。以前は8月に限ってガイドツアーで公開していましたが、2026年11月時点では見学を受け付けていません。",
  },
  {
    slug: "clarence-house-london",
    field: "tagline",
    from: "国王が暮らす、気品あふれるロイヤル・レジデンス",
    to: "国王チャールズ3世のロンドンの住まい",
  },
];

const TEXT_FIXES: TextFix[] = [
  // --- レドンホール・マーケット
  {
    slug: "leadenhall-market-london",
    table: "visit",
    id: 4336,
    field: "title",
    find: "曜日を間違えると誰もいない",
    replace: "平日と週末で顔が変わる",
    whole: true,
  },
  {
    slug: "leadenhall-market-london",
    table: "visit",
    id: 4336,
    field: "body",
    find: "週末に行くとシャッターの下りた無人の通路を歩くことになります",
    replace:
      "金融街の中にあり、人が集まるのは平日の昼休みと仕事帰りの夕方です。通路は24時間通れて、週末も飲食店やパブは開いています。2026年は毎月第2土曜の12〜17時に、手作りの品を売るクラフトの市が立ちます。",
    whole: true,
  },
  {
    slug: "leadenhall-market-london",
    table: "visit",
    id: 4338,
    field: "title",
    find: "ダイアゴン横丁として撮られた場所",
    replace: "「漏れ鍋」の入口になった扉",
    whole: true,
  },
  {
    slug: "leadenhall-market-london",
    table: "visit",
    id: 4338,
    field: "body",
    find: "『ハリー・ポッターと賢者の石』で、ダイアゴン横丁の外観として撮影されました。",
    replace:
      "『ハリー・ポッターと賢者の石』で、ハリーとハグリッドが「漏れ鍋」へ向かう場面がこの一帯で撮られました。",
  },
  {
    slug: "leadenhall-market-london",
    table: "visit",
    id: 4339,
    field: "body",
    find: "西暦100年ごろに建て直されたこのバシリカは",
    replace:
      "この一帯はローマ時代のロンディニウムの中心で、地下にフォルム(広場)とバシリカ(公会堂)の遺構があります。グレースチャーチ・ストリート90番地の地下には、バシリカの柱の基部が保存されています。どれほど大きな建物だったかは、下の「歴史と背景」に書きました。",
    whole: true,
  },
  {
    slug: "leadenhall-market-london",
    table: "story",
    id: 2688,
    field: "body",
    find: "- 週末は多くの店が閉まる。",
    replace:
      "- 1881年の建て替えでジョーンズが基礎を掘った際、下からローマ時代のバシリカの一部が出てきた。市場を作り直そうとして、2,000年前の市場の跡を掘り当てたことになる\n- 『裏切りのサーカス』(Tinker Tailor Soldier Spy)のロケ地でもある",
    whole: true,
  },

  // --- クラレンス・ハウス
  {
    slug: "clarence-house-london",
    table: "visit",
    id: 4513,
    field: "title",
    find: "8月しか入れない",
    replace: "いまは中に入れない",
    whole: true,
  },
  {
    slug: "clarence-house-london",
    table: "visit",
    id: 4513,
    field: "body",
    find: "公開は毎年8月のみ",
    replace:
      "国王が暮らす現役の王室の邸宅で、以前は毎年8月だけ、1時間ほどのガイドツアーで公開していました。2026年11月時点で、公開を担う Royal Collection Trust は見学を受け付けておらず、再開の案内もありません。",
    whole: true,
  },
  {
    slug: "clarence-house-london",
    table: "visit",
    id: 4514,
    field: "body",
    find: "見学できるのは",
    replace: "公開していた時期に見学できたのは",
  },
  {
    slug: "clarence-house-london",
    table: "visit",
    id: 4514,
    field: "body",
    find: "5室です。",
    replace: "5室でした。",
  },
  {
    slug: "clarence-house-london",
    table: "visit",
    id: 4516,
    field: "body",
    find: "宮殿本体は非公開なので、この一帯で中に入れるのはクラレンス・ハウスの8月公開だけ。",
    replace: "宮殿本体も公開していません。",
  },
  {
    slug: "clarence-house-london",
    table: "story",
    id: 2702,
    field: "body",
    find: "公開されるのは夏の限られた期間だけで、これは今も実際に使われている住居だからである。",
    replace:
      "以前の公開が夏の限られた期間だけだったのも、今も実際に使われている住居だからである。2026年11月時点では見学を受け付けていない。",
  },
  {
    slug: "clarence-house-london",
    table: "story",
    id: 2703,
    field: "body",
    find: "公開時期のみ、事前予約のガイドツアーで入場する",
    replace: "以前は8月の公開時期だけ、事前予約のガイドツアーで入れた",
  },
];

/** react-markdown で描いたあとに ** が残るか。CLAUDE.md の太字の確認。 */
function brokenBold(markdown: string): boolean {
  const html = renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, markdown),
  );
  return html.includes("**");
}

const idCache = new Map<string, string>();
async function attractionId(slug: string): Promise<string> {
  const hit = idCache.get(slug);
  if (hit) return hit;
  const row = await db.attraction.findUnique({ where: { slug }, select: { id: true } });
  if (!row) throw new Error(`スポット ${slug} が見つからない`);
  idCache.set(slug, row.id);
  return row.id;
}

async function main() {
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

  for (const fix of FIELD_FIXES) {
    const row = await db.attraction.findUnique({
      where: { slug: fix.slug },
      select: { id: true, [fix.field]: true },
    });
    if (!row) throw new Error(`スポット ${fix.slug} が見つからない`);
    const current = (row as Record<string, unknown>)[fix.field] as string | null;
    if (current === fix.to) {
      console.log(`[済] ${fix.slug}.${fix.field}`);
      continue;
    }
    if (current !== fix.from) {
      console.warn(
        `[飛ばす] ${fix.slug}.${fix.field} — いまの値が想定と違う: ${JSON.stringify(current)}`,
      );
      continue;
    }
    console.log(`\n[${fix.slug}] ${fix.field}`);
    console.log("  before:", JSON.stringify(current));
    console.log("  after: ", JSON.stringify(fix.to));
    changed++;
    if (apply) {
      await db.attraction.update({
        where: { slug: fix.slug },
        data: { [fix.field]: fix.to },
      });
    }
  }

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
        await db.attractionStory.update({ where: { id: fix.id }, data: { [fix.field]: next } });
      } else {
        await db.attractionVisitStep.update({ where: { id: fix.id }, data: { [fix.field]: next } });
      }
    }
  }

  console.log(
    `\n${changed} 件${apply ? "を反映した" : "の差分(--apply で反映)"}。`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
