/**
 * AttractionVisitStep(「着いてからの歩き方」)を投入する。
 *
 *   npx tsx scripts/seed-visit-flow.ts              # 内容を表示するだけ
 *   npx tsx scripts/seed-visit-flow.ts --apply      # DBへ投入
 *
 * ここに書くのは、既存の sections から機械的に作れない情報だけ。
 * 順路・待ち時間・見落としやすいものは、裏を取ったうえで手で書く。
 * 推測で埋めない——「入口を入って左」のような具体は、外れると読者を
 * 実際に迷わせるので、無いページは歩き方セクションごと出さないほうがよい。
 *
 * 出典(2026-08時点):
 * - Yeoman Warder ツアーは30分ごと・所要約60分・当日先着(事前予約不可)、
 *   火〜土の初回10:00、最終15:15。入場料に含まれる。
 *   https://www.hrp.org.uk/tower-of-london/whats-on/yeoman-warder-tours/
 * - クラウンジュエルの行列は11:00前か15:00以降が空く。
 * - ボーチャム塔には囚人が壁に彫った落書きが残る(Imprisonment at the Tower)。
 *   https://www.hrp.org.uk/tower-of-london/whats-on/imprisonment-at-the-tower-exhibition/
 *
 * 料金や開館時間と同じで、この種の運用情報は変わる。増やすときは
 * 必ず公式で現況を確認してから書くこと。
 */

import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");

type Step = {
  kind: "arrival" | "highlight" | "missable" | "tip";
  title: string;
  body: string;
};

const VISIT_FLOWS: Record<string, Step[]> = {
  "tower-of-london": [
    {
      kind: "tip",
      title: "着いたらまずクラウンジュエルへ",
      body: "入場して最初に向かうべきはジュエルハウス。11時を過ぎると団体客が入り始めて行列が一気に伸びるので、開館直後に見てしまうのが一番効率がいい。午後しか行けない場合は15時以降が狙い目です。",
    },
    {
      kind: "highlight",
      title: "クラウンジュエル",
      body: "戴冠式で実際に使われる王冠と宝物が、動く歩道の脇に並びます。立ち止まれないので、見たいものを決めてから乗るのがコツ。2023年のチャールズ3世の戴冠式で使われた品もここにあります。",
    },
    {
      kind: "highlight",
      title: "ビーフィーターのツアー",
      body: "赤と金の制服を着たヨーマン・ウォーダーが案内する約60分のツアー。入場料に含まれていて、30分おきに正門付近から出発します。事前予約はできない当日先着制。処刑や幽霊の話を含む語りが上手く、これ目当てで来る人もいるほどです。",
    },
    {
      kind: "missable",
      title: "ボーチャム塔の落書き",
      body: "見逃されがちですが、ここが塔で最も生々しい場所かもしれません。処刑を待つ囚人が壁に彫り込んだ文字や紋章が、そのまま残っています。レディ・ジェーン・グレイやガイ・フォークスら、名前を知っている人物が実際に閉じ込められていた部屋です。",
    },
    {
      kind: "highlight",
      title: "ホワイトタワー",
      body: "1078年に建てられた中核の建物。中は甲冑コレクションで、ヘンリー8世の巨大な鎧が見どころです。階段が多く上りきると場内を見渡せます。",
    },
    {
      kind: "missable",
      title: "カラスを探す",
      body: "「カラスが塔を去れば王国は滅びる」という言い伝えがあり、いまも王室費で飼われています。芝生や壁の上をうろついていて、ヨーマン・ウォーダーの後ろをついて歩いていることも。餌をくれる相手を知っている賢い鳥です。",
    },
  ],
};

async function main() {
  for (const [slug, steps] of Object.entries(VISIT_FLOWS)) {
    const attraction = await db.attraction.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!attraction) {
      console.log(`SKIP ${slug} — 該当スポットなし`);
      continue;
    }

    console.log(`\n=== ${attraction.name} (${slug}) — ${steps.length}ステップ`);
    steps.forEach((s, i) =>
      console.log(`  ${i + 1}. [${s.kind}] ${s.title}\n     ${s.body.slice(0, 60)}…`),
    );

    if (!APPLY) continue;

    // 作り直し。何度流しても同じ結果になるようにする。
    await db.attractionVisitStep.deleteMany({
      where: { attractionId: attraction.id },
    });
    await db.attractionVisitStep.createMany({
      data: steps.map((s, i) => ({
        attractionId: attraction.id,
        displayOrder: i + 1,
        kind: s.kind,
        title: s.title,
        body: s.body,
      })),
    });
    console.log("  → 投入しました");
  }

  if (!APPLY) console.log("\n投入するには --apply を付けて再実行してください。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
