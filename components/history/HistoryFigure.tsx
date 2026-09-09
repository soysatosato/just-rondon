import ImageCredit from "@/components/shared/ImageCredit";
import type { HistoryFigure as Figure } from "./types";

/**
 * 章の節に添える写真。
 *
 * キャプションと出典表記を画像と同じ figure に閉じ込める
 * (components/shopping/ShoppingFigure.tsx と同じ理由——Commons の CC 画像は
 * 作者名とライセンスの表示が条件なので、画像だけを切り離せる形にしない)。
 *
 * 通史なので中身は写真・版画・地図・写本と幅がある。縦横比を持たせず
 * 16:9 に切り揃えているのは、節ごとに版面が伸び縮みすると、10章ぶんの
 * 記事が「画像の大きさで章の重さが決まっている」ように見えるため。
 * 肖像や像で顔が切れるものだけ focus="top" で寄せを変える。
 *
 * next/image は通していない。next.config.mjs で unoptimized: true に
 * している間は最適化が効かず、挟んでも遠回りになるだけ。
 */
export default function HistoryFigure({
  figure,
  className = "",
}: {
  figure: Figure;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={figure.image}
          alt={figure.alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: figure.focus ?? "center" }}
          loading="lazy"
          fetchPriority="low"
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
