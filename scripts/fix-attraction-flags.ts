/**
 * mustSee / isFree / isForKids の整理。
 *
 *   npx tsx scripts/fix-attraction-flags.ts           # 差分を表示するだけ
 *   npx tsx scripts/fix-attraction-flags.ts --apply   # DBへ反映
 *
 * ------------------------------------------------------------------
 * 各フラグの定義（ここが唯一の基準。迷ったらここに戻る）
 * ------------------------------------------------------------------
 * mustSee   … recommendLevel === 5 と完全に一致させる。
 *             ★を「初めてのロンドン旅行者への優先度」で付け直した結果、
 *             ★5(11件)と mustSee(11件)がほぼ同じ粒度になり、別々に
 *             持つ意味が無くなった。二重管理は必ずずれるので揃える。
 *
 * isFree    … 入場そのものが無料。館内の別料金体験や、現地までの
 *             交通費は考慮しない(スカイガーデンのウォークイン有料や
 *             ビスター・ヴィレッジの鉄道代は isFree=true のままで正しい)。
 *
 * isForKids … 「子どもが喜ぶ/子ども向けの仕掛けがある」。
 *             体験型展示・動物・遊び場・子ども向けプログラムなど、
 *             子どもが能動的に楽しめる要素があるものに限る。
 *             「連れて行っても問題ない」だけの場所は含めない——それだと
 *             公園やマーケットが軒並み該当して、絞り込みに使えなくなる。
 */

import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");

/* ------------------------------------------------------------------
   isFree の誤り
------------------------------------------------------------------ */

/**
 * 本文に明確な入場料の記載があるのに isFree=true だったもの。
 *
 * チャーチル戦争指令室は本文に「大人：£33.00〜」と書かれている。
 * この誤りは移行スクリプト経由で priceAdult="無料" にも伝播していたため、
 * ページに「料金 無料」と表示されていた。両方直す。
 */
const FREE_FIXES: Record<
  string,
  { isFree: boolean; note: string; priceAdult?: string; priceChild?: string }
> = {
  "churchill-war-rooms": {
    isFree: false,
    note: "本文に「大人：£33.00〜」の記載あり。無料ではない",
    // 正しい金額は本文(チケット情報セクション)に載っている。
    // null にして無記載にするより、本文どおりの値を入れるほうがよい。
    priceAdult: "£33.00〜",
    priceChild: "£16.50〜",
  },
};

/* ------------------------------------------------------------------
   isForKids の見直し
------------------------------------------------------------------ */

/** 子どもが能動的に楽しめる要素があるもの。ここに挙げたものだけ true。 */
const KIDS_TRUE: Record<string, string> = {
  // 体験・展示が子ども向けに作られている
  "natural-history-museum": "恐竜の骨格と体験型展示。子ども連れの定番",
  "science-museum": "触れる展示とインタラクティブ・ギャラリー",
  "young-va-bethnal-green": "子どものための博物館として設計されている",
  "london-transport-museum": "乗り物に乗れる。子ども向けの仕掛けが多い",
  "british-museum-london": "子ども向けトレイルと家族向けプログラムあり",
  "london-zoo": "動物園",
  "sea-life-london-aquarium": "水族館",
  "golders-hill-park-zoo": "無料の小動物園",
  "crystal-palace-dinosaurs": "屋外の恐竜像。無料で見て回れる",
  "grant-museum-of-zoology": "骨格標本。子どもの興味を引きやすい",

  // 遊び場・アトラクション
  "legoland-windsor": "レゴのテーマパーク",
  "chessington-world-of-adventures": "遊園地と動物園",
  "diana-princess-of-wales-memorial-playground": "子ども向け遊び場",
  "corams-fields": "子ども専用の公園(大人は子ども同伴が必要)",
  "shreks-adventure-london": "子ども向けの体験型アトラクション",
  "paddington-bear-experience": "パディントンの体験型展示",
  "jurassic-world-experience-london": "恐竜の没入体験",
  "prehistoric-planet-london": "恐竜の没入体験",
  "london-eye": "観覧車。高所から街を見渡せる",
  "ifs-cloud-cable-car-london": "ロープウェイ。短時間で乗れる",
  "arcelormittal-orbit-zip-world-london": "巨大スライダー",

  // 子どもに人気のテーマ
  "warner-bros-studio-tour-harry-potter": "ハリー・ポッターのセット見学",
  "madame-tussauds-london": "蝋人形。写真を撮って楽しめる",
  "harry-potter-shop-platform-934": "9と3/4番線の撮影スポット",
  "the-cauldron": "魔法のポーション作り体験",
  "monopoly-lifesized-london": "実物大のボードゲーム",
  "paradox-museum-london": "錯覚体験。写真映え",
  "f1-drive-london": "レーシングシミュレーター",
  "peter-harrison-planetarium-greenwich": "プラネタリウム",
  "kew-gardens-london": "子ども向けの樹上遊歩道と遊び場あり",
  "tower-of-london": "甲冑や体験型展示。ビーフィーターの語りも子ども向け",
  "hyde-park-winter-wonderland-2025": "冬の遊園地。観覧車やアイススケート",
  "royal-museums-greenwich-day-pass": "プラネタリウムや帆船を含む周遊パス",
  "cutty-sark-rig-climb-experience": "帆船のマスト登り体験",
};

/**
 * 現状 isForKids=true だが、上の基準に当てはまらないもの。
 * 「連れて行ける」だけで、子ども向けの仕掛けがあるわけではない。
 */
const KIDS_FALSE: Record<string, string> = {
  "columbia-road-flower-market": "花市場。混雑し、子ども向けの要素はない",
  "camden-lock-market": "マーケット。子ども向けの仕掛けはない",
  "battersea-power-station": "商業施設。子ども向けではない",
  "kenwood-house-hampstead": "邸宅と絵画。子ども向けの要素はない",
  "arsenal-emirates-stadium-tour": "スタジアム見学。サッカー好きの子には良いが一般的ではない",
  "chelsea-winter-village-2025": "冬のマーケット。飲食とアイスリンク中心",
  "golden-pass-london": "観光パス。施設ではない",
  "hyde-park-london": "公園。連れて行けるが子ども向けの仕掛けはない",
  "leadenhall-market-london": "市場。通り抜けるだけ",
  "bicester-village": "アウトレット。買い物用",
  "barbican-centre": "複合文化施設",
  "movie-statue-street-leicester-square": "銅像。通りがかりに見る",
  "sky-garden-london": "展望台。子ども向けの要素はない",
  "millennium-bridge": "橋。渡るだけ",

  // 年齢制限があるもの。ここを true にすると、入れない場所へ
  // 子ども連れを案内することになる。本文の記載を根拠に false。
  "ballie-ballerson-london": "本文に「完全18歳以上（写真付きID必須）」の記載あり",
  "gripped-london": "本文に「子ども向けではなく基本的にティーン〜大人向け」の記載あり",
  "bat-and-ball-stratford": "本文に「一部ゲームは年齢制限あり」「深夜帯は大人のみ」の記載あり",
};

async function main() {
  const all = await db.attraction.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      recommendLevel: true,
      mustSee: true,
      isFree: true,
      isForKids: true,
      priceAdult: true,
      priceChild: true,
    },
    orderBy: { slug: "asc" },
  });

  const log: string[] = [];
  const dbSlugs = new Set(all.map((a) => a.slug));

  // 定義ファイルに書いたが DB に無い slug を報告する。
  const ghosts = [
    ...Object.keys(KIDS_TRUE),
    ...Object.keys(KIDS_FALSE),
    ...Object.keys(FREE_FIXES),
  ].filter((s) => !dbSlugs.has(s));

  for (const a of all) {
    const data: Record<string, unknown> = {};

    /* --- mustSee = (★5) --- */
    const shouldMustSee = a.recommendLevel === 5;
    if (a.mustSee !== shouldMustSee) {
      data.mustSee = shouldMustSee;
      log.push(
        `  mustSee  ${a.mustSee} → ${shouldMustSee}  ${a.name} (★${a.recommendLevel})`,
      );
    }

    /* --- isFree の誤り --- */
    const freeFix = FREE_FIXES[a.slug];
    if (freeFix && a.isFree !== freeFix.isFree) {
      data.isFree = freeFix.isFree;
      log.push(`  isFree   ${a.isFree} → ${freeFix.isFree}  ${a.name}\n      ${freeFix.note}`);

      // isFree の誤りは priceAdult/priceChild にも伝播している(移行時に
      // isFree=true なら金額を解析せず「無料」を入れていたため)。
      // 正しい金額が分かっているものは入れ直し、分からなければ null にする。
      if (!freeFix.isFree) {
        if (a.priceAdult === "無料") {
          data.priceAdult = freeFix.priceAdult ?? null;
          log.push(
            `      priceAdult "無料" → ${freeFix.priceAdult ?? "null"}（誤った無料表示を修正）`,
          );
        }
        if (a.priceChild === "無料") {
          data.priceChild = freeFix.priceChild ?? null;
          log.push(`      priceChild "無料" → ${freeFix.priceChild ?? "null"}`);
        }
      }
    }

    /* --- isForKids --- */
    const kidsTrue = a.slug in KIDS_TRUE;
    const kidsFalse = a.slug in KIDS_FALSE;
    if (kidsTrue || kidsFalse) {
      const should = kidsTrue;
      if (a.isForKids !== should) {
        data.isForKids = should;
        const note = kidsTrue ? KIDS_TRUE[a.slug] : KIDS_FALSE[a.slug];
        log.push(`  kids     ${a.isForKids} → ${should}  ${a.name}\n      ${note}`);
      }
    } else if (a.isForKids) {
      // どちらのリストにも無いのに true のもの。基準に沿って false にする。
      data.isForKids = false;
      log.push(`  kids     true → false  ${a.name}\n      基準(子ども向けの仕掛けがある)に該当せず`);
    }

    if (Object.keys(data).length && APPLY) {
      await db.attraction.update({ where: { id: a.id }, data });
    }
  }

  console.log(APPLY ? "=== APPLIED ===" : "=== DRY RUN (書き込みなし) ===");
  console.log(`\n変更 ${log.length}行\n`);
  console.log(log.join("\n"));

  if (ghosts.length) {
    console.log(`\n!!! DBに存在しない slug ${ghosts.length}件 !!!`);
    ghosts.forEach((s) => console.log(`  ${s}`));
  }

  // 反映後(dry-runなら反映前)の集計
  const after = await db.attraction.findMany({
    select: { mustSee: true, isFree: true, isForKids: true, recommendLevel: true },
  });
  console.log("\n--- 集計 ---");
  console.log(`  mustSee  : ${after.filter((a) => a.mustSee).length}件`);
  console.log(`  ★5       : ${after.filter((a) => a.recommendLevel === 5).length}件`);
  console.log(`  isFree   : ${after.filter((a) => a.isFree).length}件`);
  console.log(`  isForKids: ${after.filter((a) => a.isForKids).length}件`);

  if (!APPLY) console.log("\n反映するには --apply を付けて再実行してください。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
