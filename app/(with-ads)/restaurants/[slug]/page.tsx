import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";
import { fetchDish, fetchDishSlugs, fetchDishes } from "@/utils/actions/dishes";
import {
  fetchAllShops,
  fetchPublishedShops,
  fetchShop,
  fetchShopsOfDish,
} from "@/utils/actions/restaurants";
import { fetchNearbyAttractions } from "@/utils/actions/attractions";
import { fetchGbpJpyRate, type FxRate } from "@/lib/fx/rate";
import DishView from "@/components/restaurants/DishView";
import ShopView from "@/components/restaurants/ShopView";
import { dishPath } from "@/components/restaurants/meta";
import { restaurantGuides } from "@/components/restaurants/guides/guides";
import { mustVisitShopSlugs } from "@/components/restaurants/guides/content/must-visit";
import {
  budgetExamples,
  cheapestBudget,
  formatCheckedDate,
  formatGbp,
  mappedBranches,
  meetsShopPageStandard,
  shopPath,
} from "@/lib/restaurants/shop";

/*
 * /restaurants/<slug> は2種類のページを出す。
 *
 *   料理ページ(/restaurants/afternoon-tea など)… DB の Dish
 *   店のページ(/restaurants/dishoom など)      … DB の Restaurant のうち公開基準を満たす店
 *
 * URL の階層を分けなかったのは、店名で検索した人が着地する URL を短く保つため。
 * そのかわり slug が重ならないことをビルド時に確かめる(generateStaticParams)。
 * must-visit / pub-etiquette は静的ルートなので、こちらより優先される。
 */

// 取得側の unstable_cache(utils/actions/dishes.ts)と同じ1日。
export const revalidate = 60 * 60 * 24;

export async function generateStaticParams() {
  const [dishes, shops] = await Promise.all([
    fetchDishSlugs(),
    fetchPublishedShops(),
  ]);
  const taken = new Set([
    ...dishes.map((d) => d.slug),
    ...restaurantGuides.map((g) => g.slug),
  ]);
  const clash = shops.filter((s) => taken.has(s.slug)).map((s) => s.slug);
  if (clash.length > 0) {
    throw new Error(
      `店の slug が料理・ガイドの slug と重なっています: ${clash.join(", ")}`,
    );
  }
  return [
    ...dishes.map((d) => ({ slug: d.slug })),
    ...shops.map((s) => ({ slug: s.slug })),
  ];
}

/**
 * 料理ページの題名。検索で探されている言い方(おすすめ・店・値段・予約)を入れ、
 * 店の数はデータから入れる(増減しても嘘にならないように)。
 *
 * パイ&マッシュは「パイアンドマッシュ」で平均2.9位に出ていながら、
 * 3か月で26回表示・クリック0だった(2026-10)。日本語では「&」と「アンド」の
 * 2通りで書かれ、探している人はまず「何の料理か」を知りたい。
 */
const DISH_TITLES: Record<string, (shops: number) => string> = {
  "afternoon-tea": (n) =>
    `ロンドンのアフタヌーンティー おすすめ${n}店｜料金・予約・服装を比較`,
  "fish-and-chips": (n) =>
    `ロンドンのフィッシュ&チップス おすすめ${n}店｜値段と店の選び方`,
  "sunday-roast": (n) => `ロンドンのサンデーロースト おすすめ${n}店｜予約と値段`,
  "full-english-breakfast": (n) =>
    `ロンドンのイングリッシュ・ブレックファスト ${n}店｜朝食の店と値段`,
  "indian-curry": (n) =>
    `ロンドンのインドカレー おすすめ${n}店｜ディシュームの予約の条件も`,
  "pie-and-mash": (n) =>
    `パイ&マッシュ(パイアンドマッシュ)とは｜ロンドンで食べられる店${n}軒`,
  "salt-beef-bagel": (n) =>
    `ソルトビーフ・ベーグルとは｜ロンドンで食べられる店${n}軒`,
  ramen: (n) => `ロンドンのラーメン ${n}店｜値段と空いている時間`,
  japanese: (n) => `ロンドンの日本食 ${n}店｜うどん・定食からおまかせまで`,
  chinese: (n) => `ロンドンの中華 ${n}店｜チャイナタウンの飲茶と手打ち麺`,
};

function shopTitle(shop: { name: string; engName: string; cuisine: string | null }) {
  if (shop.cuisine === "アフタヌーンティー") {
    return `${shop.name}のアフタヌーンティー｜予約・服装・価格(${shop.engName})`;
  }
  return `${shop.name}(${shop.engName})｜予約の仕方・頼む料理・予算`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const dish = await fetchDish(params.slug);
  if (dish) {
    const n = dish.restaurants.length;
    return buildPageMetadata({
      path: dishPath(dish.slug),
      title: DISH_TITLES[dish.slug]?.(n) ?? `ロンドンの${dish.name}｜${dish.tagline}`,
      description: `${dish.summary} ${dish.name}(${dish.engName})が食べられるロンドンの店${n}軒を、予算・予約・エリアで比べられます。`,
      type: "article",
      keywords: [
        `ロンドン ${dish.name}`,
        `${dish.name} おすすめ`,
        dish.engName,
        "ロンドン グルメ",
      ],
      ...(dish.image ? { images: [dish.image] } : {}),
    });
  }

  const shop = await fetchShop(params.slug);
  if (!shop || !meetsShopPageStandard(shop)) return {};

  const cheapest = cheapestBudget(budgetExamples(shop));
  const checked = formatCheckedDate(shop.factsCheckedAt);
  const image = shop.image ?? shop.photos[0]?.url;
  return buildPageMetadata({
    path: shopPath(shop.slug),
    title: shopTitle(shop),
    description: `${shop.blurb} 公式で確かめた予約の条件と、頼むものの価格${
      cheapest ? `(予算の例 ${formatGbp(cheapest.total)}〜)` : ""
    }、店の場所と近くの観光スポット。${checked}確認。`,
    type: "article",
    keywords: [
      shop.engName,
      `${shop.engName} 予約`,
      `${shop.name} ロンドン`,
      ...(shop.cuisine ? [`ロンドン ${shop.cuisine}`] : []),
    ],
    modifiedTime: shop.factsCheckedAt?.toISOString().slice(0, 10),
    ...(image ? { images: [image] } : {}),
  });
}

async function fxOrNull(): Promise<FxRate | null> {
  try {
    return await fetchGbpJpyRate();
  } catch {
    return null;
  }
}

export default async function RestaurantSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const dish = await fetchDish(params.slug);

  if (dish) {
    const [shops, allDishes] = await Promise.all([
      fetchShopsOfDish(dish.id),
      fetchDishes(),
    ]);
    const others = allDishes.filter((d) => d.slug !== dish.slug);
    return <DishView dish={dish} shops={shops} others={others} />;
  }

  const shop = await fetchShop(params.slug);
  if (!shop || !meetsShopPageStandard(shop)) notFound();

  const branches = mappedBranches(shop);
  const [nearby, allShops, fx] = await Promise.all([
    branches.length === 1
      ? fetchNearbyAttractions({ lat: branches[0].lat, lng: branches[0].lng }, "", 4)
      : Promise.resolve([]),
    fetchAllShops(),
    fxOrNull(),
  ]);

  // 同じ料理の店(料理を持たない店は、同じく料理を持たない店)。
  const siblings = allShops.filter(
    (s) => s.id !== shop.id && s.dishId === shop.dishId,
  );
  const relatedShops = siblings
    .filter((s) => shop.dishId != null || meetsShopPageStandard(s))
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      engName: s.engName,
      blurb: s.blurb,
      href: meetsShopPageStandard(s)
        ? shopPath(s.slug)
        : `${dishPath(s.dish?.slug ?? "")}#${s.slug}`,
    }));

  return (
    <ShopView
      shop={shop}
      nearby={nearby.map((spot) => ({
        slug: spot.slug,
        name: spot.name,
        image: spot.image,
        distanceKm: spot.distanceKm,
        durationText: spot.durationText,
      }))}
      relatedShops={relatedShops}
      inMustVisit={mustVisitShopSlugs.includes(shop.slug)}
      fx={fx}
    />
  );
}
