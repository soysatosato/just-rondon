/**
 * 年に一度開催される季節イベントのページを、次回開催の情報へ更新する。
 *
 *   npx tsx scripts/update-seasonal-events-2026.ts           # 差分を表示
 *   npx tsx scripts/update-seasonal-events-2026.ts --apply   # DBへ反映
 *
 * 対象は「毎年開催されるが、ページが特定の年の日程で止まっている」もの。
 * 会期が過ぎたまま放置すると、読者が終わった催しの日程を見て予定を立てる。
 *
 * update-winter-wonderland-2026.ts と同じ考え方。slug は変えない
 * (変えると既存URLが404になり検索流入と外部リンクを失う)。
 * 表示名と本文だけを毎年更新する運用にする。
 *
 * 来年やること: 下の各エントリの日程を公式サイトで確認して差し替え、再実行する。
 *
 * 出典(2026-08時点):
 * - チェルシー・ウィンタービレッジ2026: 11/25(水)〜12/28(月)。
 *   ゲートは16:30から、トレイル22:00終了、ビレッジ23:00終了。
 *   ラネラー・ガーデンズを巡る1.5kmの光のトレイル、カーリング場あり。
 *   入口はロイヤル・ホスピタル・ロードのロンドン・ゲート(SW3 4SR)。
 *   https://chelseawintervillage.com/
 * - RHSチェルシー・フラワー・ショー2027: 5/18(火)〜5/22(土)、
 *   ロイヤル・ホスピタル・チェルシー。最初の2日はRHS会員限定で、
 *   木・金は会員と一般の双方が入場可(8:00〜20:00)。
 *   ※2026年の会期(5/19〜23)は既に終了している。
 *   https://www.rhs.org.uk/shows-events/rhs-chelsea-flower-show
 */

import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");

type Update = {
  slug: string;
  /** 表示名。変更が不要なら省略。 */
  name?: string;
  summary?: string;
  /**
   * 差し替えるセクション。
   *
   * find が本文に無ければスキップする。ただし replace が find を含む
   * (元の文を残して追記する)書き方の場合、再実行時も find が一致して
   * しまうため、それだけでは二重適用を防げない。
   * そこで done に「適用後にだけ現れる文字列」を指定し、
   * それが既にあれば何もしないようにしている。
   */
  sections?: { id: number; find: string; replace: string; done: string }[];
  note: string;
};

const UPDATES: Update[] = [
  {
    slug: "chelsea-winter-village-2025",
    name: "チェルシー・ウィンタービレッジ（2026）",
    summary:
      "Royal Hospital Chelsea の歴史的建物を舞台に開催される冬の祭典。2026年は11月25日から12月28日まで。約1.5kmにわたる光のトレイル、クリスマスマーケット、カーリング場、ワークショップ、ポップアップ合唱団まで揃う。ゲートは夕方16:30から開き、光のトレイルは22:00、ビレッジは23:00に終了する。",
    note:
      "2026年の会期(11/25〜12/28)を明記する。従来は年の記載がなく、" +
      "いつ行けるのか本文から読み取れなかった。",
    sections: [
      {
        id: 343,
        find:
          "**Chelsea Winter Village（チェルシー・ウィンタービレッジ）**は、ロンドン・チェルシーの**Royal Hospital Chelsea**を舞台に開催される、幻想的なクリスマスイベントです。",
        replace:
          "**Chelsea Winter Village（チェルシー・ウィンタービレッジ）**は、ロンドン・チェルシーの**Royal Hospital Chelsea**を舞台に開催される、幻想的なクリスマスイベントです。\n" +
          "\n" +
          "**2026年の会期は11月25日（水）〜12月28日（月）。**\n" +
          "ゲートは16:30ごろから開き、光のトレイルは22:00、ビレッジ全体は23:00に終了します。" +
          "入口はロイヤル・ホスピタル・ロード側の London Gate（SW3 4SR）です。\n" +
          "日程は毎年変わるため、訪問前に[公式サイト](https://chelseawintervillage.com/)でご確認ください。",
        done: "**2026年の会期は11月25日（水）〜12月28日（月）。**",
      },
    ],
  },
  {
    slug: "rhs-chelsea-flower-show-2026",
    name: "RHSチェルシー・フラワー・ショー（2027）",
    summary:
      "世界最高峰のガーデニング・花芸の祭典「RHSチェルシー・フラワー・ショー」。次回2027年は5月18日〜22日に、チェルシーの歴史あるロイヤル・ホスピタルの敷地で開催。最初の2日間はRHS会員限定で、一般が入れるのは木曜と金曜以降。圧巻のショーガーデンやグレート・パビリオンの展示、限定ショッピングや食の楽しみまで、英国らしい初夏の贅沢を一気に味わえます。",
    note:
      "2026年の会期(5/19〜23)は終了済み。次回2027年(5/18〜22)の日程へ更新し、" +
      "最初の2日がRHS会員限定であること(一般は木曜から)を明記する。" +
      "会員限定日を知らずに火曜の券を探す読者が出るため。",
    sections: [
      {
        id: 1024,
        find: "### 2026年の開催日程（会場内の滞在型イベント）",
        replace:
          "### 次回の開催日程\n" +
          "- **2027年5月18日（火）〜5月22日（土）**\n" +
          "- 会場：Royal Hospital Chelsea\n" +
          "- **最初の2日間（火・水）はRHS会員限定**です。会員でない場合、入場できるのは木曜以降になります（木・金は8:00〜20:00）。\n" +
          "- チケットは例年、前年のうちに売り出されて完売します。行くと決めたら早めに動いてください。\n" +
          "- 最新情報は[RHS公式サイト](https://www.rhs.org.uk/shows-events/rhs-chelsea-flower-show)でご確認ください。\n" +
          "\n" +
          "### 参考：2026年の開催日程（終了）",
        done: "### 次回の開催日程",
      },
    ],
  },
];

async function main() {
  for (const u of UPDATES) {
    const attraction = await db.attraction.findUnique({
      where: { slug: u.slug },
      select: { id: true, name: true, sections: { select: { id: true, title: true } } },
    });

    if (!attraction) {
      console.log(`SKIP ${u.slug} — 該当スポットなし`);
      continue;
    }

    console.log(`\n=== ${attraction.name} (${u.slug})`);
    console.log(`  ${u.note}`);
    if (u.name) console.log(`  name    → ${u.name}`);
    if (u.summary) console.log(`  summary → ${u.summary.slice(0, 60)}…`);

    if (APPLY && (u.name || u.summary)) {
      await db.attraction.update({
        where: { id: attraction.id },
        data: {
          ...(u.name ? { name: u.name } : {}),
          ...(u.summary ? { summary: u.summary } : {}),
        },
      });
    }

    for (const s of u.sections ?? []) {
      const section = await db.attractionSection.findUnique({
        where: { id: s.id },
        select: { id: true, title: true, description: true },
      });
      if (!section) {
        console.log(`  section id:${s.id} — 見つかりません`);
        continue;
      }
      const before = section.description ?? "";
      if (before.includes(s.done)) {
        console.log(`  section id:${s.id} (${section.title}) — 適用済み`);
        continue;
      }
      if (!before.includes(s.find)) {
        console.log(`  section id:${s.id} (${section.title}) — 対象の文言なし(本文が変わった可能性)`);
        continue;
      }
      console.log(`  section id:${s.id} (${section.title}) を更新`);
      if (!APPLY) continue;
      await db.attractionSection.update({
        where: { id: section.id },
        data: { description: before.replace(s.find, s.replace) },
      });
    }

    if (APPLY) console.log("  → 更新しました");
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
