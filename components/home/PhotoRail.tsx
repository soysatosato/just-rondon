import Link from "next/link";

import RailScroller from "@/components/home/RailScroller";

import type { RailItem } from "@/utils/actions/home";
import { responsiveImage } from "@/lib/wikimedia-image";

/**
 * 写真を横一列に並べる棚。トップの「見る・する」と観光ハブの棚がこれを使う。
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
  eyebrow?: string;
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
          {eyebrow && (
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              <span className={`h-3 w-0.5 shrink-0 rounded-full ${accentClassName}`} />
              {eyebrow}
            </p>
          )}
          <h3
            className={`text-xl font-bold tracking-tight sm:text-2xl ${eyebrow ? "mt-2" : ""}`}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <Link
          href={href}
          prefetch={false}
          className="hidden shrink-0 whitespace-nowrap text-xs font-semibold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline sm:block"
        >
          {moreLabel} →
        </Link>
      </div>

      <RailList title={title} href={href} moreLabel={moreLabel} items={items} />
    </div>
  );
}

/**
 * 棚の横スクロールの部分だけ。トップの切り替え式の棚(RailTabs)は見出しを
 * 自分で持つので、これを直接使う。
 *
 * カードのリンクは先読みしない。棚は1本に12枚あり、画面に入るたびに
 * Next.js が行き先のページを読み込んでいた(トップ全体で105ページ・3.4MB)。
 * 写真の候補は500pxで打ち切る。カードは幅178〜212pxなので、3倍密度の
 * 画面でもこれで足りる(打ち切らないと960pxを選んでいた)。
 */
export function RailList({
  title,
  href,
  moreLabel,
  items,
}: {
  /** ボタンの読み上げ名に使う(「見逃せない名所を次へ」)。 */
  title: string;
  href: string;
  moreLabel: string;
  items: RailItem[];
}) {
  return (
    <RailScroller label={title}>
      <ul className="flex snap-x snap-mandatory gap-3 sm:gap-4">
        {items.map((item) => (
          <li key={item.href} className="snap-start">
            <RailCard item={item} />
          </li>
        ))}
        <li className="snap-start">
          <Link
            href={href}
            prefetch={false}
            className="group flex h-full w-[128px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center transition hover:border-foreground/40 hover:bg-muted/50 sm:w-[150px]"
          >
            <span className="text-sm font-semibold leading-snug">
              {moreLabel}
            </span>
            <span className="text-lg text-muted-foreground transition group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </li>
      </ul>
    </RailScroller>
  );
}

function RailCard({ item }: { item: RailItem }) {
  return (
    <Link
      href={item.href}
      prefetch={false}
      className="group block w-[178px] sm:w-[212px]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        <img
          {...responsiveImage(item.image, "(min-width: 640px) 212px, 178px", 500)}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      {item.engName && (
        <p className="mt-2.5 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {item.engName}
        </p>
      )}
      <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug decoration-1 underline-offset-2 group-hover:underline">
        {item.name}
      </p>
      {item.blurb && (
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {item.blurb}
        </p>
      )}
    </Link>
  );
}
