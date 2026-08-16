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
