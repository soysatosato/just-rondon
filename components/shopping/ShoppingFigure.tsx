import ImageCredit from "@/components/shared/ImageCredit";
import type { ShoppingGuideFigure } from "./types";

/**
 * 買い物ガイドの写真。
 *
 * キャプションと出典表記を必ず画像と同じブロックに置く
 * (components/brands/BrandFigure.tsx と同じ理由——Commons の CC 画像は
 * 作者名とライセンスの表示が条件なので、画像だけを流用できる形にしない)。
 *
 * next/image は通していない。next.config.mjs で unoptimized: true に
 * している間は最適化が効かず、挟んでも遠回りになるだけ。
 * 記事の顔(hero)だけ eager + fetchPriority=high で先に取りに行かせる。
 */
export default function ShoppingFigure({
  figure,
  priority = false,
  className = "",
}: {
  figure: ShoppingGuideFigure;
  /** 記事上部の1枚だけ true。 */
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={figure.image}
          alt={figure.alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "low"}
          decoding="async"
        />
      </div>
      <figcaption className="mt-2 space-y-0.5">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {figure.caption}
        </p>
        <ImageCredit
          source={figure.imageSource}
          credit={figure.imageCredit}
          link={figure.imageLink}
        />
      </figcaption>
    </figure>
  );
}
