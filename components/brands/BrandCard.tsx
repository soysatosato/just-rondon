import Link from "next/link";
import type { Brand } from "@prisma/client";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BRAND_CATEGORY_LABELS,
  brandPath,
  type BrandCategory,
} from "./meta";
import { responsiveImage } from "@/lib/wikimedia-image";

/**
 * 画像が無いときの代替。
 *
 * 灰色のプレースホルダを置かないのは、「読み込みに失敗した」ように見えて
 * ページ全体が壊れて見えるから。ブランドは英語のワードマークで認知されているので、
 * 英名を大きく組んだ面にしておけば写真のある社と並べても意図した装丁として通る。
 */
function ImageFallback({ brand }: { brand: Brand }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-100 to-slate-200 px-2 text-center dark:from-slate-800 dark:to-slate-900">
      <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {BRAND_CATEGORY_LABELS[brand.category as BrandCategory] ?? "Brand"}
      </span>
      <span className="text-sm font-semibold leading-snug text-slate-700 dark:text-slate-200">
        {brand.engName}
      </span>
    </div>
  );
}

export default function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={brandPath(brand.slug)}
      className="group flex h-full overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-emerald-500 dark:border-slate-800 dark:bg-slate-900/70"
    >
      <div className="relative w-28 flex-none self-stretch sm:w-32">
        {brand.image ? (
          <img
            {...responsiveImage(brand.image, "128px")}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        ) : (
          <ImageFallback brand={brand} />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5 p-3.5">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h3 className="text-base font-bold leading-snug group-hover:underline">
            {brand.name}
          </h3>
          <span className="text-xs italic text-muted-foreground">
            {brand.engName}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
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
              <Crown className="h-3 w-3" aria-hidden />
              王室御用達
            </Badge>
          )}
          {brand.priceRange && (
            <Badge variant="secondary" className="font-normal">
              {brand.priceRange}
            </Badge>
          )}
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {brand.blurb}
        </p>
      </div>
    </Link>
  );
}
