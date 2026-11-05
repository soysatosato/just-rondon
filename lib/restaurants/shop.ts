import type {
  Dish,
  MenuPick,
  Restaurant,
  RestaurantBranch,
  RestaurantPhoto,
} from "@prisma/client";
import { distanceKm } from "@/lib/sightseeing/geo";

/**
 * 店のページ(/restaurants/<店>)の判定と、画面に出す値の組み立て。
 *
 * 店のページは「確かめた事実がそろった店」だけに作る。事実の薄いページを
 * 店の数だけ並べると、どの店も同じ骨組みに数行の説明が乗るだけになり、
 * 読者にも検索にも価値が無い(AdSense の Low value content の指摘と同じ筋)。
 * そろわない店は、料理ページのカードのまま載せる。
 */

export type ShopWithRelations = Restaurant & {
  dish: Dish | null;
  menuPicks: MenuPick[];
  branches: RestaurantBranch[];
  photos: RestaurantPhoto[];
};

export type ShopSource = { label: string; url: string };

/** sources(JSON)を読む。形の合わない要素は捨てる。 */
export function shopSources(shop: Pick<Restaurant, "sources">): ShopSource[] {
  const raw = shop.sources;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { label, url } = item as Record<string, unknown>;
    return typeof label === "string" && typeof url === "string"
      ? [{ label, url }]
      : [];
  });
}

/** 地図に置ける所在地。 */
export function mappedBranches(shop: { branches: RestaurantBranch[] }) {
  return shop.branches.filter(
    (b): b is RestaurantBranch & { lat: number; lng: number } =>
      b.lat != null && b.lng != null,
  );
}

/** 出典の記録がある写真(Commons か、運営者が用意したもの)。 */
function hasCreditedImage(shop: Pick<Restaurant, "image" | "imageSource">) {
  return (
    !!shop.image &&
    (shop.imageSource === "commons" || shop.imageSource === "own")
  );
}

/**
 * 店のページを出すかどうか。
 *
 * 所在地の座標・入り方・公式価格つきの注文品2品以上・出典つきの写真・
 * 出典・確認日の6つがそろったときだけ true。
 */
export function meetsShopPageStandard(shop: ShopWithRelations): boolean {
  return (
    shop.factsCheckedAt != null &&
    !!shop.bookingNote?.trim() &&
    mappedBranches(shop).length > 0 &&
    shop.menuPicks.filter((p) => p.officialPrice != null).length >= 2 &&
    (hasCreditedImage(shop) || shop.photos.length > 0) &&
    shopSources(shop).length > 0
  );
}

export type BudgetLine = { name: string; nameJa: string | null; price: number };

export type BudgetExample = {
  label: string;
  lines: BudgetLine[];
  subtotal: number;
  /** 会計に加算されるサービス料(%)。公式に記載が無ければ null。 */
  serviceChargePercent: number | null;
  total: number;
  /** 価格を確かめた日のうち、いちばん古いもの。 */
  checkedAt: Date | null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * 予算の例を組み立てる。品の名前で公式価格を引き、足し合わせる。
 * 公式価格の無い品が1つでも含まれる例は出さない(半端な合計を見せない)。
 */
export function budgetExamples(
  shop: Pick<Restaurant, "budgetExamples" | "serviceChargePercent"> & {
    menuPicks: MenuPick[];
  },
): BudgetExample[] {
  const raw = shop.budgetExamples;
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const { label, picks } = entry as Record<string, unknown>;
    if (typeof label !== "string" || !Array.isArray(picks)) return [];

    const lines: BudgetLine[] = [];
    let checkedAt: Date | null = null;
    for (const name of picks) {
      const pick = shop.menuPicks.find((p) => p.name === name);
      if (!pick || pick.officialPrice == null) return [];
      lines.push({
        name: pick.name,
        nameJa: pick.nameJa,
        price: pick.officialPrice,
      });
      const at = pick.priceCheckedAt ? new Date(pick.priceCheckedAt) : null;
      if (at && (!checkedAt || at < checkedAt)) checkedAt = at;
    }

    const subtotal = round2(lines.reduce((n, l) => n + l.price, 0));
    const pct = shop.serviceChargePercent ?? null;
    const total = pct != null ? round2(subtotal * (1 + pct / 100)) : subtotal;
    return [
      { label, lines, subtotal, serviceChargePercent: pct, total, checkedAt },
    ];
  });
}

/** 「£11.70」のような表記。小数点以下が0なら省く。 */
export function formatGbp(n: number): string {
  return Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`;
}

/** 「2026年11月5日」。 */
export function formatCheckedDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * 劇場街の目安にする点(レスター・スクエア駅。lib/transport/stations.ts の値)。
 * ウエストエンドの劇場の多くがこの駅の周り1km以内にある。
 */
const THEATRELAND = { lat: 51.5114, lng: -0.1284 };
const THEATRELAND_KM = 0.8;

export type ShopScene = {
  id: "breakfast" | "walk-in" | "sunday" | "theatre" | "under-20";
  label: string;
  /** なぜこの場面に入るのか。画面に添える根拠。 */
  basis: string;
};

/**
 * 「こんなときに」。手で付けず、記録した事実だけから決める。
 * 1つも当てはまらない店は空配列。
 */
export function shopScenes(
  shop: ShopWithRelations,
  examples: BudgetExample[] = budgetExamples(shop),
): ShopScene[] {
  const scenes: ShopScene[] = [];

  if (shop.breakfast === true) {
    scenes.push({
      id: "breakfast",
      label: "朝食",
      basis: "朝食を出している(公式)",
    });
  }
  if (shop.walkIn === true) {
    scenes.push({
      id: "walk-in",
      label: "予約なしで",
      basis: "予約なしで入れる席がある(公式)",
    });
  }
  if (shop.closedDaysCheckedAt && !shop.closedWeekdays.includes(0)) {
    scenes.push({
      id: "sunday",
      label: "日曜も営業",
      basis: "日曜が休みではない(公式の営業日)",
    });
  }
  if (
    mappedBranches(shop).some((b) => distanceKm(b, THEATRELAND) <= THEATRELAND_KM)
  ) {
    scenes.push({
      id: "theatre",
      label: "劇場街の近く",
      basis: "店舗のどれかがレスター・スクエア駅から直線0.8km以内",
    });
  }
  const cheapest = Math.min(...examples.map((e) => e.total));
  if (Number.isFinite(cheapest) && cheapest <= 20) {
    scenes.push({
      id: "under-20",
      label: "£20以内の例あり",
      basis: "予算の例のうち1つがサービス料込みで£20以内",
    });
  }

  return scenes;
}

/** 予算の例のうち、いちばん安い合計。例が無ければ null。 */
export function cheapestBudget(examples: BudgetExample[]): BudgetExample | null {
  return examples.reduce<BudgetExample | null>(
    (min, e) => (min == null || e.total < min.total ? e : min),
    null,
  );
}

export function shopPath(slug: string): string {
  return `/restaurants/${slug}`;
}
