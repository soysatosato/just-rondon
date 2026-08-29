import Link from "next/link";
import type { Brand } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { BRAND_BASE, BRAND_CATEGORY_LABELS, brandPath, type BrandCategory } from "./meta";

/** 出す件数。2列×3行で収まる数にして、記事の末尾がリンクの壁にならないようにする。 */
const MAX_RELATED = 6;

/**
 * 同じカテゴリを先に、足りない分を他カテゴリから埋める。
 *
 * バーバリーを読み終えた人の次の一手はポール・スミスであって紅茶ではない。
 * ただし靴が4社しかないように分母の小さいカテゴリがあるので、
 * 同カテゴリだけで打ち切らず displayOrder の順に補充する。
 */
function pickRelated(all: Brand[], current: Brand): Brand[] {
  const others = all.filter((b) => b.slug !== current.slug);
  const sameCategory = others.filter((b) => b.category === current.category);
  const rest = others.filter((b) => b.category !== current.category);
  return [...sameCategory, ...rest].slice(0, MAX_RELATED);
}

/**
 * 記事末尾の他ブランド導線。
 *
 * 名前だけのリンクを19個並べても、読者はどれを踏むか決められない。
 * ハブと同じ「写真・和名・英名・一行」の組で出して、
 * 一覧ページの縮小版として読めるようにする。
 */
export default function BrandRelated({
  all,
  current,
}: {
  all: Brand[];
  current: Brand;
}) {
  const related = pickRelated(all, current);
  if (related.length === 0) return null;

  return (
    <section className="mt-12 space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-200 pb-3 dark:border-slate-700">
        <h2 className="text-xl font-semibold sm:text-2xl">
          ほかのイギリスブランド
        </h2>
        <Link
          href={BRAND_BASE}
          className="group inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline dark:text-sky-300"
        >
          全{all.length}ブランドを見る
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {related.map((b) => (
          <li key={b.id}>
            <Link
              href={brandPath(b.slug)}
              className="group flex h-full overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="relative w-24 flex-none self-stretch bg-slate-100 dark:bg-slate-800">
                {b.image ? (
                  <img
                    src={b.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                ) : (
                  /* 灰色の空箱を置くと壊れて見えるので、ワードマークで面を埋める。 */
                  <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-2 text-center text-[11px] font-semibold leading-tight text-slate-600 dark:from-slate-800 dark:to-slate-900 dark:text-slate-300">
                    {b.engName}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 p-3">
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <h3 className="text-sm font-bold leading-snug group-hover:underline">
                    {b.name}
                  </h3>
                  <span className="text-[11px] italic text-muted-foreground">
                    {b.engName}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {BRAND_CATEGORY_LABELS[b.category as BrandCategory] ?? "ブランド"}
                  {b.founded ? ` · ${b.founded}年創業` : ""}
                </p>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                  {b.blurb}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
