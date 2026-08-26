import type { MenuPick } from "@prisma/client";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import ImageCredit from "@/components/shared/ImageCredit";

/**
 * 店で頼むべき一皿を並べる。SouvenirPicks の restaurants 版。
 *
 * ## souvenirs 版とレイアウトを変えている
 *
 * あちらは1品目1ページの本文中に置くが、こちらは**料理ページ1枚に
 * 店カードが2〜3枚並ぶ**中の、さらに内側に入る。souvenirs と同じ
 * 枠付きカードを積むと入れ子が深くなって主従が崩れるので、
 * 左の罫線1本で束ねるだけの軽い組みにした。
 *
 * ## 写真が無い状態が既定
 *
 * 料理写真は後から手で埋める列で、**既存の店写真12件はすべて Commons の
 * 外観**(RestaurantCard のコメント参照)。つまり当面ほぼ全ての行が
 * image = null で動く。画像前提の組みにすると穴だらけに見えるので、
 * テキストだけで完結させ、image があるときだけ右に小さな写真が付く形。
 * 1枚も無くても崩れず、埋まった行だけが自然に厚くなる。
 */

const ROLE_LABELS: Record<string, string> = {
  signature: "名物",
  second: "もう一皿",
  drink: "飲み物",
  seasonal: "時間帯・季節限定",
};

const ROLE_STYLES: Record<string, string> = {
  signature:
    "bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200",
  second:
    "bg-slate-200 text-slate-800 dark:bg-slate-700/70 dark:text-slate-200",
  drink:
    "bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200",
  seasonal:
    "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200",
};

export default function MenuPicks({ picks }: { picks: MenuPick[] }) {
  if (picks.length === 0) return null;

  return (
    <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        何を頼むか
      </p>

      <ul className="space-y-3">
        {picks.map((pick) => (
          <li
            key={pick.id}
            className="border-l-2 border-slate-200 pl-3 dark:border-slate-700"
          >
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold leading-snug">
                    {pick.name}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      ROLE_STYLES[pick.role] ?? ROLE_STYLES.signature
                    }`}
                  >
                    {ROLE_LABELS[pick.role] ?? ROLE_LABELS.signature}
                  </span>
                  {pick.priceRange && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {pick.priceRange}
                    </span>
                  )}
                </div>

                {pick.nameJa && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {pick.nameJa}
                  </p>
                )}

                {/*
                  reason は markdown。太字で「これを頼まないと意味がない」
                  といった判断部分を立てているので、素のテキストで出さない。
                */}
                <MarkdownBody className="mt-1 text-sm">
                  {pick.reason}
                </MarkdownBody>
              </div>

              {/*
                料理写真が入るのはここ。null の間はこの列ごと出さないので、
                テキストが幅いっぱいを使う。埋まった行だけ写真が付く。
              */}
              {pick.image && (
                <div className="w-20 flex-none sm:w-24">
                  <div className="relative aspect-square w-full overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
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
                    className="pt-1"
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
