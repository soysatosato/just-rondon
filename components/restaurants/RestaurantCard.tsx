import type { Restaurant } from "@prisma/client";
import { ExternalLink, MapPin, Train } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import ImageCredit from "@/components/shared/ImageCredit";

/**
 * 写真の無い店の代替。
 *
 * 店の写真は自由に使えるものが揃わないので、19軒中7軒は画像を持たない。
 * 灰色の空箱を置くと読み込み失敗に見えるため、英名を大きく組んだ面にして
 * 画像のある店と並んでも意図した装丁として読めるようにする。
 */
function ImageFallback({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-stone-100 to-stone-200 px-5 text-center dark:from-stone-800 dark:to-stone-900">
      <span className="text-base font-semibold leading-snug text-stone-700 dark:text-stone-200">
        {restaurant.engName}
      </span>
      <span className="text-xs text-stone-500 dark:text-stone-400">
        {restaurant.area}
      </span>
    </div>
  );
}

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  return (
    <Card
      id={restaurant.slug}
      className="scroll-mt-20 overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70"
    >
      <div className="relative aspect-[16/9] w-full">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        ) : (
          <ImageFallback restaurant={restaurant} />
        )}
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          <ImageCredit
            source={restaurant.imageSource}
            credit={restaurant.imageCredit}
            link={restaurant.imageLink}
          />

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold leading-snug">
              {restaurant.name}
            </h3>
            {restaurant.bookingRequired && (
              <Badge className="bg-rose-100 font-normal text-rose-800 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-200">
                要予約
              </Badge>
            )}
          </div>

          <p className="text-xs italic text-muted-foreground">
            {restaurant.engName}
          </p>

          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {restaurant.blurb}
          </p>
        </div>

        <div className="space-y-1.5 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
            <span>{restaurant.area}</span>
          </p>

          {restaurant.nearestStation && (
            <p className="flex items-start gap-2">
              <Train className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              <span>{restaurant.nearestStation}</span>
            </p>
          )}

          {restaurant.priceRange && (
            <p className="flex items-start gap-2">
              <span className="mt-0.5 w-4 flex-none text-center text-xs font-bold text-muted-foreground">
                £
              </span>
              <span>{restaurant.priceRange}</span>
            </p>
          )}
        </div>

        {restaurant.body && (
          <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
            <MarkdownBody>{restaurant.body}</MarkdownBody>
          </div>
        )}

        {restaurant.website && (
          <a
            href={restaurant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:underline dark:text-sky-300"
          >
            公式サイトで営業時間・予約を確認
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
