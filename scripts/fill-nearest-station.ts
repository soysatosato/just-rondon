/**
 * Attraction.nearestStation を TfL の実データで埋め直す。
 *
 * 手書きの値には3種類の問題があった:
 *
 * 1. 表記ゆれ。「White City」「Arsenal駅」「Peckham Rye駅 徒歩3分」が
 *    混在し、読者は毎ページ違う形式から同じ事実を読み取る羽目になる。
 * 2. 徒歩分の欠落。半数近くが駅名だけで、そこから歩くのか目の前なのかが
 *    分からない。
 * 3. 明らかな誤り。「駅」とだけ入っている行がある。
 *
 * TfL の Journey Planner は敷地内からの実経路を返すので、ロンドン塔や
 * キューガーデンのように「直線では近いが実際は遠回り」なスポットでも
 * 現実的な分数が出る(直線195m のロンドン塔→Tower Hill が実経路605m)。
 *
 * 上書きの方針:
 * - 半径1500m に駅が無ければ触らない。郊外のスポットで人が書いた
 *   「ウィンザー&イートン・セントラル駅」のような案内は、機械が出せる
 *   ものより有益なので残す。
 * - --dry で差分だけ出す。既定は dry ではないが、必ず先に --dry で
 *   確認すること。
 *
 * 実行: npx tsx scripts/fill-nearest-station.ts --dry
 *      npx tsx scripts/fill-nearest-station.ts
 *      npx tsx scripts/fill-nearest-station.ts --only-empty
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { findNearestStation } from "../lib/tfl/nearest-station";

const prisma = new PrismaClient();

const DRY = process.argv.includes("--dry");
/** 空欄だけ埋める。既存の手書きを一切触りたくないときに使う。 */
const ONLY_EMPTY = process.argv.includes("--only-empty");

/**
 * TfL への間隔(ms)。無登録枠は1分50回。1スポットあたり最大4回
 * (StopPoint 1 + Journey 3)叩くので、余裕を持って待つ。
 */
const THROTTLE_MS = 1500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 座標が「そのスポットの入口」を指していない行は触らない。
 *
 * DB の lat/lng は入口とは限らない。実際に見つかったもの:
 *
 * - アフタヌーンティーバス は 51.5074,-0.1278。これは出発地が予約時に
 *   決まる移動型ツアーで、座標はトラファルガー広場の既定値が入っている
 *   だけ。ここから駅を引くと「Charing Cross駅 徒歩2分」と、集合場所とは
 *   無関係な駅を断定してしまう。
 * - バッキンガム宮殿 / キングズ・ギャラリー / 衛兵交代式 は3件とも
 *   同じ座標を共有している。入口は別々なので、同じ駅・同じ分数を
 *   3件に配ると少なくとも2件は嘘になる。
 *
 * 機械が出した誤りは、人が書いた粗い値より質が悪い。断定的な形
 * (「◯◯駅 徒歩3分」)で出るぶん、読者は疑わずに従うため。
 * したがって、これらは人の記述を残して機械では触らない。
 */

/**
 * 移動型・複数拠点で、単一の座標が入口を表さないスポット。
 *
 * 「ツアー」で一括除外してはいけない。スタジアムツアー(エミレーツ・
 * ウェンブリー・オーバル)は住所が1つに定まる据え置きの施設で、
 * むしろ機械のほうが正確な分数を出せる。除外すべきなのは
 * 「乗り物で街を回る」「集合場所が予約時に決まる」ものだけ。
 *
 * 判定は名前に頼らざるを得ないが、取りこぼしても害は小さい
 * (人の記述が残るだけ)。逆に据え置きの施設を巻き込むと、
 * 表記ゆれの残った古い値がそのまま生き残る。
 */
const AMBIGUOUS_LOCATION =
  /バスツアー|バス・ツアー|ウォーキングツアー|クルーズ|パス$|乗り降り自由|ティーバス|完全制覇/;

/**
 * 「座標が分からないので中心部を入れておいた」既定値。
 *
 * トラファルガー広場のこの座標は lib/weather/forecast.ts が
 * 「ロンドンの代表点」として使っているものと同じで、実在のスポットの
 * 入口ではない。1件しか持っていないため座標の共有では検出できず、
 * 名前で弾けなければ「Charing Cross駅 徒歩2分」と断定されてしまう。
 */
const PLACEHOLDER_COORDS = new Set(["51.5074,-0.1278"]);

/**
 * ロンドンの外にあるスポット。
 *
 * TfL が索引しているのはロンドン交通局の管轄と、そこに乗り入れる
 * 鉄道駅まで。管轄外の駅は StopPoint に載らないため、半径内の
 * 「TfL が知っている駅」だけを見て最寄りを名乗ってしまう。
 *
 * 実例: ビスター・ヴィレッジ(オックスフォードシャー)には専用の
 * Bicester Village 駅が徒歩数分の位置にあるが、TfL には無いので
 * Bicester North(徒歩27分)が選ばれる。案内として明確に劣る。
 *
 * 緯度で機械的に弾く。ロンドンの北端(M25の内側)はおよそ 51.70 なので、
 * それを超えるものは TfL の網の外と見なす。
 */
const LONDON_NORTH_LIMIT = 51.7;

/**
 * 同じ座標を複数のスポットが共有しているかを調べ、共有している
 * 座標キーの集合を返す。
 */
function findSharedCoords(
  rows: { lat: number; lng: number }[]
): Set<string> {
  const seen = new Map<string, number>();
  for (const r of rows) {
    const key = `${r.lat},${r.lng}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
}

async function main() {
  const attractions = await prisma.attraction.findMany({
    where: {
      isPublished: true,
      ...(ONLY_EMPTY ? { nearestStation: null } : {}),
    },
    select: { id: true, name: true, lat: true, lng: true, nearestStation: true },
    orderBy: { name: "asc" },
  });

  const shared = findSharedCoords(attractions);

  console.log(
    `対象 ${attractions.length}件${DRY ? " (dry run)" : ""}${ONLY_EMPTY ? " / 空欄のみ" : ""}\n`
  );

  let updated = 0;
  let unchanged = 0;
  let skipped = 0;
  let ambiguous = 0;

  for (const a of attractions) {
    // 座標が入口を指していない行は、人の記述を残して触らない。
    const key = `${a.lat},${a.lng}`;
    const reason = AMBIGUOUS_LOCATION.test(a.name)
      ? "移動型/複数拠点"
      : PLACEHOLDER_COORDS.has(key)
        ? "座標が中心部の既定値"
        : a.lat > LONDON_NORTH_LIMIT
          ? "ロンドン圏外(TfL の索引外)"
          : shared.has(key)
            ? "座標を他スポットと共有"
            : null;

    if (reason) {
      console.log(`  KEEP  ${a.name} — ${reason} (現在: ${a.nearestStation ?? "空"})`);
      ambiguous++;
      continue;
    }

    const station = await findNearestStation(a.lat, a.lng);

    if (!station) {
      // 半径内に駅なし。既存の手書きを残す。
      console.log(`  SKIP  ${a.name} — 半径内に駅なし (現在: ${a.nearestStation ?? "空"})`);
      skipped++;
      await sleep(THROTTLE_MS);
      continue;
    }

    if (a.nearestStation === station.label) {
      unchanged++;
      await sleep(THROTTLE_MS);
      continue;
    }

    console.log(
      `  SET   ${a.name}\n        ${a.nearestStation ?? "(空)"} → ${station.label}  [経路${station.walkMetres}m]`
    );

    if (!DRY) {
      await prisma.attraction.update({
        where: { id: a.id },
        data: { nearestStation: station.label },
      });
    }
    updated++;

    await sleep(THROTTLE_MS);
  }

  console.log(
    `\n${DRY ? "[dry] " : ""}更新 ${updated} / 変更なし ${unchanged} / 駅なし ${skipped} / 座標が曖昧 ${ambiguous}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
