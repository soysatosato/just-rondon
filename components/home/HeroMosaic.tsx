import Link from "next/link";

import type { RailItem } from "@/utils/actions/home";

/**
 * ヒーロー右半分の写真モザイク。
 *
 * 以前は全画面のクロスフェード・スライドショーを敷き、その上に文字を
 * 重ねていた。写真は大きく出るが、(1) 写っている場所の名前が出ないので
 * ただの装飾で終わり、(2) 文字を載せるために暗幕をかけるので写真自体も
 * くすみ、(3) どこにもクリックできる先が無かった。
 *
 * ここでは写真を文字の下敷きにするのをやめ、名前つきのタイルとして
 * 並べる。1枚目だけ 2x2 で大きく取るのは、同じ大きさの箱が9個並ぶと
 * 「サムネイル一覧」に見えて、トップの主役として弱くなるため。
 *
 * next/image は通していない。next.config.mjs で unoptimized: true に
 * している間は最適化が効かず、挟んでも遠回りになるだけ。代わりに
 * 1枚目だけ eager + fetchPriority で先に取りに行かせる。
 */
export default function HeroMosaic({ items }: { items: RailItem[] }) {
  if (items.length === 0) return null;

  /*
   * 主役を 2x2 で置くので、格子がちょうど埋まる枚数は決まっている。
   * 3列3行なら 1 + 5 枚、3列2行なら 1 + 2 枚。半端な枚数を流し込むと
   * 右下に穴が空き、写真を敷き詰めた面という意匠がそこで崩れる。
   * 掲載条件(fetchHeroSlides)を厳しくして枚数が減ったときに備えて、
   * 6枚に満たなければ 3x2 に落とす。
   */
  const full = items.length >= 6;
  const tiles = items.slice(0, full ? 6 : 3);
  const [lead, ...rest] = tiles;

  return (
    <div
      className={`grid h-full grid-cols-2 grid-rows-[1.5fr_1fr] gap-1.5 sm:grid-cols-3 ${
        full ? "sm:grid-rows-3" : "sm:grid-rows-2"
      }`}
    >
      <Tile
        item={lead}
        priority
        className="col-span-2 row-span-1 sm:row-span-2"
        size="lead"
      />
      {rest.map((item, i) => (
        <Tile
          key={item.href}
          item={item}
          // モバイルは 2列2行。主役が上段を占めるので、下段の2枚だけ出す。
          className={i >= 2 ? "hidden sm:block" : ""}
          size="small"
        />
      ))}
    </div>
  );
}

function Tile({
  item,
  className = "",
  size,
  priority = false,
}: {
  item: RailItem;
  className?: string;
  size: "lead" | "small";
  priority?: boolean;
}) {
  const isLead = size === "lead";

  return (
    <Link
      href={item.href}
      className={`group relative min-h-0 overflow-hidden rounded-lg bg-slate-800 ${className}`}
    >
      <img
        src={item.image}
        alt={item.name}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      {/* 文字を載せる下側だけ暗くする。全面に暗幕をかけると
          写真を主役にした意味が無くなる。 */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      <div
        className={`absolute inset-x-0 bottom-0 ${isLead ? "p-4 sm:p-5" : "p-2.5 sm:p-3"}`}
      >
        {item.engName && (
          <p
            className={`truncate font-semibold uppercase tracking-[0.18em] text-white/60 ${
              isLead ? "text-[10px]" : "text-[9px]"
            }`}
          >
            {item.engName}
          </p>
        )}
        <p
          className={`mt-0.5 font-bold leading-tight text-white drop-shadow ${
            isLead ? "text-lg sm:text-2xl" : "text-xs sm:text-sm"
          }`}
        >
          {item.name}
        </p>
        {isLead && item.blurb && (
          <p className="mt-1.5 line-clamp-2 max-w-md text-xs leading-relaxed text-white/75">
            {item.blurb}
          </p>
        )}
      </div>
    </Link>
  );
}
