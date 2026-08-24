/**
 * 観光スポットのファクトバー(priceAdult / durationText / nearestStation /
 * openingHours)の欠けを埋める。
 *
 *   npx tsx scripts/fill-attraction-facts-2026-08.ts                  # ドライラン
 *   npx tsx scripts/fill-attraction-facts-2026-08.ts --apply          # 投入
 *   npx tsx scripts/fill-attraction-facts-2026-08.ts --apply --slug=big-ben
 *
 * 冪等。指定した項目だけを上書きし、ここに書いていない項目には触らない。
 *
 * ------------------------------------------------------------------
 * なぜ作ったか
 * ------------------------------------------------------------------
 * 監査時点で、公開中144件のうち95件が4項目のどれかを欠いていた。
 * 内訳は hours=84・duration=25・station=22・price=9 で、開館時間が突出している。
 * しかも欠けが上位ページに集中していた——閲覧トップの big-ben が3項目欠け、
 * 推薦度5の london-tower-bridge は4項目すべて空だった。
 *
 * AttractionFactBar は埋まっている項目だけを描くので、欠けていても
 * 画面は壊れない。ただし読者から見ると「料金が書いていないページ」に
 * なり、行くかどうかを判断できないまま本文だけを読まされることになる。
 *
 * ------------------------------------------------------------------
 * 方針
 * ------------------------------------------------------------------
 * - 推薦度5と4を優先し、そこから下げる。全95件を一度に埋めない。
 * - 公式サイトで確認できたものだけを入れる。裏が取れないものは空のままにする。
 *   「誤った料金を出すくらいならその行を出さない」という既存の方針
 *   (schema.prisma の Attraction コメント)をそのまま踏襲する。
 * - 料金は変動するので幅を持たせて書く(「£15.80〜」)。割引期間中の
 *   安い値だけを書かない——期間が終わると嘘になる。
 * - 開館時間は代表値。季節変動があるものは注記を添える。
 * - 無料のスポットは「無料」と明示する。空欄と「無料」は意味が違う。
 *
 * ★ nearestStation の表記は「駅名 徒歩N分」に揃える。既存データは
 *   「Holborn」のような英名だけのものと「タワーヒル駅 徒歩5分」が
 *   混在しているが、新しく入れるぶんは後者の形にする。読者が必要と
 *   しているのは駅名そのものより「そこから歩けるのか」だから。
 *
 * ------------------------------------------------------------------
 * 裏取り(2026-08-24 時点)
 * ------------------------------------------------------------------
 * - ビッグ・ベン(エリザベス・タワー): 2026年8月1日以降のツアーは
 *   大人£55・11〜17歳£35。所要90分。334段を上る。11歳以上のみ。
 *   毎月第2水曜10:00に3か月先の分を発売。英国居住者は議員経由で無料枠あり。
 *   https://www.parliament.uk/visiting/visiting-and-tours/big-ben-tour/
 * - タワーブリッジ: 9:30〜18:00(最終入場17:00)。2026年9月1日までは
 *   割引期間で大人£15.80・子ども£7.90(通常は£18.00/£9.00)。
 *   最寄りは Tower Hill(District/Circle)と London Bridge。
 *   https://www.towerbridge.org.uk/whats-on/entry-to-tower-bridge
 * - ロンドン・アイ: 2026年8月31日までは10:00〜20:30、9月以降は
 *   おおむね11:00〜18:00。搭乗は30分だが、保安検査と待ちを含めて
 *   90分見ておく。最寄りは Waterloo 徒歩5分。
 *   https://www.londoneye.com/plan-your-visit/before-you-visit/opening-hours/
 * - バッキンガム宮殿: サマーオープニング2026は7/9〜9/27。8/31までは
 *   毎日9:30〜19:30、9/1〜9/27は木〜月のみ9:30〜18:30。
 *   Green Park と Victoria がどちらも徒歩10分ほど。
 *   https://www.rct.uk/visit/buckingham-palace
 * - 衛兵交代式: 所要約45分(11:00開始)。開催日は固定ではないため
 *   公式カレンダーを見るよう促す。曜日を断定しない。
 *   https://www.householddivision.org.uk/changing-the-guard-calendar
 * - ナショナル・ギャラリー: 10:00〜18:00、金曜は21:00まで。無料。
 *   全館を見るなら3〜4時間。
 *   https://www.nationalgallery.org.uk/visiting
 * - 自然史博物館: 10:00〜17:50(最終入場17:30)。無料。平均滞在3〜4時間。
 *   https://www.nhm.ac.uk/visit.html
 * - ザ・シャード: 夏はおおむね10:00〜22:00、冬は11:00〜19:00。
 *   最終入場は閉場1時間前。London Bridge 直結。
 *   https://www.theviewfromtheshard.com/opening-times/
 * - スカイガーデン: 平日10:00〜18:00、週末11:00〜21:00。無料だが
 *   時間指定の事前予約が要る。入場から1時間が持ち時間。Monument 徒歩3分。
 *   https://skygarden.london/booking/
 * - ワーナー・ブラザース スタジオツアー: 最寄りは Watford Junction で、
 *   そこから無料シャトルバスで約15分。ロンドン・ユーストンから
 *   Watford Junction まで列車で13〜19分。
 *   https://www.wbstudiotour.co.uk/getting-here/
 * - ウィンザー城: Windsor & Eton Central 徒歩2〜3分、
 *   Windsor & Eton Riverside 徒歩5〜10分。
 *   https://www.southwesternrailway.com/sights-and-attractions/landmarks/trains-to-windsor-castle
 * - テート・モダン: 月〜木・日 10:00〜18:00、金土は21:00まで。無料。
 *   テート・ブリテン: 毎日10:00〜18:00(最終入場17:30)。無料。所要2時間。
 *   https://www.tate.org.uk/visit/tate-modern
 *   https://www.tate.org.uk/visit/tate-britain
 * - ロンドン交通博物館: 10:00〜18:00(最終入場17:00)。
 *   https://www.ltmuseum.co.uk/visit/opening-times
 * - 旧王立海軍学校(ペインテッド・ホール): 展示は毎日10:00〜17:00、
 *   敷地は8:00〜23:00。Cutty Sark DLR 徒歩3分。
 *   https://ornc.org/plan-a-visit/opening-times/
 *   https://ornc.org/plan-a-visit/getting-here/
 * - シェイクスピアズ・グローブのガイドツアー: 所要約50分。
 *   月9:30〜16:30、火〜土9:30〜12:00、日9:30〜11:00の30分おき。
 *   公演期間は午後のツアーが減るため公式で確認が要る。
 *   https://www.shakespearesglobe.com/visit/opening-hours/
 * - ハロッズ: 月〜土10:00〜21:00、日11:30〜18:00(日は11:30〜12:00が
 *   閲覧のみで会計不可)。
 *   https://www.harrods.com/en-gb/c/plan-your-visit
 * - カムデン・マーケット: 毎日10:00〜18:00(祝日含む)。店舗により異なる。
 *   https://camdenmarket.com/faqs/when-are-you-open
 * - コロンビア・ロード・フラワー・マーケット: 日曜のみ8:00〜15:00頃。
 *   https://columbiaroadmarket.co.uk/
 */

import "dotenv/config";
import db from "../utils/db";

type Facts = {
  priceAdult?: string;
  priceChild?: string;
  durationText?: string;
  nearestStation?: string;
  openingHours?: string;
};

/**
 * slug ごとに埋める項目。ここに書いた項目だけを上書きする。
 * 裏が取れなかった項目は書かない(空のまま残す)。
 */
export const FACTS: Record<string, Facts> = {
  // ---- 推薦度5 ----
  "big-ben": {
    priceAdult: "£55",
    priceChild: "£35 (11〜17歳)",
    durationText: "90分",
    openingHours: "ツアーのみ (第2水曜10:00に3か月先を発売)",
  },
  "london-tower-bridge": {
    priceAdult: "£15.80〜",
    priceChild: "£7.90〜",
    durationText: "1〜1時間半",
    nearestStation: "Tower Hill 徒歩5分",
    openingHours: "9:30〜18:00 (最終入場17:00)",
  },
  "london-eye": {
    nearestStation: "Waterloo 徒歩5分",
    openingHours: "10:00〜20:30 (時期により変動)",
  },
  "buckingham-palace": {
    nearestStation: "Green Park 徒歩10分",
    openingHours: "夏季公開 9:30〜19:30 (公開日は公式で確認)",
  },
  "changing-the-guard-buckingham-palace": {
    durationText: "45分",
    openingHours: "11:00開始 (開催日は公式カレンダーで確認)",
  },
  "national-gallery-london": {
    durationText: "2〜3時間",
  },
  "natural-history-museum": {
    durationText: "3時間〜",
  },

  // ---- 推薦度4 ----
  "the-view-from-the-shard": {
    openingHours: "10:00〜22:00 (冬季は11:00〜19:00、最終入場は閉場1時間前)",
  },
  "sky-garden-london": {
    durationText: "1時間 (入場から1時間が持ち時間)",
    nearestStation: "Monument 徒歩3分",
    // 既存値は "10:00〜18:00" で平日のぶんしか無かった。週末は11:00〜21:00
    // まで開いており、夕景を目当てに土日の夕方に行く人がこの表記だと
    // 「もう閉まっている」と判断してしまうため、両方を出す形に直す。
    openingHours: "平日 10:00〜18:00 / 土日 11:00〜21:00",
  },
  "warner-bros-studio-tour-harry-potter": {
    nearestStation: "Watford Junction からシャトルバス15分",
  },
  "windsor-castle": {
    nearestStation: "Windsor & Eton Central 徒歩3分",
  },
  "tate-modern": {
    openingHours: "10:00〜18:00 (金土は21:00まで)",
  },
  "tate-britain": {
    durationText: "2時間",
    openingHours: "10:00〜18:00 (最終入場17:30)",
  },
  "london-transport-museum": {
    openingHours: "10:00〜18:00 (最終入場17:00)",
  },
  "old-royal-naval-college": {
    nearestStation: "Cutty Sark 徒歩3分",
    openingHours: "10:00〜17:00 (敷地は8:00〜23:00)",
  },
  "shakespeares-globe-guided-tour": {
    openingHours: "ツアーは9:30〜 30分おき (公演期間は午後が減る)",
  },
  "harrods-london": {
    openingHours: "月〜土 10:00〜21:00 / 日 11:30〜18:00",
  },
  "camden-lock-market": {
    openingHours: "10:00〜18:00 (店舗により異なる)",
  },
  "columbia-road-flower-market": {
    openingHours: "日 8:00〜15:00頃 (日曜のみ)",
  },
  "battersea-power-station": {
    openingHours: "店舗 月〜土 10:00〜20:00 / 日 12:00〜18:00",
  },
  "houses-of-parliament-self-guided-audio-tour": {
    priceAdult: "£31〜 (大人1名につき子ども1名無料)",
    openingHours: "土 9:30〜16:30 ほか平日の一部 (開催日は公式で確認)",
  },
};

/**
 * 埋めないと決めたもの。
 *
 * ここに挙げたものは「調べていない」のではなく「その項目が存在しない」か
 * 「年次の更新が先」なので、空のままにしておく。あとから機械的に
 * 埋めようとする人が同じ調査を繰り返さないために残しておく。
 *
 * - abbey-road-beatles: 公道の横断歩道なので開館時間が存在しない。
 *   スタジオは非公開で、見学できるのは横断歩道だけ。
 * - hyde-park-winter-wonderland-2025 / chelsea-winter-village-2025 /
 *   christmas-lights-london-bus-tour-2025 / rhs-chelsea-flower-show-2026:
 *   年号付きの季節イベント。README-visit-flow.md の方針どおり、
 *   年次情報の更新(update-winter-wonderland-2026.ts など)が先。
 *   古い会期のまま料金だけ入れると読者が混乱する。
 * - the-london-pass / merlin-london-attractions-pass / golden-pass-london /
 *   royal-museums-greenwich-day-pass: 物理的な場所を持たない商品なので
 *   最寄駅と開館時間が存在しない。
 */
export const INTENTIONALLY_EMPTY = [
  "abbey-road-beatles",
  "hyde-park-winter-wonderland-2025",
  "chelsea-winter-village-2025",
  "christmas-lights-london-bus-tour-2025",
  "rhs-chelsea-flower-show-2026",
  "the-london-pass",
  "merlin-london-attractions-pass",
  "golden-pass-london",
  "royal-museums-greenwich-day-pass",
];

const APPLY = process.argv.includes("--apply");
const SLUG_ARG = process.argv.find((a) => a.startsWith("--slug="));

async function main() {
  const slugs = SLUG_ARG ? [SLUG_ARG.split("=")[1]] : Object.keys(FACTS);

  for (const slug of slugs) {
    if (!FACTS[slug]) {
      console.error(`✗ ${slug}: FACTS にありません`);
      process.exitCode = 1;
      return;
    }
  }

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  let filled = 0;
  let overwritten = 0;

  for (const slug of slugs) {
    const a = await db.attraction.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        priceAdult: true,
        priceChild: true,
        durationText: true,
        nearestStation: true,
        openingHours: true,
      },
    });
    if (!a) {
      console.error(`✗ ${slug}: 見つかりません`);
      process.exitCode = 1;
      continue;
    }

    const next = FACTS[slug];
    const lines: string[] = [];
    for (const [key, value] of Object.entries(next)) {
      const before = (a as Record<string, unknown>)[key] as string | null;
      if (before === value) continue;
      // 既に値が入っている項目を書き換えるときは目立たせる。
      // 空欄を埋めるのが本来の目的なので、上書きは意図したものか確認したい。
      if (before) {
        lines.push(`    ${key}: "${before}" → "${value}"  ★上書き`);
        overwritten++;
      } else {
        lines.push(`    ${key}: (空) → "${value}"`);
        filled++;
      }
    }

    if (lines.length === 0) {
      console.log(`${a.name} (${slug})\n    変更なし\n`);
      continue;
    }

    console.log(`${a.name} (${slug})`);
    lines.forEach((l) => console.log(l));

    if (APPLY) {
      await db.attraction.update({ where: { id: a.id }, data: next });
      console.log("    → 更新");
    }
    console.log("");
  }

  console.log(`対象 ${slugs.length}件 / 空欄を埋めた ${filled}項目 / 上書き ${overwritten}項目`);
  if (!APPLY) console.log("\n--apply を付けると投入します。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
