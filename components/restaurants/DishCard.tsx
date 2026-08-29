import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ImageCredit from "@/components/shared/ImageCredit";
import { dishPath, type DishWithRestaurants } from "@/components/restaurants/meta";

/**
 * ハブ(/restaurants)の料理カード。
 *
 * 以前は写真を左端の幅224pxの帯に置き、右に文字を詰める横並びのカードだった。
 * 10品すべてに画像があるのに、このページで最も強い素材をサムネイルとして
 * 使っていたことになる。写真を上に大きく置き、文字はその下に組み直した。
 *
 * 予約の要否だけは写真の上のチップに出す。これは10品の中で実際に差がある
 * 数少ない項目で(アフタヌーンティーとサンデーローストは全店要予約、
 * フィッシュ&チップスやベーグルは予約という概念が無い)、旅程を左右する。
 * 価格と時間帯は差が連続的なので、文字の行にまとめている。
 */
export default function DishCard({ dish }: { dish: DishWithRestaurants }) {
  const total = dish.restaurants.length;
  const required = dish.restaurants.filter((r) => r.bookingRequired).length;

  // 掲載店が0軒のときに「予約なしで入れる」と言い切らないよう、
  // 店の有無で分けている。
  const booking =
    total === 0
      ? null
      : required === total
        ? { label: "要予約", strong: true }
        : required > 0
          ? { label: "一部の店は要予約", strong: true }
          : { label: "予約なしで入れる", strong: false };

  return (
    <article className="group">
      <Link href={dishPath(dish.slug)} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
          {dish.image && (
            <img
              src={dish.image}
              alt={dish.name}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          )}

          {booking && (
            <span
              className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm ${
                booking.strong
                  ? "bg-amber-500/95 text-amber-950"
                  : "bg-black/55 text-white"
              }`}
            >
              {booking.label}
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3.5">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {dish.engName}
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
          <Link
            href={dishPath(dish.slug)}
            className="underline-offset-4 hover:underline"
          >
            {dish.name}
          </Link>
        </h2>

        <p className="mt-1.5 text-sm font-medium leading-relaxed text-sky-800 dark:text-sky-300">
          {dish.tagline}
        </p>

        <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {dish.summary}
        </p>

        {/* 価格と時間帯は箱に入れず、中黒でつないだ1行にする。バッジを
            並べると10品ぶんで灰色の粒が60個できて、どれも読まれなくなる。 */}
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
          {dish.priceRange && <span>{dish.priceRange}</span>}
          {dish.priceRange && dish.bestTime && (
            <span aria-hidden="true">・</span>
          )}
          {dish.bestTime && <span>{dish.bestTime}</span>}
        </p>

        <p className="mt-3 flex items-center gap-1 text-sm font-bold text-sky-700 dark:text-sky-300">
          <Link
            href={dishPath(dish.slug)}
            className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
          >
            店を{total}軒みる
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </p>

        <ImageCredit
          source={dish.imageSource}
          credit={dish.imageCredit}
          link={dish.imageLink}
          className="mt-2"
        />
      </div>
    </article>
  );
}
