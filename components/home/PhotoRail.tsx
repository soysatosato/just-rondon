import Link from "next/link";

import type { RailItem } from "@/utils/actions/home";

/**
 * 写真を横一列に並べる棚。トップの「見る・する」はこれの繰り返しで作る。
 *
 * 縦積みのカードグリッドをやめた理由は2つ。
 *
 * 1. 縦の長さ。1区分3枚のグリッドを5区分ぶん縦に積むと、それだけで
 *    5画面になる。横スクロールなら1区分あたり1/3画面で収まり、
 *    しかも見せられる件数は3枚から10枚以上に増える。
 * 2. 中身。アイコン+見出しのカードは「その先に何があるか」を
 *    説明はするが見せない。名所も美術館も料理も、写真と固有名詞を
 *    並べたほうが速い。
 *
 * 棚の中は「もっと見る」で終わらせず、最後にハブへのタイルを置く。
 * 横スクロールは端まで行ったことに気づきにくいので、終点を明示する。
 */
export default function PhotoRail({
  eyebrow,
  title,
  description,
  href,
  moreLabel,
  items,
  accentClassName = "bg-red-600",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href: string;
  moreLabel: string;
  items: RailItem[];
  accentClassName?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className={`h-3 w-0.5 shrink-0 rounded-full ${accentClassName}`} />
            {eyebrow}
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h3>
          {description && (
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {description}
            </p>
          )}
        </div>

        <Link
          href={href}
          className="hidden shrink-0 whitespace-nowrap text-xs font-semibold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline sm:block"
        >
          {moreLabel} →
        </Link>
      </div>

      {/*
        コンテナの左右パディングぶん外に出してから同じだけ内側に戻す。
        こうしないと、横スクロールの右端が本文の右端で切れて、
        「まだ続きがある」ことが見えなくなる。
      */}
      <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex snap-x snap-mandatory gap-3 sm:gap-4">
          {items.map((item) => (
            <li key={item.href} className="snap-start">
              <RailCard item={item} />
            </li>
          ))}
          <li className="snap-start">
            <Link
              href={href}
              className="group flex h-full w-[128px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center transition hover:border-foreground/40 hover:bg-muted/50 sm:w-[150px]"
            >
              <span className="text-xs font-semibold leading-snug">
                {moreLabel}
              </span>
              <span className="text-lg text-muted-foreground transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function RailCard({ item }: { item: RailItem }) {
  return (
    <Link href={item.href} className="group block w-[178px] sm:w-[212px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      {item.engName && (
        <p className="mt-2.5 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {item.engName}
        </p>
      )}
      <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug decoration-1 underline-offset-2 group-hover:underline">
        {item.name}
      </p>
      {item.blurb && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.blurb}
        </p>
      )}
    </Link>
  );
}
