import ImageCredit from "@/components/shared/ImageCredit";

/**
 * コラム・いまのイギリス・イギリス英語の写真。
 *
 * キャプションと出典表記を必ず画像と同じブロックに置く
 * (components/shopping/ShoppingFigure.tsx と同じ理由——Commons の CC 画像は
 * 作者名とライセンスの表示が条件なので、画像だけを流用できる形にしない)。
 *
 * next/image は通していない。next.config.mjs で unoptimized: true に
 * している間は最適化が効かず、挟んでも遠回りになるだけ。
 *
 * crop で見せ方を分ける:
 * - hero(crop) は記事の顔なので横位置に切り抜き、幅いっぱいに敷く。
 * - 節の写真(crop なし)は元の比率のまま出す。被写体が縦に長いことが多く
 *   (電話ボックスも墓標も縦長)、16:9 に切ると頭が落ちる。かわりに
 *   高さの上限だけ決めて、本文の流れを写真1枚で分断しないようにする。
 */
export default function ContentFigure({
  image,
  alt,
  caption,
  source,
  credit,
  link,
  crop = false,
  className = "",
}: {
  image: string;
  alt: string;
  caption?: string | null;
  source?: string | null;
  credit?: string | null;
  link?: string | null;
  /** 記事上部の1枚だけ true。 */
  crop?: boolean;
  className?: string;
}) {
  return (
    /* 節の写真は縦位置だと本文の幅より細くなる。figure を写真の幅に
       合わせておかないと、キャプションだけが本文の幅いっぱいに伸びて
       写真と切り離れて見える。 */
    <figure className={`${crop ? "" : "mx-auto w-fit max-w-full"} ${className}`}>
      {crop ? (
        <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-72 md:h-80 dark:bg-neutral-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={image}
          alt={alt}
          className="max-h-[28rem] w-auto max-w-full rounded-2xl"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      )}
      {(caption || credit) && (
        <figcaption className="mt-2 space-y-0.5">
          {caption && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {caption}
            </p>
          )}
          <ImageCredit
            source={source ?? null}
            credit={credit ?? null}
            link={link ?? null}
          />
        </figcaption>
      )}
    </figure>
  );
}
