import type { Souvenir } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import {
  SOUVENIR_CATEGORY_LABELS,
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

/**
 * 画像の出典表記。
 *
 * Wikimedia Commons の CC 画像は作者名とライセンス名の表示が条件なので、
 * imageSource が commons のときは省略できない。
 * 将来アフィリエイトAPI由来の画像を混ぜたときも、ここで分岐を足す。
 */
function ImageCredit({ souvenir }: { souvenir: Souvenir }) {
  if (souvenir.imageSource !== "commons" || !souvenir.imageCredit) return null;

  return (
    <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
      画像:{" "}
      {souvenir.imageLink ? (
        <a
          href={souvenir.imageLink}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80"
        >
          {souvenir.imageCredit}
        </a>
      ) : (
        souvenir.imageCredit
      )}
    </p>
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
          <ImageCredit souvenir={souvenir} />

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-lg font-bold leading-snug">{souvenir.name}</h3>
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
          Radix の Collapsible ではなく <details> を使う。
          閉じている間も本文が DOM に残るので検索エンジンに読まれ、
          クライアントコンポーネントにしなくて済む。
        */}
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-sky-700 hover:underline dark:text-sky-300">
            <span className="group-open:hidden">詳しく読む</span>
            <span className="hidden group-open:inline">閉じる</span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
            <MarkdownBody>{souvenir.body}</MarkdownBody>

            {souvenir.tips && (
              <p className="mt-4 rounded-lg border-l-4 border-amber-400 bg-amber-50 py-2 pl-3 pr-2 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                <span className="font-semibold">ひとこと: </span>
                {souvenir.tips}
              </p>
            )}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
