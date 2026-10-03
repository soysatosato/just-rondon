import { parseIsoDate } from "./dates";
import {
  decodePlan,
  DEFAULT_START_MINUTES,
  encodePlan,
  isValidStartMinutes,
  type PlanEntry,
} from "./index";

/**
 * アカウントに保存した旅行プラン(TripPlan)の、API でやり取りする形。
 *
 * サーバー(/api/plan)とブラウザ(plan-sync.ts)の両方がここを通す。
 * 片方だけで検証すると、もう片方が受け取った値を信じることになる。
 */

/** API が返す1本ぶん。spots は共有リンクと同じ encodePlan の形。 */
export type SavedPlan = {
  spots: string;
  startDate: string | null;
  startMinutes: number;
  /** DB 側の版。書くたびに1つ上がる(schema.prisma の TripPlan)。 */
  revision: number;
};

/** 同期の比べ合わせに使う、プランの中身だけ。 */
export type PlanContent = {
  entries: PlanEntry[];
  startDate: string | null;
  startMinutes: number;
};

/**
 * spots の長さの上限。
 *
 * 40ヶ所 × 長めの slug(60字前後)に区切りと滞在時間を足しても3,000字に
 * 届かない。decodePlan は件数と日数で切るが slug 1つの長さは見ないので、
 * 巨大な文字列をそのまま DB に積まれないようにここで止める。
 */
export const MAX_SPOTS_LENGTH = 4000;

/** 出発日として受け付けられる値か。形だけでなく実在する日付か見る。 */
function readStartDate(value: unknown): string | null {
  return typeof value === "string" && parseIsoDate(value) ? value : null;
}

/**
 * クライアントから届いた本文を、保存してよい形にする。
 *
 * spots は一度 decodePlan に通して encodePlan で書き直す。共有リンクと
 * 同じ弾き方(slug の形・重複・件数と日数の上限)がそのまま効き、
 * 保存される文字列も常に同じ書き方に揃う。
 */
export function parsePlanInput(
  body: unknown,
):
  | { ok: true; spots: string; startDate: string | null; startMinutes: number; baseRevision: number | null }
  | { ok: false } {
  if (!body || typeof body !== "object") return { ok: false };
  const input = body as Record<string, unknown>;

  if (typeof input.spots !== "string" || input.spots.length > MAX_SPOTS_LENGTH) {
    return { ok: false };
  }

  const base = input.baseRevision;
  if (
    base !== null &&
    !(typeof base === "number" && Number.isInteger(base) && base >= 1)
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    spots: encodePlan(decodePlan(input.spots)),
    startDate: readStartDate(input.startDate),
    startMinutes: isValidStartMinutes(input.startMinutes)
      ? input.startMinutes
      : DEFAULT_START_MINUTES,
    baseRevision: base,
  };
}

/** API の応答に入っていたプランを読む。形が違えば null。 */
export function readSavedPlan(value: unknown): SavedPlan | null {
  if (!value || typeof value !== "object") return null;
  const plan = value as Record<string, unknown>;
  if (typeof plan.spots !== "string") return null;
  if (!(typeof plan.revision === "number" && Number.isInteger(plan.revision))) {
    return null;
  }
  return {
    spots: plan.spots,
    startDate: readStartDate(plan.startDate),
    startMinutes: isValidStartMinutes(plan.startMinutes)
      ? plan.startMinutes
      : DEFAULT_START_MINUTES,
    revision: plan.revision,
  };
}

export function savedPlanContent(plan: SavedPlan): PlanContent {
  return {
    entries: decodePlan(plan.spots),
    startDate: plan.startDate,
    startMinutes: plan.startMinutes,
  };
}

/**
 * 2つのプランが同じ中身か。
 *
 * 行き先は encodePlan の文字列で比べる。日・順番・滞在時間の上書きが
 * すべて入った形なので、ここが一致すれば画面に出るものも一致する。
 *
 * 行き先が空なら出発日と開始時刻は見ない。空のプランでは画面にどちらも
 * 出ておらず、そこだけ違うのを「別のプラン」として読者に選ばせても、
 * 何を比べているのか伝わらない。
 */
export function samePlanContent(a: PlanContent, b: PlanContent): boolean {
  const spotsA = encodePlan(a.entries);
  if (spotsA !== encodePlan(b.entries)) return false;
  if (spotsA === "") return true;
  return a.startDate === b.startDate && a.startMinutes === b.startMinutes;
}
