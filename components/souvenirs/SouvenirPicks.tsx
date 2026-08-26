import type { SouvenirPick } from "@prisma/client";
import ImageCredit from "@/components/shared/ImageCredit";
import { Badge } from "@/components/ui/badge";

/**
 * 品目ごとの「イチオシ商品」を並べる。
 *
 * ## 写真が無い状態を既定にしている
 *
 * 商品写真は後から手で埋める列なので、**大半の行は image が null のまま
 * 運用される**。画像を前提にしたレイアウト(カードの上半分が写真)にすると、
 * 埋まるまでの間ずっと穴が空いて見える。
 *
 * そこで既定を「テキストだけで完結する横並び」にして、image があるときだけ
 * 左に写真列が生える形にした。1枚も無くても崩れず、1枚だけ埋めても
 * その行だけが自然に厚くなる。全部埋まればそのまま写真付き一覧になる。
 *
 * つまり**撮影の進み方に関係なく、どの時点でも正しく見える**。
 */

const ROLE_LABELS: Record<string, string> = {
  standard: "定番",
  premium: "もう一段上",
  budget: "ばらまき向き",
  seasonal: "季節・数量限定",
};

/** 用途が一目で分かるように色を割り当てる。役割の色は全品目で共通。 */
const ROLE_STYLES: Record<string, string> = {
  standard:
    "bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200",
  premium:
    "bg-violet-100 text-violet-900 dark:bg-violet-950/60 dark:text-violet-200",
  budget:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200",
  seasonal:
    "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200",
};

export default function SouvenirPicks({ picks }: { picks: SouvenirPick[] }) {
  if (picks.length === 0) return null;

  return (
    <ul className="mt-4 grid gap-3">
      {picks.map((pick) => (
        <li
          key={pick.id}
          className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <div className="flex flex-col sm:flex-row">
            {/*
              写真が入るのはここ。null の間はこの列ごと出さないので、
              テキストが幅いっぱいを使う。埋まった行だけ横並びになる。
            */}
            {pick.image && (
              <div className="sm:w-44 sm:flex-none">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={pick.image}
                    alt={pick.nameJa ?? pick.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <ImageCredit
                  source={pick.imageSource}
                  credit={pick.imageCredit}
                  link={pick.imageLink}
                  className="px-2 pt-1"
                />
              </div>
            )}

            <div className="flex-1 p-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="font-semibold leading-snug">{pick.name}</p>
                <Badge
                  variant="secondary"
                  className={`font-normal ${ROLE_STYLES[pick.role] ?? ROLE_STYLES.standard}`}
                >
                  {ROLE_LABELS[pick.role] ?? ROLE_LABELS.standard}
                </Badge>
              </div>

              {pick.nameJa && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {pick.nameJa}
                </p>
              )}

              {(pick.size || pick.priceRange) && (
                <p className="mt-1.5 text-sm font-medium text-sky-800 dark:text-sky-300">
                  {[pick.size, pick.priceRange].filter(Boolean).join(" ・ ")}
                </p>
              )}

              <p className="mt-2 text-sm leading-relaxed">{pick.reason}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
