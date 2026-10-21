import ImageCredit from "@/components/shared/ImageCredit";
import { cn } from "@/lib/utils";
import { IMAGE_SIZES, responsiveImage } from "@/lib/wikimedia-image";

/**
 * 本文の冒頭に置く写真1枚と、その出典表記。
 *
 * 組み方は読み物の主画像(components/column/ColumnDetail.tsx)と同じ。
 * 写真は og:image と JSON-LD の image にも使うので、ページに出ている写真と
 * 検索結果・Discover の画像が同じものになる。
 *
 * 出典は Wikimedia Commons の CC 画像だけを想定している。作者とライセンスの
 * 表示が利用の条件なので、credit を省略できる形にしない。
 */
export default function PagePhoto({
  url,
  alt,
  credit,
  link,
  className,
}: {
  url: string;
  alt: string;
  credit: string;
  link: string | null;
  className?: string;
}) {
  return (
    <figure className={cn("space-y-1.5", className)}>
      <div className="relative h-56 w-full overflow-hidden rounded-xl sm:h-72 md:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...responsiveImage(url, IMAGE_SIZES.article)}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          // 冒頭の写真はスマホでも最初の画面に入りうる(LCP の候補)。
          // 遅延読み込みにすると最後に読み込まれる。
          loading="eager"
          decoding="async"
        />
      </div>
      <ImageCredit source="commons" credit={credit} link={link} />
    </figure>
  );
}
