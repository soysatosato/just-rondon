/**
 * 2026-11 の観光スポットの見直しで決めた、区分・公開状態・移転の反映。
 *
 *   npx tsx scripts/fix-spot-status-2026-11.ts           # 差分を表示(書かない)
 *   npx tsx scripts/fix-spot-status-2026-11.ts --apply   # DBへ反映
 *
 * 2026-11-05 にユーザーが報告書の推奨どおりに進めると決めたもの:
 *
 *   - 区分の訂正: ビッグ・ベン(国会議事堂の時計塔)と、ロイヤル・オペラ・ハウス
 *     (劇場)が royal(王室)に入っていた。一覧の章と「王室のロンドン」の台紙から
 *     外れる。台紙に押されたスタンプは2件で、どちらもこの2か所ではない(11/5 確認)。
 *   - ザ・コールドロン: 公式ドメイン(thecauldron.io)が無関係の寄付ページへ転送され、
 *     閉店したとの記載もある。Attraction.isPublished の説明どおり、行は消さずに非公開に。
 *   - ファントム・ピーク: 公式サイトの所在地がウェストフィールド・ストラットフォード・
 *     シティの新会場(Chestnut Plaza, Westfield Ave, Montfichet Rd, London E20 1GL)に
 *     変わり、2026-12-04 に開業と告知。旧会場(サリー・キーズ)の住所・最寄駅・料金と、
 *     旧会場の営業時間・バーを書いた読み物3本を外す。座標は postcodes.io の E20 1GL、
 *     最寄駅は TfL の Journey Planner(lib/tfl/nearest-station)と公式の案内で確かめた。
 *     新会場の料金は公式で確かめられなかったので空にする。
 *
 * 値の直しは from(いまの値)で守る。読み物の削除は id とスポットと見出しで守る。
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

type FieldFix = {
  slug: string;
  field:
    | "category"
    | "isPublished"
    | "address"
    | "lat"
    | "lng"
    | "nearestStation"
    | "priceAdult"
    | "priceChild"
    | "summary";
  from: string | number | boolean | null;
  to: string | number | boolean | null;
};

const PHANTOM_SUMMARY_FROM =
  "ファントム・ピークは、西部劇の町を舞台にした没入型の体験施設で、住民役との会話や謎解き、スマホと連動した物語を通じて、100以上の冒険を自由に進めます。新旧2つの町を舞台に、企業 JONACO の陰謀や住民の秘密を解き明かす筋書きで、物語は季節ごとに更新されます。滞在時間は4〜4.5時間で、飲食店もあります。";
const PHANTOM_SUMMARY_TO =
  "ファントム・ピークは、西部の町を舞台にした没入型の体験施設です。住民役の俳優と話し、スマホと連動した物語を進めながら、町の中を自由に歩き回ります。2026年12月4日に、ウェストフィールド・ストラットフォード・シティの新しい会場で開業します(公式)。新会場はオールド・タウン、タウン・スクエア、レイクサイドの3つの区画に分かれています。";

const FIELD_FIXES: FieldFix[] = [
  { slug: "big-ben", field: "category", from: "royal", to: "historic" },
  { slug: "royal-ballet-opera-london", field: "category", from: "royal", to: "entertainment" },
  { slug: "the-cauldron", field: "isPublished", from: true, to: false },
  {
    slug: "phantom-peak",
    field: "address",
    from: "Surrey Quays, London SE16 7PJ, UK",
    to: "Chestnut Plaza, Westfield Ave, Montfichet Rd, London E20 1GL, UK",
  },
  { slug: "phantom-peak", field: "lat", from: 51.49524, to: 51.542604 },
  { slug: "phantom-peak", field: "lng", from: -0.0449, to: -0.008039 },
  {
    slug: "phantom-peak",
    field: "nearestStation",
    from: "Canada Water 徒歩7分",
    to: "Stratford駅(ウェストフィールド・ストラットフォード・シティの中)",
  },
  { slug: "phantom-peak", field: "priceAdult", from: "£55〜", to: null },
  { slug: "phantom-peak", field: "priceChild", from: "£30〜", to: null },
  { slug: "phantom-peak", field: "summary", from: PHANTOM_SUMMARY_FROM, to: PHANTOM_SUMMARY_TO },
];

/** 旧会場の営業時間・所要時間・バーを書いた読み物。新会場では確かめられていない。 */
const STORY_DELETES: { slug: string; id: number; heading: string }[] = [
  { slug: "phantom-peak", id: 2511, heading: "訪問前に知っておきたいこと" },
  { slug: "phantom-peak", id: 2512, heading: "ショップ・飲食" },
  { slug: "phantom-peak", id: 2513, heading: "開館時間" },
];

async function main() {
  let changed = 0;

  for (const fix of FIELD_FIXES) {
    const row = await db.attraction.findUnique({ where: { slug: fix.slug } });
    if (!row) throw new Error(`スポット ${fix.slug} が見つからない`);
    const current = (row as Record<string, unknown>)[fix.field] ?? null;
    if (current === fix.to) {
      console.log(`[済] ${fix.slug}.${fix.field}`);
      continue;
    }
    if (current !== fix.from) {
      console.warn(`[飛ばす] ${fix.slug}.${fix.field} — いまの値が想定と違う: ${JSON.stringify(current)}`);
      continue;
    }
    console.log(`[${fix.slug}] ${fix.field}: ${JSON.stringify(current)} → ${JSON.stringify(fix.to)}`);
    changed++;
    if (apply) {
      await db.attraction.update({ where: { slug: fix.slug }, data: { [fix.field]: fix.to } });
    }
  }

  for (const del of STORY_DELETES) {
    const spot = await db.attraction.findUnique({ where: { slug: del.slug }, select: { id: true } });
    if (!spot) throw new Error(`スポット ${del.slug} が見つからない`);
    const story = await db.attractionStory.findUnique({ where: { id: del.id } });
    if (!story) {
      console.log(`[済] ${del.slug} story#${del.id} は削除済み`);
      continue;
    }
    if (story.attractionId !== spot.id || story.heading !== del.heading) {
      console.warn(`[飛ばす] ${del.slug} story#${del.id} — スポットか見出しが想定と違う`);
      continue;
    }
    console.log(`[${del.slug}] story#${del.id}「${del.heading}」を削除`);
    changed++;
    if (apply) await db.attractionStory.delete({ where: { id: del.id } });
  }

  console.log(`\n${changed} 件${apply ? "を反映した" : "の差分(--apply で反映)"}。`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
