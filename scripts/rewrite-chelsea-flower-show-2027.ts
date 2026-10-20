/**
 * RHSチェルシー・フラワー・ショーのスポットページを、2027年の実際に合わせて書き直す。
 *
 *   npx tsx scripts/rewrite-chelsea-flower-show-2027.ts           # 差分を表示
 *   npx tsx scripts/rewrite-chelsea-flower-show-2027.ts --apply   # DBへ反映
 *
 * 2026-10-19 のコンテンツ監査で、閲覧数1位(9/4〜10/18 で63回)のこのページが
 * 題は「(2027)」なのに本文は2026年の「チケットは現在販売中」「一般£107.00〜」の
 * ままで、「とされています」「旨の案内」が12か所、「(※この背景は一般的に広く
 * 紹介されている内容で…)」という根拠にならない注記まで残っていた。
 *
 * 2026-10-20 に RHS の公式ページで確かめた事実:
 *   - 2027年は5月18日〜22日。18・19日(火・水)は会員の日、一般は20〜22日(木〜土)
 *   - 会員向けの発売は2026-10-19、一般は10-21(水)の正午
 *   - 一般は£61から、会員は£48から。2027-01-04(月)までに買うと安い
 *   - 8:00〜20:00。22日(土)は17:30閉場、16:00〜17:30がプラント・セルオフ。
 *     21日(金)は17:30〜22:00の夜の枠(Chelsea Late)
 *   - 5歳未満は入場不可、5歳以上は大人同伴で大人と同じチケット。ベビーカーは
 *     会場内に持ち込めない(ロンドン・ゲートの外に預け場所)。介助犬以外の犬は不可。
 *     原則として再入場不可。チケットは AXS の Mobile ID か PDF
 *   - チケット・飲食・ショーガイドはカードのみ。ATM はあるが手数料がかかる
 *   - チェルシー・イン・ブルーム(無料、Cadogan と RHS)は2026年は5月18〜24日
 *
 * 年ごとに変わる事実(会期・発売日・料金)は、季節スポットの年ごとの事実を
 * 持つ仕組みができるまで、この本文とファクトバーに日付つきで書いておく。
 * 毎年秋の発売の時期に、ここを翌年分に直すこと。
 *
 * 本文は react-markdown で描いて、生の ** が残らないことを確かめてから書く(CLAUDE.md)。
 */

import "dotenv/config";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

const SLUG = "rhs-chelsea-flower-show";

const FIELDS = {
  summary:
    "英国王立園芸協会(RHS)が毎年5月に開く園芸の祭典。チェルシーの王立病院の敷地に、ショーガーデン、グレート・パビリオンの展示、園芸の店と屋台が並ぶ。2027年は5月18日〜22日で、最初の2日間はRHS会員だけの日。一般が入れるのは5月20日(木)〜22日(土)。チケットは公式サイトでの事前購入制で、5歳未満は入場できない。",
  priceAdult: "£61〜",
  priceChild: "大人と同額（5歳以上）",
  durationText: "半日〜1日",
} as const;

type StoryRewrite = {
  id: number;
  /** いまの本文にこれが含まれていれば書き換える(古い版の目印)。 */
  oldMarker: string;
  heading: string;
  body: string;
};

const STORIES: StoryRewrite[] = [
  {
    id: 2153,
    oldMarker: "“見るだけ”で終わらない",
    heading: "何を見る催しか",
    body:
      "チェルシー・フラワー・ショーは、英国王立園芸協会(RHS)が毎年5月に開く園芸の祭典です。会場はチェルシーの王立病院(ロイヤル・ホスピタル・チェルシー)の敷地です。\n\n" +
      "見るものは大きく3つあります。\n\n" +
      "- **ショーガーデン**: 設計者がこの会期のために作る庭です。会期が終われば解体されます。審査でメダルが付くので、その結果も見どころになります\n" +
      "- **グレート・パビリオン**: 大きなテントの中に、各地の育種家や苗木屋が展示を並べます。花の品種そのものを見たいならここです\n" +
      "- **買い物と食事**: 園芸用品や植物を売る店と、屋台やレストランが並びます\n\n" +
      "植物に詳しくなくても、作り込まれた庭を歩いて回るだけで成り立つ催しです。展示を丁寧に見るなら半日はかかります。",
  },
  {
    id: 2154,
    oldMarker: "チケットは現在販売中",
    heading: "チケットは会員が先、一般があと",
    body:
      "チケットは公式サイト(RHS)での事前購入制です。2027年分の発売は、RHS会員向けが2026年10月19日、一般向けが10月21日(水)の正午。\n\n" +
      "- **一般の料金**: £61から\n" +
      "- **会員の料金**: £48から\n" +
      "- 公式は**2027年1月4日(月)までに買うと安い**と案内しています\n\n" +
      "一般が入れるのは5月20日(木)〜22日(土)の3日間です。最初の2日間(5月18日・19日)は会員だけの日で、会員日と会員料金のチケットはRHSの会員でないと買えません。ただし会員になっても、チケットが取れる保証はありません。\n\n" +
      "時間は8:00〜20:00で、最終日の22日(土)だけ17:30に閉まります。21日(金)には17:30〜22:00の夜の枠(Chelsea Late)があります。\n\n" +
      "チケットは AXS のアプリ(Mobile ID)で受け取るのが基本で、購入時にPDFの電子チケットを選ぶこともできます。Mobile ID のチケットはスマートフォンのウォレットには入れられません。",
  },
  {
    id: 2155,
    oldMarker: "5歳未満は入場不可",
    heading: "入場の決まり: 5歳未満は入れない",
    body:
      "- **5歳未満の子どもは入場できません**。5歳以上は大人の同伴が必要で、大人と同じ料金のチケットが要ります\n" +
      "- **ベビーカーは会場に持ち込めません**。入口(ロンドン・ゲート)の外に預け場所があります\n" +
      "- **犬は入れません**(介助犬を除く)\n" +
      "- **一度出ると、原則として再入場できません**。昼食に外へ出る前提では予定を組まないでください\n" +
      "- 支払いは**カードが基本**です。チケット・飲食・ショーガイドはカードだけで、会場内のATMは手数料がかかります\n\n" +
      "会場は広く、立ったまま歩く時間が長くなります。休憩の場所と時間を先に決めておくと、最後まで見て回れます。",
  },
  {
    id: 2156,
    oldMarker: "### 地下鉄（Tube）",
    heading: "行き方",
    body:
      "最寄りは地下鉄の**スローン・スクエア駅**(ディストリクト線・サークル線)で、会場まで歩いて10分ほどです。住所は Royal Hospital Road, London SW3 4SR。\n\n" +
      "ショーの週は駅も周りの道も混みます。閉場の直後は駅に列ができるので、帰りの時間に余裕を見てください。バスの停留所はショーの週に一部が移されることがあるので、バスで向かう場合は TfL の案内を確かめてください。",
  },
  {
    id: 2157,
    oldMarker: "### 会場内の飲食",
    heading: "会場での食事と買い物",
    body:
      "会場内に屋台とレストランがあり、食事は会場の中で済ませられます。再入場ができないので、外で食べる計画は立てないほうが安全です。支払いはカードが基本です。\n\n" +
      "買い物の目玉は、最終日の**グレート・プラント・セルオフ**です。2027年は5月22日(土)の16:00〜17:30に、展示に使われた植物が売られます。日本へ持ち帰るなら植物検疫の対象で、土の付いたものは持ち込めません。",
  },
  {
    id: 2158,
    oldMarker: "一般的に広く紹介されている",
    heading: "1913年から王立病院の庭で",
    body:
      "RHSの春のショーがチェルシーの王立病院の敷地に移ってきたのは1913年です。以来、戦時中などの中断をはさみながら、毎年5月にここで開かれてきました。\n\n" +
      "会場の王立病院は、チャールズ2世が1682年に創設した退役軍人の施設で、いまも退役兵(チェルシー・ペンショナーズ)が暮らしています。赤い上着の姿を会場で見かけることがあります。\n\n" +
      "例年ショーの週には、周りの通り(スローン・スクエアやキングズ・ロードなど)の店先を花で飾る**チェルシー・イン・ブルーム**も開かれます。こちらは無料で、チケットが取れなかった人でも歩いて回れます(2026年は5月18日〜24日。2027年の日程は未発表)。",
  },
];

const renderMd = (md: string): string =>
  renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md),
  );

function brokenBold(text: string): boolean {
  return text.includes("**") && renderMd(text).includes("**");
}

async function main() {
  const texts = [...Object.values(FIELDS), ...STORIES.flatMap((s) => [s.heading, s.body])];
  const broken = texts.filter(brokenBold);
  if (broken.length > 0) {
    for (const t of broken) console.error("生の ** が残る:", t.slice(0, 80));
    throw new Error("太字が描画されない本文がある。直してから流すこと。");
  }

  const spot = await db.attraction.findUnique({
    where: { slug: SLUG },
    select: {
      id: true,
      summary: true,
      priceAdult: true,
      priceChild: true,
      durationText: true,
    },
  });
  if (!spot) throw new Error(`${SLUG} が見つからない`);

  let changed = 0;

  for (const [field, to] of Object.entries(FIELDS) as [keyof typeof FIELDS, string][]) {
    const before = spot[field];
    if (before === to) {
      console.log(`[済] ${field}`);
      continue;
    }
    console.log(`\n[${field}]`);
    console.log("  before:", JSON.stringify(before));
    console.log("  after: ", JSON.stringify(to));
    changed++;
  }
  if (apply && changed > 0) {
    await db.attraction.update({ where: { id: spot.id }, data: { ...FIELDS } });
  }

  for (const story of STORIES) {
    const row = await db.attractionStory.findUnique({ where: { id: story.id } });
    if (!row || row.attractionId !== spot.id) {
      throw new Error(`story#${story.id} がこのスポットの本文ではない`);
    }
    if (row.body === story.body && row.heading === story.heading) {
      console.log(`[済] story#${story.id}`);
      continue;
    }
    if (!row.body.includes(story.oldMarker)) {
      console.warn(`[飛ばす] story#${story.id} — 古い版の目印が無い(手で直された可能性)`);
      continue;
    }
    console.log(`\n[story#${story.id}] ${row.heading ?? "(見出しなし)"} → ${story.heading}`);
    console.log(story.body);
    changed++;
    if (apply) {
      await db.attractionStory.update({
        where: { id: story.id },
        data: { heading: story.heading, body: story.body },
      });
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
