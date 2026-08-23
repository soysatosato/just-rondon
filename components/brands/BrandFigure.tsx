import type { BrandImage } from "@prisma/client";
import ImageCredit from "@/components/shared/ImageCredit";

/**
 * 本文の途中に挟む図版。
 *
 * キャプションと出典表記を必ず画像と同じブロックに置く。
 * Commons の画像は作者名とライセンスの表記が条件なので、
 * 画像だけを本文に流用できる形にはしない。
 */
export default function BrandFigure({ image }: { image: BrandImage }) {
  const aspectClass =
    image.orientation === "portrait" ? "aspect-[3/4]" : "aspect-[16/9]";
  return (
    <figure className="my-6">
      <div
        className={`relative ${aspectClass} w-full overflow-hidden rounded-xl`}
      >
        <img
          src={image.url}
          alt={image.caption}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption className="mt-2 space-y-0.5">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {image.caption}
        </p>
        <ImageCredit
          source={image.imageSource}
          credit={image.imageCredit}
          link={image.imageLink}
        />
      </figcaption>
    </figure>
  );
}
