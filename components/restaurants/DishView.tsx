import Link from "next/link";
import { ArrowRight, Clock, Wallet } from "lucide-react";
import type { Dish } from "@prisma/client";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import ImageCredit from "@/components/shared/ImageCredit";
import ViewTracker from "@/components/analytics/ViewTracker";
import RestaurantCard from "@/components/restaurants/RestaurantCard";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { IMAGE_SIZES, responsiveImage } from "@/lib/wikimedia-image";
import {
  budgetExamples,
  cheapestBudget,
  formatCheckedDate,
  formatGbp,
  meetsShopPageStandard,
  shopPath,
  shopScenes,
  type ShopWithRelations,
} from "@/lib/restaurants/shop";
import {
  RESTAURANT_BASE,
  RESTAURANT_SECTION_NAME,
  dishJsonLd,
  dishPath,
  type DishWithRestaurants,
} from "@/components/restaurants/meta";

/** 料理ページの価格の目安を調べた時期(店のページを持たない店の priceRange)。 */
export const RESTAURANT_PRICES_RECORDED = "2026年8月";

type OtherDish = Pick<Dish, "id" | "slug" | "name" | "image"> & {
  restaurants: unknown[];
};

/**
 * 料理ページ。役目を「料理の説明」と「店を選ぶための比較」に絞る。
 *
 * 以前は店の情報が2.5画面目からカード1枚ずつ続き、並べて比べられなかった。
 * 比べる表を写真の直後に置き、店の詳しい話は店のページへ渡す。
 * 店のページを持たない店(公開基準を満たさない店)はカードのまま載せる。
 */
export default function DishView({
  dish,
  shops,
  others,
}: {
  dish: DishWithRestaurants;
  shops: ShopWithRelations[];
  others: OtherDish[];
}) {
  const rows = shops.map((shop) => {
    const hasPage = meetsShopPageStandard(shop);
    const examples = hasPage ? budgetExamples(shop) : [];
    const cheapest = cheapestBudget(examples);
    return {
      shop,
      hasPage,
      href: hasPage ? shopPath(shop.slug) : `#${shop.slug}`,
      budget: cheapest
        ? `${formatGbp(cheapest.total)}〜`
        : shop.priceRange
          ? `${shop.priceRange}(目安)`
          : "—",
      booking:
        shop.walkIn === true
          ? "予約なしでも入れる"
          : shop.bookingRequired
            ? "要予約"
            : "予約なしで入れる",
      scenes: hasPage ? shopScenes(shop, examples) : [],
      checked: hasPage ? formatCheckedDate(shop.factsCheckedAt) : null,
    };
  });

  const pageShops = rows.filter((r) => r.hasPage);
  const cardShops = rows.filter((r) => !r.hasPage);
  const required = shops.filter((s) => s.bookingRequired).length;
  const bookingSummary =
    shops.length === 0
      ? null
      : required === shops.length
        ? "どの店も要予約"
        : required > 0
          ? "要予約の店あり"
          : "予約なしで入れる店ばかり";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            { name: RESTAURANT_SECTION_NAME, path: RESTAURANT_BASE },
            [{ name: dish.name, path: dishPath(dish.slug) }],
          ),
          dishJsonLd(dish),
        ]}
      />

      <Breadcrumbs path="/restaurants" current={dish.name} />

      <header className="mt-6 space-y-2">
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {dish.name}
          <span className="ml-2 text-base font-normal italic text-muted-foreground">
            {dish.engName}
          </span>
        </h1>
        <p className="text-base font-medium leading-relaxed text-sky-800 dark:text-sky-300">
          {dish.tagline}
        </p>
      </header>

      {dish.image && (
        <figure className="mt-5">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
            <img
              {...responsiveImage(dish.image, IMAGE_SIZES.article)}
              alt={dish.name}
              className="absolute inset-0 h-full w-full object-cover"
              decoding="async"
              fetchPriority="high"
            />
          </div>
          <figcaption className="mt-1.5">
            <ImageCredit
              source={dish.imageSource}
              credit={dish.imageCredit}
              link={dish.imageLink}
            />
          </figcaption>
        </figure>
      )}

      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
        {dish.priceRange && (
          <span className="inline-flex items-center gap-1">
            <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden />
            {dish.priceRange}
          </span>
        )}
        {dish.bestTime && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
            {dish.bestTime}
          </span>
        )}
        {bookingSummary && (
          <span className="text-muted-foreground">{bookingSummary}</span>
        )}
      </p>

      {/* 店を比べる。スマホでも横スクロールにせず、1店1行で積む。 */}
      {rows.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold sm:text-2xl">
            {dish.name}の店を比べる
          </h2>
          <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {rows.map((r) => (
              <li key={r.shop.id} className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <Link
                    href={r.href}
                    className="text-base font-bold text-sky-800 hover:underline dark:text-sky-300"
                  >
                    {r.shop.name}
                    <span className="ml-1.5 text-xs font-normal italic text-muted-foreground">
                      {r.shop.engName}
                    </span>
                  </Link>
                  {r.hasPage && (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      店のページあり
                    </span>
                  )}
                </div>
                <dl className="mt-1.5 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">エリア</dt>
                    <dd className="font-medium">{r.shop.area}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">予算</dt>
                    <dd className="font-medium tabular-nums">{r.budget}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">予約</dt>
                    <dd className="font-medium">{r.booking}</dd>
                  </div>
                </dl>
                {r.scenes.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1">
                    {r.scenes.map((s) => (
                      <li
                        key={s.id}
                        title={s.basis}
                        className="rounded-full border border-slate-300 px-2 py-0.5 text-[12px] dark:border-slate-600"
                      >
                        {s.label}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            「店のページあり」の店の予算は、公式メニューの価格を足してサービス料を上乗せした例で、確認日は各店のページにあります。それ以外の店の予算は{RESTAURANT_PRICES_RECORDED}に調べた目安です。
          </p>
        </section>
      )}

      {dish.howTo && (
        <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <h2 className="mb-1 text-xl font-semibold">頼み方・食べ方</h2>
          <MarkdownBody className="text-base">{dish.howTo}</MarkdownBody>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-1 text-xl font-semibold">
          {dish.name}とは何なのか
        </h2>
        <MarkdownBody className="text-base">{dish.body}</MarkdownBody>
      </section>

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="mt-8" />

      {pageShops.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold sm:text-2xl">
            店のページがある店
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {pageShops.map(({ shop, checked }) => (
              <li key={shop.id}>
                <Link
                  href={shopPath(shop.slug)}
                  className="group block h-full overflow-hidden rounded-xl border border-slate-200 transition hover:border-sky-400 dark:border-slate-700"
                >
                  {(shop.image ?? shop.photos[0]?.url) && (
                    <div className="relative aspect-[16/9] w-full bg-muted">
                      <img
                        {...responsiveImage(
                          (shop.image ?? shop.photos[0]?.url) as string,
                          IMAGE_SIZES.grid2,
                        )}
                        alt={shop.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5 p-4">
                    <p className="text-base font-bold">
                      {shop.name}
                      <span className="ml-1.5 text-xs font-normal italic text-muted-foreground">
                        {shop.engName}
                      </span>
                    </p>
                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {shop.blurb}
                    </p>
                    <p className="flex items-center gap-1 text-sm font-semibold text-sky-700 dark:text-sky-300">
                      頼むもの・予算・入り方を見る
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </p>
                    {checked && (
                      <p className="text-xs text-muted-foreground">
                        {checked}に公式で確認
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {cardShops.length > 0 && (
        <section className="mt-12 space-y-5">
          <div className="space-y-2 border-b border-slate-200 pb-3 dark:border-slate-700">
            <h2 className="text-xl font-semibold sm:text-2xl">
              {pageShops.length > 0 ? "ほかの店" : `${dish.name}が食べられる店`}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              長く続いている店を中心に選びました。価格は{RESTAURANT_PRICES_RECORDED}に調べた目安です。
              <strong className="font-semibold">
                営業時間・定休日・価格は変わります。
              </strong>
              行く前に公式サイトで確認してください。
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {cardShops.map(({ shop }) => (
              <RestaurantCard key={shop.id} restaurant={shop} />
            ))}
          </div>
        </section>
      )}

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      {others.length > 0 && (
        <section className="mt-12 space-y-3">
          <h2 className="text-lg font-semibold">ほかの料理</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {others.map((d) => (
              <li key={d.id}>
                <Link href={dishPath(d.slug)} className="group block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                    {d.image && (
                      <img
                        {...responsiveImage(d.image, IMAGE_SIZES.grid3)}
                        alt={d.name}
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-semibold group-hover:underline">
                    {d.name}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      ({d.restaurants.length}軒)
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="pt-1 text-sm">
            <Link
              href={RESTAURANT_BASE}
              className="font-semibold text-sky-700 hover:underline dark:text-sky-300"
            >
              レストランの入口に戻る →
            </Link>
          </p>
        </section>
      )}

      <ViewTracker targetType="dish" slug={dish.slug} />
    </div>
  );
}
