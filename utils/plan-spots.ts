import type { Prisma } from "@prisma/client";

import type { PlanSpot } from "@/lib/plan";
import { nearestFareZone } from "@/lib/transport/fare-zones";

/**
 * 旅行プラン(/plan)の1行が要る列と、それを PlanSpot に直す処理。
 *
 * 一覧(utils/actions/attractions.ts の fetchPlanSpots)と、一覧に無い slug を
 * あとから引く /api/plan/spots の両方がここを通す。片方だけ列を足すと、
 * 一覧から来た行と API から来た行で出る情報が食い違う。
 *
 * 運賃ゾーンは座標から最寄り駅を引いて決める。駅の表はサーバーにだけ置き、
 * ブラウザにはゾーンの値だけを渡す(lib/transport/fare-zones.ts)。
 */
export const PLAN_SPOT_SELECT = {
  slug: true,
  name: true,
  engName: true,
  image: true,
  address: true,
  lat: true,
  lng: true,
  category: true,
  area: true,
  priceAdult: true,
  durationText: true,
  openingHours: true,
  closedWeekdays: true,
  closedDaysCheckedAt: true,
  nearestStation: true,
  isFree: true,
  mustSee: true,
  recommendLevel: true,
  londonPass: true,
  londonPassNote: true,
} satisfies Prisma.AttractionSelect;

type PlanSpotRow = Prisma.AttractionGetPayload<{
  select: typeof PLAN_SPOT_SELECT;
}>;

export function toPlanSpot(row: PlanSpotRow): PlanSpot {
  const { closedDaysCheckedAt, ...rest } = row;
  return {
    ...rest,
    closedDaysChecked: closedDaysCheckedAt !== null,
    fareZone:
      row.address && row.address !== "-" ? nearestFareZone(row).zone : null,
  };
}
