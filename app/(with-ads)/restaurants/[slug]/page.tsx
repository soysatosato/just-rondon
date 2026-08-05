import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Wallet } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import ImageCredit from "@/components/shared/ImageCredit";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { fetchDish, fetchDishSlugs, fetchDishes } from "@/utils/actions/dishes";
import RestaurantCard from "@/components/restaurants/RestaurantCard";
import {
  RESTAURANT_BASE,
  RESTAURANT_SECTION_NAME,
  dishJsonLd,
  dishPath,
} from "@/components/restaurants/meta";

export async function generateStaticParams() {
  const slugs = await fetchDishSlugs();
  return slugs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const dish = await fetchDish(params.slug);
  if (!dish) return {};

  return buildPageMetadata({
    path: dishPath(dish.slug),
    title: `ロンドンの${dish.name}｜${dish.tagline}`,
    description: `${dish.summary} ${dish.name}(${dish.engName})が食べられるロンドンの店を${dish.restaurants.length}軒、エリア・最寄り駅・価格帯つきで紹介します。`,
    type: "article",
    keywords: [
      `ロンドン ${dish.name}`,
      `${dish.name} おすすめ`,
      dish.engName,
      "イギリス料理",
      "ロンドン グルメ",
    ],
    ...(dish.image ? { images: [dish.image] } : {}),
  });
}

export default async function DishPage({
  params,
}: {
  params: { slug: string };
}) {
  const dish = await fetchDish(params.slug);
  if (!dish) notFound();

  // 「次にどれを読むか」を切らさないための他料理リンク。
  const others = (await fetchDishes()).filter((d) => d.slug !== dish.slug);

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

      <BreadCrumbs
        name={RESTAURANT_SECTION_NAME}
        name2={dish.name}
        link="restaurants"
      />

      <header className="mt-6 space-y-3">
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
        <figure className="mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
            <img
              src={dish.image}
              alt={dish.name}
              className="absolute inset-0 h-full w-full object-cover"
              decoding="async"
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

      {(dish.priceRange || dish.bestTime) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {dish.priceRange && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <Wallet className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  価格の目安
                </p>
                <p className="text-sm font-medium">{dish.priceRange}</p>
              </div>
            </div>
          )}
          {dish.bestTime && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <Clock className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  食べる時間帯
                </p>
                <p className="text-sm font-medium">{dish.bestTime}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-1 text-xl font-semibold">
          {dish.name}とは何なのか
        </h2>
        <MarkdownBody className="text-base">{dish.body}</MarkdownBody>
      </section>

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="mt-8" />

      {dish.howTo && (
        <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <h2 className="mb-1 text-xl font-semibold">頼み方・食べ方</h2>
          <MarkdownBody className="text-base">{dish.howTo}</MarkdownBody>
        </section>
      )}

      <section className="mt-12 space-y-5">
        <div className="space-y-2 border-b border-slate-200 pb-3 dark:border-slate-700">
          <h2 className="text-xl font-semibold sm:text-2xl">
            {dish.name}が食べられる店
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            長く続いている店を中心に選びました。
            <strong className="font-semibold">
              営業時間・定休日・価格は変わります。
            </strong>
            行く前に公式サイトで確認してください。
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {dish.restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <section className="mt-12 space-y-3 rounded-lg border border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-lg font-semibold">ほかのイギリス料理</h2>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {others.map((d) => (
            <li key={d.id}>
              <Link
                href={dishPath(d.slug)}
                className="text-sky-700 hover:underline dark:text-sky-300"
              >
                {d.name}
              </Link>
              <span className="ml-1 text-xs text-muted-foreground">
                （{d.restaurants.length}軒）
              </span>
            </li>
          ))}
        </ul>
        <p className="pt-2 text-sm">
          <Link
            href={RESTAURANT_BASE}
            className="font-semibold text-sky-700 hover:underline dark:text-sky-300"
          >
            イギリス料理の一覧に戻る →
          </Link>
        </p>
      </section>
    </div>
  );
}
