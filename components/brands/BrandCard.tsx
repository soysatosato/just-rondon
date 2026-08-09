import Link from "next/link";
import type { Brand } from "@prisma/client";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BRAND_CATEGORY_LABELS,
  brandPath,
  type BrandCategory,
} from "./meta";

/**
 * 画像が無いときの代替。
 *
 * 灰色のプレースホルダを置かないのは、「読み込みに失敗した」ように見えて
 * ページ全体が壊れて見えるから。ブランドは英語のワードマークで認知されているので、
 * 英名を大きく組んだ面にしておけば写真のある社と並べても意図した装丁として通る。
 */
function ImageFallback({ brand }: { brand: Brand }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 px-6 text-center dark:from-slate-800 dark:to-slate-900">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {BRAND_CATEGORY_LABELS[brand.category as BrandCategory] ?? "Brand"}
      </span>
      <span className="text-xl font-semibold leading-snug tracking-tight text-slate-700 dark:text-slate-200">
        {brand.engName}
      </span>
    </div>
  );
}

export default function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link href={brandPath(brand.slug)} className="block">
      <Card className="h-full overflow-hidden border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70">
        <div className="relative aspect-[16/10] w-full">
          {brand.image ? (
            <img
              src={brand.image}
              alt={brand.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          ) : (
            <ImageFallback brand={brand} />
          )}
        </div>

        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-lg font-bold leading-snug">{brand.name}</h3>
            <span className="text-xs italic text-muted-foreground">
              {brand.engName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {brand.founded && (
              <Badge variant="secondary" className="font-normal">
                {brand.founded}年創業
              </Badge>
            )}
            {brand.royalWarrant && (
              <Badge
                variant="outline"
                className="gap-1 border-amber-600/40 bg-amber-600/10 font-normal text-amber-700 dark:text-amber-400"
              >
                <Crown className="h-3 w-3" />
                王室御用達
              </Badge>
            )}
            {brand.priceRange && (
              <Badge variant="secondary" className="font-normal">
                {brand.priceRange}
              </Badge>
            )}
          </div>

          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {brand.blurb}
          </p>

          <p className="text-right text-xs font-medium text-sky-600 dark:text-sky-300">
            詳しく見る →
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
