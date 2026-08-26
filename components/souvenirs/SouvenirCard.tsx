import type { Souvenir } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ImageCredit from "@/components/shared/ImageCredit";
import {
  SOUVENIR_CATEGORY_LABELS,
  souvenirPath,
  type SouvenirCategory,
} from "./categories";

/**
 * 画像が無いときの代替。
 *
 * 灰色のプレースホルダを置かないのは、「読み込みに失敗した」ように見えて
 * ページ全体が壊れて見えるから。英名を大きく組んだ面にしておけば、
 * 画像のある品と並べても意図した装丁として通る。
 */
function ImageFallback({ souvenir }: { souvenir: Souvenir }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 px-6 text-center dark:from-slate-800 dark:to-slate-900">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {SOUVENIR_CATEGORY_LABELS[souvenir.category as SouvenirCategory] ??
          "Souvenir"}
      </span>
      <span className="text-lg font-semibold leading-snug text-slate-700 dark:text-slate-200">
        {souvenir.engName ?? souvenir.name}
      </span>
    </div>
  );
}

export default function SouvenirCard({ souvenir }: { souvenir: Souvenir }) {
  return (
    <Card
      id={souvenir.slug}
      className="scroll-mt-20 overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70"
    >
      <div className="relative aspect-[16/10] w-full">
        {souvenir.image ? (
          <img
            src={souvenir.image}
            alt={souvenir.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        ) : (
          <ImageFallback souvenir={souvenir} />
        )}
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          <ImageCredit
            source={souvenir.imageSource}
            credit={souvenir.imageCredit}
            link={souvenir.imageLink}
          />

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-lg font-bold leading-snug">
              <Link
                href={souvenirPath(souvenir.slug)}
                className="hover:text-sky-700 hover:underline dark:hover:text-sky-300"
              >
                {souvenir.name}
              </Link>
            </h3>
            {souvenir.engName && (
              <span className="text-xs italic text-muted-foreground">
                {souvenir.engName}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {souvenir.blurb}
          </p>
        </div>

        <dl className="space-y-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
          {souvenir.priceRange && (
            <div className="flex gap-2">
              <dt className="w-16 flex-none text-xs font-semibold text-muted-foreground">
                価格の目安
              </dt>
              <dd className="font-medium">{souvenir.priceRange}</dd>
            </div>
          )}

          {souvenir.buyAt.length > 0 && (
            <div className="flex gap-2">
              <dt className="w-16 flex-none pt-0.5 text-xs font-semibold text-muted-foreground">
                買える場所
              </dt>
              <dd className="flex flex-wrap gap-1">
                {souvenir.buyAt.map((place) => (
                  <Badge key={place} variant="secondary" className="font-normal">
                    {place}
                  </Badge>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {/*
          本文はここに展開せず詳細ページへ送る。以前は <details> に
          全文を持たせていたが、同じ本文が一覧と詳細の両方に出ると
          重複扱いになり、どちらを出すかを検索エンジンに選ばせることになる。
          一覧は「選ぶための面」に徹し、読ませるのは詳細側に一本化する。
        */}
        <Link
          href={souvenirPath(souvenir.slug)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:underline dark:text-sky-300"
        >
          {souvenir.name}を詳しく見る
          <span aria-hidden>→</span>
        </Link>
      </CardContent>
    </Card>
  );
}
