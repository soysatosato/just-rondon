import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { shoppingGuideHero } from "./content";
import { shoppingGuidePath } from "./guides";
import type { ShoppingGuideMeta } from "./guides";

/**
 * 記事へのカード。ハブと記事下部の「ほかの買い物ガイド」で共用する。
 *
 * 写真は記事の hero を流用する。カード専用の1枚を別に選ぶと、
 * 開いた先の写真と違うものが出て「押し間違えた」と読ませてしまう。
 *
 * 出典表記はカードには出していない。CC の条件は表示媒体ごとに
 * 満たす必要があるが、リンク先の記事に同じ写真と作者名が必ず出る形に
 * してある(hero を共用しているのはそのためでもある)。
 */
export default function ShoppingGuideCard({
  meta,
}: {
  meta: ShoppingGuideMeta;
}) {
  const hero = shoppingGuideHero(meta.slug);

  return (
    <Link href={shoppingGuidePath(meta.slug)} className="block">
      <Card className="overflow-hidden border-gray-300 bg-white shadow-sm transition hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-500">
        <div className="sm:flex">
          {hero && (
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-neutral-800 sm:aspect-auto sm:h-auto sm:w-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.image}
                alt={hero.alt}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                fetchPriority="low"
                decoding="async"
              />
            </div>
          )}
          <CardContent className="p-5">
            <span className="block text-xs font-semibold text-emerald-600">
              {meta.eyebrow}
            </span>
            <span className="mt-1 block text-base font-semibold">
              {meta.label}
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {meta.blurb}
            </span>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
