import Link from "next/link";


/**
 * タイルに出す1枚ぶん。utils/actions/home.ts の RailItem がそのまま通る形に
 * してあるが、型は借りていない。写真の棚を持つのはトップだけではないので、
 * 呼ぶ側がトップの都合(slug を持つ等)に縛られないようにしておく。
 */
export type PhotoTileItem = {
  href: string;
  name: string;
  engName: string | null;
  image: string;
  blurb?: string | null;
};

/**
 * 写真の上に名前を載せるタイル。
 *
 * トップページの棚(PhotoRail)は写真の下に文字を置くが、ここでは重ねる。
 * 区分ハブは「何があるか」を面で見せる場所で、カードを1枚ずつ読み比べる
 * 場所ではない。文字を下に出すと1〜2行で行の高さが揃わず、写真を敷き詰めた
 * 面という意匠がそこで崩れる。
 *
 * next/image は通していない。next.config.mjs で unoptimized: true にして
 * いる間は最適化が効かず、挟んでも遠回りになるだけ。ヒーローの主役だけ
 * eager + fetchPriority で先に取りに行かせる。
 */
export default function PhotoTile({
  item,
  size = "sm",
  className = "",
  priority = false,
}: {
  item: PhotoTileItem;
  /** lg はヒーローの主役、md は帯の中、sm は棚と格子。 */
  size?: "lg" | "md" | "sm";
  className?: string;
  priority?: boolean;
}) {
  const isLg = size === "lg";

  return (
    <Link
      href={item.href}
      className={`group relative block min-h-0 overflow-hidden rounded-lg bg-slate-800 ${className}`}
    >
      <img
        src={item.image}
        alt={item.name}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      {/* 文字を載せる下側だけ暗くする。全面に暗幕をかけると写真を主役に
          した意味が無くなる。 */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      <div
        className={`absolute inset-x-0 bottom-0 ${isLg ? "p-4 sm:p-5" : "p-2.5 sm:p-3"}`}
      >
        {item.engName && (
          <p
            className={`truncate font-semibold uppercase tracking-[0.18em] text-white/60 ${
              isLg ? "text-[10px]" : "text-[9px]"
            }`}
          >
            {item.engName}
          </p>
        )}
        <p
          className={`mt-0.5 font-bold leading-tight text-white drop-shadow ${
            isLg ? "text-lg sm:text-2xl" : size === "md" ? "text-sm" : "text-xs sm:text-sm"
          }`}
        >
          {item.name}
        </p>
        {isLg && item.blurb && (
          <p className="mt-1.5 line-clamp-2 max-w-md text-xs leading-relaxed text-white/75">
            {item.blurb}
          </p>
        )}
      </div>
    </Link>
  );
}
