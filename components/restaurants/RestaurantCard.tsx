import type { MenuPick, Restaurant } from "@prisma/client";
import { ExternalLink, MapPin, Train } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import ImageCredit from "@/components/shared/ImageCredit";
import InstagramEmbed from "@/components/shared/InstagramEmbed";
import MenuPicks from "@/components/restaurants/MenuPicks";

/**
 * 写真の無い店の代替。
 *
 * 店の写真は自由に使えるものが揃わないので、画像を持たない店が残る。
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

/**
 * menuPicks を含む店。fetchDish が join して渡す。
 * ImageFallback は素の Restaurant で足りるので型を分けている。
 */
type RestaurantWithPicks = Restaurant & { menuPicks: MenuPick[] };

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: RestaurantWithPicks;
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

        {/*
          「なぜこの店か」(body)の直後に「何を頼むか」を置く。
          店を選び終えた読者が次に詰まるのは席に着いてからで、
          そこを本文が扱っていない。Instagram より前なのは、
          埋め込みが縦に長く、間に挟むと本文と分断されるため。
        */}
        <MenuPicks picks={restaurant.menuPicks} />

        {/*
          店自身の投稿を埋め込む。写真を複製しないので権利上いちばん安全に
          「その店の実物」を出せる。画像のある店にも付けるのは、
          Commons にあるのが外観写真ばかりで、料理が写らないため。
        */}
        {restaurant.instagramUrl && (
          <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              店の公式アカウントより
            </p>
            <InstagramEmbed url={restaurant.instagramUrl} />
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
