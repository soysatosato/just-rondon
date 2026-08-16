/**
 * 事実が古くなった AttractionSection の記述を直す。
 *
 *   npx tsx scripts/fix-stale-attraction-notes.ts           # 差分を表示するだけ
 *   npx tsx scripts/fix-stale-attraction-notes.ts --apply   # DBへ反映
 *
 * seed-visit-flow.ts の裏取り中に見つかったもの。閉鎖・改修・料金改定は
 * 本文に直接書かれていると古くなったことに気づけないので、見つけたら
 * ここに1件ずつ足して直す。
 *
 * 対象を id で指定しているのは、同じ文言が別のスポットにもある場合に
 * 巻き込みたくないため。id は移動しないので、実行結果が安定する。
 */

import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");

type Fix = {
  sectionId: number;
  /** 何を直すのか。実行ログに出す。 */
  note: string;
  /** 置換前の部分文字列。含まれていなければスキップする(二重適用の防止)。 */
  find: string;
  replace: string;
};

const FIXES: Fix[] = [
  {
    sectionId: 51,
    note:
      "セント・ポール大聖堂: ウィスパリング・ギャラリーは再開済み。" +
      "2019年の事故で閉鎖されていたが、安全用のワイヤーグリルを設置して開いている。" +
      "https://www.stpauls.co.uk/planning-your-visit",
    find: "- **ウィスパリング・ギャラリーは現在閉鎖中**",
    replace:
      "- ドームの3つのギャラリー（ウィスパリング257段・ストーン376段・ゴールデン528段）はいずれも開いています\n" +
      "- ゴールデン・ギャラリーは混雑時に人数制限がかかることがあります",
  },
  {
    sectionId: 607,
    note:
      "ビスター・ヴィレッジ: 旅行者向け免税(VAT Retail Export Scheme)は" +
      "2021年1月1日に廃止され、2026年8月時点で再開していない。" +
      "手荷物で持ち帰る買い物に還付はなく、店から海外へ直送する場合のみ" +
      "購入時に免税となる。「免税手続き対応」と書いたままだと読者が" +
      "還付を前提に予算を組んでしまう。" +
      "https://www.visitlondon.com/traveller-information/essential-information/money/tax-free",
    find:
      "- **タックスリファンド（免税手続き）**対応\n" +
      "- 両替サービス、バレットパーキングなど",
    replace:
      "- 両替サービス、バレットパーキングなど\n" +
      "\n" +
      "#### 免税（VAT還付）について\n" +
      "英国は**2021年1月1日に旅行者向けの免税制度を廃止**しました。" +
      "イングランド・スコットランド・ウェールズで買った品を手荷物で持ち帰っても、" +
      "20%の付加価値税は戻りません。\n" +
      "例外は、店から海外の自宅へ直送してもらう場合のみで、このときは購入時に免税になります。",
  },
  {
    sectionId: 182,
    note:
      "ピーター・ハリソン・プラネタリウム: 改修工事のため閉鎖中で、" +
      "再開は2028年春の見込み。ページ全体が『開いている施設』として" +
      "書かれており、料金・上映時間・年齢制限まで載っているため、" +
      "冒頭で閉鎖を知らせないと読者がグリニッジまで行って入れない。" +
      "代替として国立海事博物館で Astronomers Take Over が実施されている。" +
      "https://www.rmg.co.uk/whats-on/planetarium-shows",
    find:
      "**ピーター・ハリソン・プラネタリウム（Peter Harrison Planetarium）**は、ロイヤル天文台グリニッジ内にあるロンドン唯一のプラネタリウムです。",
    replace:
      "> **【重要】現在は改修工事のため閉鎖中です（2026年8月時点）。**\n" +
      "> 再開は2028年春の見込みです。以下の上映内容・料金・時間は閉鎖前のもので、" +
      "再開時には変更される可能性があります。\n" +
      "> 現在は代替として、国立海事博物館（National Maritime Museum）で" +
      "「Astronomers Take Over」というプラネタリウム体験が行われています。" +
      "訪問前に必ず[公式サイト](https://www.rmg.co.uk/whats-on/planetarium-shows)で最新情報をご確認ください。\n" +
      "\n" +
      "**ピーター・ハリソン・プラネタリウム（Peter Harrison Planetarium）**は、ロイヤル天文台グリニッジ内にあるロンドン唯一のプラネタリウムです。",
  },
  {
    sectionId: 930,
    note:
      "ジュエル・タワー: 開館日は季節で変わる。冬季(1〜3月・11〜12月)は" +
      "土日のみだが、4月〜10月下旬は毎日開いている。本文は冬季の日程だけを" +
      "載せていたため、夏に訪れる読者が『土日しか開いていない』と誤解する。" +
      "https://www.english-heritage.org.uk/visit/places/jewel-tower/",
    find:
      "### 開館日・時間（掲載情報）\n" +
      "- 土曜日：10:00〜16:00\n" +
      "- 日曜日：10:00〜16:00\n" +
      "- 月〜金：休館",
    replace:
      "### 開館日・時間（季節で変わります）\n" +
      "- **4月1日〜10月27日**：毎日 10:00〜17:00\n" +
      "- **10月28日〜11月3日**：毎日 10:00〜16:00\n" +
      "- **11月4日〜12月31日**：土・日のみ 10:00〜16:00\n" +
      "- **1月1日〜3月31日**：土・日のみ 10:00〜16:00\n" +
      "\n" +
      "夏季は毎日開いていますが、冬季は週末だけになります。",
  },
  {
    sectionId: 443,
    note:
      "ジュラシック・ワールド：エクスペリエンスは2026年1月4日で開催終了。" +
      "バタシー発電所NEONでの期間限定公演だったが、ページは現在も" +
      "開催中の施設として料金まで載せている。終了した催しに読者を" +
      "向かわせないよう、冒頭で終了を明示する。" +
      "https://www.ianvisits.co.uk/calendar/jurassic-world-the-experience-419981/",
    find:
      "**ジュラシック・ワールド：エクスペリエンス**は、  \n" +
      "映画『ジュラシック・ワールド』シリーズをベースにした**大迫力の没入型ウォークスルーアトラクション**。",
    replace:
      "> **【重要】この催しは2026年1月4日で終了しました。**\n" +
      "> バタシー発電所のNEONで行われていた期間限定の展示で、現在は開催されていません。\n" +
      "> 以下は開催当時の記録です。同種の没入型展示をお探しの場合は、" +
      "[フレームレス](/sightseeing/frameless-london)や" +
      "[モコ・ミュージアム](/sightseeing/moco-museum-london)をご検討ください。\n" +
      "\n" +
      "**ジュラシック・ワールド：エクスペリエンス**は、  \n" +
      "映画『ジュラシック・ワールド』シリーズをベースにした**大迫力の没入型ウォークスルーアトラクション**でした。",
  },
  {
    sectionId: 718,
    note:
      "ファントム・ピーク: サリー・キューズ(カナダ・ウォーター)の会場は" +
      "2026年2月28日で閉幕し、2026年12月4日にウェストフィールド・ストラトフォード・" +
      "シティで再開する。ページは旧会場を現在地として案内しているため、" +
      "いま行っても何もない。移転の事実と再開日を冒頭に置く。" +
      "https://www.phantompeak.com/stratford/",
    find:
      "### “現実を忘れて没入する町”ファントム・ピークとは？\n" +
      "Phantom Peak は、ロンドン・サリーキューズに登場した  \n" +
      "**オープンワールド型の没入体験タウン**です。",
    replace:
      "> **【重要】会場が移転します（2026年8月時点）。**\n" +
      "> サリー・キューズ（カナダ・ウォーター）の会場は**2026年2月28日で閉幕**しました。\n" +
      "> 新会場は**ウェストフィールド・ストラトフォード・シティ**で、" +
      "**2026年12月4日に開業予定**です。旧会場へ行っても何もありませんのでご注意ください。\n" +
      "> 新会場は旧会場より広く、Old Town・Town Square・Lakeside の3区画で構成される予定です。" +
      "最新情報は[公式サイト](https://www.phantompeak.com/stratford/)でご確認ください。\n" +
      "\n" +
      "### “現実を忘れて没入する町”ファントム・ピークとは？\n" +
      "Phantom Peak は、**オープンワールド型の没入体験タウン**です。",
  },
];

async function main() {
  for (const fix of FIXES) {
    const section = await db.attractionSection.findUnique({
      where: { id: fix.sectionId },
      select: { id: true, title: true, description: true },
    });

    if (!section) {
      console.log(`SKIP id:${fix.sectionId} — セクションが見つかりません`);
      continue;
    }

    const before = section.description ?? "";
    if (!before.includes(fix.find)) {
      console.log(
        `SKIP id:${fix.sectionId} (${section.title}) — 対象の文言なし(適用済みか、本文が変わった)`,
      );
      continue;
    }

    const after = before.replace(fix.find, fix.replace);
    console.log(`\n=== id:${section.id} ${section.title}`);
    console.log(`  ${fix.note}`);
    console.log(`  - ${fix.find}`);
    fix.replace.split("\n").forEach((line) => console.log(`  + ${line}`));

    if (!APPLY) continue;

    await db.attractionSection.update({
      where: { id: section.id },
      data: { description: after },
    });
    console.log("  → 更新しました");
  }

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
