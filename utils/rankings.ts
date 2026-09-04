import db from "./db";

/**
 * 週間ランキングの集計。
 *
 * 累計(views)だけで並べると、上位は公開から時間の経った行で固定される。
 * 一覧のいちばん目立つ場所が何ヶ月も同じ顔になるのを避けるために、
 * 直近だけを数える軸をここで作る。
 *
 * "use server" を付けていないのは、このファイルがサーバーコンポーネントから
 * 直接呼ぶ内部ヘルパーだから。Server Actions のファイルは非同期関数しか
 * export できず、日数などの定数を置けない。
 */

/**
 * 「今週」が見る日数。今日を含む7日ぶん。
 *
 * 曜日で区切らないのは、月曜の朝にランキングが空同然になるのを避けるため。
 */
export const WEEKLY_DAYS = 7;

/**
 * 週間を主役にするのに要る最低件数。
 *
 * 日別の集計は運用開始から貯まる。始めた直後に1〜2件だけ並べても
 * ランキングには見えないので、そこまでは総合に戻す。
 */
export const MIN_WEEKLY = 3;

/** DailyView.targetType に入る値。/api/views の TARGETS と揃える。 */
export type RankingTarget =
  | "attraction"
  | "museum"
  | "musical"
  | "column"
  | "britishEnglish"
  | "modernBritain";

/** 集計の起点。今日を含めて WEEKLY_DAYS 日ぶん遡った UTC の日付。 */
function weekStart() {
  const now = new Date();
  const since = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  since.setUTCDate(since.getUTCDate() - (WEEKLY_DAYS - 1));
  return since;
}

/**
 * 直近7日でよく見られた対象の id を、多い順に返す。
 *
 * 返すのは id だけ。DailyView は外部キーを持たないので、実体は
 * 呼び出し側がそれぞれの表から引き直す——非公開になった行や
 * 削除された行を、そこで落とせるようにするため。
 *
 * take より多めに取るのは、引き直した結果その一部が落ちても
 * ランキングが短くならないようにするため。
 */
export async function fetchWeeklyTopIds(
  targetType: RankingTarget | RankingTarget[],
  take: number,
) {
  const types = Array.isArray(targetType) ? targetType : [targetType];

  const grouped = await db.dailyView.groupBy({
    by: ["targetId"],
    where: { targetType: { in: types }, day: { gte: weekStart() } },
    _sum: { count: true },
    orderBy: { _sum: { count: "desc" } },
    take: take * 3,
  });

  return grouped.map((row) => row.targetId);
}

/**
 * 集計側の順位で並べ直す。
 *
 * findMany は id の並びを保たないので、引き直した行をここで戻す。
 * 見つからなかった id は落ちる(非公開・削除済み)。
 */
export function orderByIds<T extends { id: string }>(
  ids: string[],
  rows: T[],
  take: number,
) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is T => row !== undefined)
    .slice(0, take);
}
