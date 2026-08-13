/**
 * recommendLevel(おすすめ度★1〜5)の全面的な付け直し。
 *
 *   npx tsx scripts/rerate-attractions.ts           # 差分を表示するだけ
 *   npx tsx scripts/rerate-attractions.ts --apply   # DBへ反映
 *
 * ------------------------------------------------------------------
 * 基準：「初めてのロンドン旅行者にとっての優先度」
 * ------------------------------------------------------------------
 * 体験の質でも知名度でもなく、"限られた日数で何を優先すべきか" で付ける。
 * 読者の大半は初めて来る人で、★は「行くかどうか」の判断に使われるため。
 *
 *   ★5 …… 初回で外すと後悔する定番。10〜12件に絞る。
 *   ★4 …… 3〜4日あれば入れたい。2回目なら確実に行く価値。
 *   ★3 …… 興味が合えば。専門博物館・スタジアム・体験型。
 *   ★2 …… ニッチ。目的がある人向け。郊外・小規模館。
 *   ★1 …… リピーター/在住者向け。初回旅行者にはまず勧めない。
 *
 * 付け直しの前は★5が26件(19%)あり、「★5です」がほぼ情報になっていなかった。
 * ★5を絞ることで星に意味を戻す。
 *
 * 判断の指針:
 * - 期間限定・季節限定は上限★4。訪問時期が合う読者が限られるうえ、
 *   毎年の開催可否に左右されるものを常設の定番と同列に置けない。
 * - パス類(ロンドンパス等)は施設ではなく買い方の選択肢なので上限★3。
 * - 有名でも入場体験が薄いもの(外から見るだけの橋・記念碑)は上げない。
 *
 * ★5は utils/sightseeing.ts の掲載プールに直結しているため、
 * ここを変えるとトップページの露出も変わる。
 */

import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");

/**
 * slug → [新しい★, 理由]
 * 理由は後から見直すときのために必ず書く。
 */
const RATINGS: Record<string, [number, string]> = {
  /* ================= ★5：初回で外せない定番（11件） ================= */
  "british-museum-london": [5, "無料で世界史を一望できる。ロンドン最多訪問数"],
  "tower-of-london": [5, "世界遺産。クラウンジュエルと1000年の歴史"],
  "westminster-abbey": [5, "世界遺産。戴冠式と王室の墓所。初回の定番を★4に置いていたのは不整合"],
  "st-pauls-cathedral": [5, "ドームとロンドンの象徴。上まで登れる"],
  "buckingham-palace": [5, "王室の公邸。ロンドンの象徴"],
  "changing-the-guard-buckingham-palace": [5, "無料で見られる象徴的な儀式"],
  "london-eye": [5, "街の全体像を最初に掴める。初回向きの筆頭"],
  "national-gallery-london": [5, "無料。ゴッホ・フェルメールら西洋絵画の主要作"],
  "big-ben": [5, "ロンドンで最も知られた景観。周辺に見どころが集中"],
  "london-tower-bridge": [5, "ロンドンの象徴。ロンドン塔とセットで回れる"],
  "natural-history-museum": [5, "無料。建物自体が見もので子ども連れにも強い"],

  /* ================= ★4：日数があれば入れたい ================= */
  "windsor-castle": [4, "現役の王室居城だが郊外で半日仕事。mustSee だが初回優先度は★5の下"],
  "hampton-court-palace": [4, "ヘンリー8世の宮殿。郊外のため初回は後回しになりやすい"],
  "kensington-palace": [4, "王室ゆかりだが規模は中程度。★5からは下げる"],
  "tate-modern": [4, "無料。近現代美術の主要館。ミレニアム・ブリッジと繋がる"],
  "churchill-war-rooms": [4, "地下司令部がそのまま残る。★3では低すぎた"],
  "kew-gardens-london": [4, "世界遺産の植物園。郊外かつ滞在に時間が要る"],
  "royal-observatory-greenwich": [4, "本初子午線。グリニッジ観光の核だが中心部から離れる"],
  "old-royal-naval-college": [4, "天井画が圧巻。グリニッジとセットで"],
  "science-museum": [4, "無料。子ども連れに強い"],
  "warner-bros-studio-tour-harry-potter": [4, "日本人読者の需要が非常に高い。要事前予約・郊外のため★5ではないが★3は低すぎた"],
  "the-view-from-the-shard": [4, "西欧最高層の展望。ロンドン・アイと役割が重なる"],
  "sky-garden-london": [4, "無料の展望台。要予約。★5からは下げる"],
  "houses-of-parliament-self-guided-audio-tour": [4, "内部見学は貴重だが開催日が限られる"],
  "imperial-war-museum": [4, "無料。近現代史の主要館"],
  "london-transport-museum": [4, "地下鉄の歴史。子ども連れに強い"],
  "tate-britain": [4, "無料。ターナーとラファエル前派"],
  "harrods-london": [4, "老舗百貨店。買わなくても館内が見もの。★5からは下げる"],
  "camden-lock-market": [4, "個性的なマーケット。若い層に人気。★5からは下げる"],
  "shakespeares-globe-guided-tour": [4, "復元されたグローブ座。英文学好きに"],
  "madame-tussauds-london": [4, "知名度が高く写真需要も大きい"],
  "royal-mews": [4, "黄金の馬車。バッキンガム宮殿とセット"],
  "hyde-park-london": [4, "無料。中心部の大公園"],
  "abbey-road-beatles": [4, "ビートルズ好きには外せないが横断歩道のみ。★5からは下げる"],
  "battersea-power-station": [4, "再生された発電所。建築と買い物。★5からは下げる"],
  "kings-gallery-buckingham-palace": [4, "王室コレクションの企画展。★5からは下げる"],
  "columbia-road-flower-market": [4, "日曜のみ開催。雰囲気は随一"],

  /* 現状★5だが、初回旅行者の優先度としては上位ではないもの */
  "chimney-lift-battersea-power-station": [3, "煙突の展望リフト。別料金の体験で滞在は短い。★5は過大だった"],
  "serpentine-galleries": [3, "無料の現代アート。企画展次第で内容が変わる。★5は過大だった"],

  /* ================= ★3：興味が合えば ================= */
  "royal-academy-of-arts": [3, "企画展中心。会期により内容が大きく変わる"],
  "royal-ballet-opera-london": [3, "公演を観るなら。ツアーのみだと専門的"],
  "st-jamess-palace": [3, "内部非公開。外観のみ"],
  "household-cavalry-museum": [3, "小規模。衛兵交代式のついでに"],
  "parliament-square": [3, "広場。周辺のついでに見る場所"],
  "the-fourth-plinth-trafalgar-square": [3, "現代アートの企画。ナショナル・ギャラリーのついで"],
  "the-charterhouse-london": [3, "中世の施設。歴史好き向け"],
  "arcelormittal-orbit-zip-world-london": [3, "展望とスライダー。目的がある人向け"],
  "20-fenchurch-street-walkie-talkie": [3, "スカイガーデンの建物。展望が目的なら重複"],
  "frameless-london": [3, "没入型デジタルアート。好みが分かれる"],
  "arsenal-emirates-stadium-tour": [3, "サッカーファン向け。ファンには★5級"],
  "wembley-stadium-tour": [3, "サッカーファン向け"],
  "tottenham-hotspur-stadium-tour": [3, "サッカーファン向け"],
  "chelsea-stamford-bridge-tour": [3, "サッカーファン向け"],
  "london-stadium-tour": [3, "サッカーファン向け"],
  "the-dare-skywalk-tottenham-hotspur-stadium": [3, "スタジアム上の絶叫系。★5は明らかに過大だった"],
  "sir-john-soanes-museum": [3, "無料。建築家の自邸。玄人好み"],
  "london-zoo": [3, "子ども連れ向け。入園料は高め"],
  "sea-life-london-aquarium": [3, "子ども連れ向け"],
  "shreks-adventure-london": [3, "子ども連れ向け"],
  "paddington-bear-experience": [3, "日本でも知名度あり。子ども連れに"],
  "jurassic-world-experience-london": [3, "期間限定の体験型"],
  "legoland-windsor": [3, "郊外。子ども連れなら1日仕事"],
  "young-va-bethnal-green": [3, "無料。子ども向けV&A"],
  "monument-to-the-great-fire-of-london": [3, "ロンドン大火の記念塔。階段で上れる"],
  "millennium-bridge": [3, "テート・モダンとセント・ポールを繋ぐ橋。通り道"],
  "the-gherkin-30-st-mary-axe": [3, "外観のみ。内部は基本非公開"],
  "leadenhall-market-london": [3, "ハリポタのロケ地としても知られる"],
  "harry-potter-shop-platform-934": [3, "撮影スポットと物販。滞在は短い。★4からは下げる"],
  "bicester-village": [3, "アウトレット。郊外で半日仕事"],
  "hop-on-hop-off-bus-tour-london": [3, "移動手段兼観光。初回には便利"],
  "the-ghost-bus-tours": [3, "英語のツアー。言語の壁がある。★4からは下げる"],
  "kenwood-house-hampstead": [3, "無料。フェルメールあり。郊外"],
  "queens-house-greenwich": [3, "無料。グリニッジのついでに"],
  "clarence-house-london": [3, "夏季のみ公開"],
  "lambeth-palace": [3, "限定公開"],
  "jewel-tower-westminster": [3, "小規模。国会議事堂のついでに"],
  "down-house-charles-darwin": [3, "郊外。ダーウィン好き向け"],
  "spencer-house-london": [3, "日曜のみ。ダイアナ妃の実家筋"],
  "museum-of-brands-london": [3, "パッケージの変遷。テーマが明確"],
  "moco-museum-london": [3, "現代アート。バンクシーなど"],
  "the-clink-prison-museum": [3, "小規模。中世の牢獄"],
  "bbc-television-centre": [3, "見学は限定的"],
  "bt-tower-london": [3, "外観のみ。ホテルへ改装中"],
  "ifs-cloud-cable-car-london": [3, "短い空中散歩。移動手段としても"],
  "f1-drive-london": [3, "シミュレーター体験。目的がある人向け"],
  "peter-harrison-planetarium-greenwich": [3, "グリニッジとセット"],
  "royal-museums-greenwich-day-pass": [3, "グリニッジ周遊のパス"],
  "afternoon-tea-bus-london": [3, "話題性はあるが価格は高め"],
  "gripped-london": [3, "アクティビティ。目的がある人向け"],
  "movie-statue-street-leicester-square": [3, "無料。通りがかりに"],
  "london-bridge-experience-and-tombs": [3, "お化け屋敷系。英語"],
  "the-total-london-experience-tour": [3, "詰め込み型ツアー"],
  "alcotraz-immersive-prison-cocktail-experience": [3, "没入型バー。英語での参加が前提"],
  "the-crystal-maze-live-experience-london": [3, "英国TV番組が元。英語必須"],

  /* ---- 季節・期間限定は上限★4、多くは★3 ---- */
  "hyde-park-winter-wonderland-2025": [4, "冬の風物詩。時期が合えば行く価値。★5からは下げる"],
  "christmas-lights-london-bus-tour-2025": [3, "季節限定のバスツアー"],
  "chelsea-winter-village-2025": [3, "季節限定"],
  "rhs-chelsea-flower-show-2026": [3, "年1回5日間・要事前チケット。★5は過大だった"],
  "nye-london-eye-riverside-rooms": [2, "大晦日のみ。高額"],

  /* ---- パス類は施設ではなく買い方の選択肢 ---- */
  "the-london-pass": [3, "観光パス。施設ではないので★4からは下げる"],
  "merlin-london-attractions-pass": [3, "観光パス"],
  "golden-pass-london": [3, "観光パス"],

  /* ================= ★2：ニッチ ================= */
  "banqueting-house-london": [2, "小規模。ルーベンスの天井画"],
  "mansion-house-london": [2, "限定公開"],
  "osterley-park-and-house": [2, "郊外のカントリーハウス"],
  "fenton-house-hampstead": [2, "郊外の小規模な館"],
  "sutton-house-breakers-yard": [2, "郊外。チューダー朝の住宅"],
  "queen-charlottes-cottage": [2, "キューガーデン内の小屋。限定公開"],
  "crystal-palace-dinosaurs": [2, "無料。19世紀の恐竜像。郊外"],
  "corams-fields": [2, "地域の子ども向け公園"],
  "diana-princess-of-wales-memorial-playground": [2, "子ども向け遊び場"],
  "golders-hill-park-zoo": [2, "無料の小動物園。郊外"],
  "grant-museum-of-zoology": [2, "無料。大学の標本館"],
  "florence-nightingale-museum": [2, "小規模。テーマが明確"],
  "jack-the-ripper-museum": [2, "評価が分かれる。テーマが重い"],
  "paradox-museum-london": [2, "写真映え目的の体験館"],
  "monopoly-lifesized-london": [2, "英語でのゲーム体験"],
  "prehistoric-planet-london": [2, "期間限定の没入体験"],
  "the-moonwalkers-london": [2, "上映体験。英語"],
  "cutty-sark-rig-climb-experience": [2, "帆船のマスト登り。別料金の体験"],
  "kia-oval-cricket-tour": [2, "クリケット好き向け"],
  "fulham-craven-cottage-tour": [2, "サッカーファン向け。規模は小さい"],
  "chessington-world-of-adventures": [2, "郊外の遊園地。1日仕事"],
  "london-dungeon": [2, "英語の演劇型アトラクション。言語の壁"],
  "taylor-swift-afternoon-tea-bus-tour": [2, "テーマが限定的"],
  "barbican-centre": [2, "複合施設。公演目的なら"],
  "barbican-art-gallery": [2, "企画展次第。★1からは上げる"],

  /* ================= ★1：リピーター/在住者向け ================= */
  "emery-walkers-house": [1, "要予約の小さな邸宅。工芸好き向け"],
  "kelmscott-house-william-morris-society": [1, "限定公開。モリス好き向け"],
  "58th-street-london": [1, "夜の飲食体験。観光ではない"],
  "wee-toast-tours": [1, "少人数ツアー。英語"],
  "bat-and-ball-stratford": [1, "遊技場。観光ではない"],
  "ballie-ballerson-london": [1, "ボールプール付きバー。夜遊び"],
  "phantom-peak": [1, "英語の没入型ゲーム。言語の壁が大きい"],
  "the-cauldron": [1, "英語での体験。予約必須"],
};

async function main() {
  const all = await db.attraction.findMany({
    select: { id: true, slug: true, name: true, recommendLevel: true, mustSee: true },
    orderBy: { slug: "asc" },
  });

  const changes: string[] = [];
  const unrated: string[] = [];
  const newDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const a of all) {
    const entry = RATINGS[a.slug];
    if (!entry) {
      unrated.push(`  ${a.slug} (${a.name}) — 現★${a.recommendLevel}`);
      newDist[a.recommendLevel ?? 0] = (newDist[a.recommendLevel ?? 0] ?? 0) + 1;
      continue;
    }

    const [level, reason] = entry;
    newDist[level]++;

    if (a.recommendLevel !== level) {
      const arrow = level > (a.recommendLevel ?? 0) ? "↑" : "↓";
      changes.push(
        `  ${arrow} ★${a.recommendLevel}→★${level}  ${a.name}\n      ${reason}`,
      );
      if (APPLY) {
        await db.attraction.update({
          where: { id: a.id },
          data: { recommendLevel: level },
        });
      }
    }
  }

  // RATINGS に書いたが DB に無い slug を報告する。黙って無視すると、
  // 存在しないスポットの評価がこのファイルに残り続けて誤解を招く。
  const dbSlugs = new Set(all.map((a) => a.slug));
  const ghosts = Object.keys(RATINGS).filter((s) => !dbSlugs.has(s));

  console.log(APPLY ? "=== APPLIED ===" : "=== DRY RUN (書き込みなし) ===");
  console.log(`\n変更: ${changes.length}件 / 全${all.length}件\n`);
  console.log(changes.join("\n"));

  if (ghosts.length) {
    console.log(`\n!!! DBに存在しない slug が ${ghosts.length}件 !!!`);
    ghosts.forEach((s) => console.log(`  ${s}`));
  }

  if (unrated.length) {
    console.log(`\n--- 未設定(現状維持) ${unrated.length}件 ---`);
    console.log(unrated.join("\n"));
  }

  console.log("\n--- 新しい分布 ---");
  [5, 4, 3, 2, 1].forEach((lv) =>
    console.log(`  ★${lv}: ${newDist[lv]}件`),
  );

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
