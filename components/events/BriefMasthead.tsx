import { format } from "date-fns";

import { cn } from "@/lib/utils";
import {
  formatWeekRange,
  getIssueDesignation,
  type IssueFreshness,
} from "@/lib/weekly";

/**
 * 号の題字。
 *
 * 以前はバッジ・見出し・引用線つきのリード・補足を上から順に積んでいて、
 * 「週刊のある号を開いた」という感覚が無かった。ここでは印刷物の題字に
 * ならい、太罫 → 欧文の紙名と発行番号 → 細罫 → 誌名と会期 → リード、
 * という順で組む。罫の太さの差だけで階層が付くので、色を使わずに済む。
 *
 * 欧文だけを serif にしているのは、和文の serif が環境によって明朝に
 * ならない(Windows や Android では sans にフォールバックすることがある)ため。
 * 欧文と数字は system serif がほぼ確実に当たるので、そこにだけ載せる。
 */

/**
 * DBのタイトルは「今週のロンドン(8/31〜9/6)」の形で、会期を括弧で抱えている。
 * 題字では会期を独立した行として大きく出すので、括弧の中身は落とす。
 * 括弧が無いタイトルはそのまま誌名として使う。
 */
function splitTitle(title: string): string {
  return title.replace(/\s*[(（][^)）]*[)）]\s*$/, "").trim() || title;
}

export default function BriefMasthead({
  title,
  slug,
  weekStart,
  weekEnd,
  headline,
  summary,
  researchedAt,
  freshness,
  /** h1 として出すか(=そのページの主役か)。 */
  asHeading = true,
}: {
  title: string;
  slug: string;
  weekStart: Date;
  weekEnd: Date;
  headline: string;
  summary: string;
  researchedAt: Date;
  freshness: IssueFreshness;
  asHeading?: boolean;
}) {
  const Title = asHeading ? "h1" : "h2";
  const designation = getIssueDesignation(slug);
  const wordmark = splitTitle(title);

  return (
    <header className="mb-10">
      {/* 太罫。ページの上端を締めて、ここから号が始まることを示す。 */}
      <div className="h-[3px] bg-foreground" />

      <div className="flex items-baseline justify-between gap-4 border-b border-foreground/20 py-2">
        <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground sm:text-[11px]">
          This Week in London
        </p>
        {designation && (
          <p className="shrink-0 font-serif text-[11px] font-semibold tabular-nums tracking-[0.14em] text-muted-foreground">
            {designation}
          </p>
        )}
      </div>

      <div className="pt-6">
        <Title className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-[2.75rem] dark:text-white">
          {wordmark}
          {/*
           * 会期は誌名と同じ見出しの中に入れる。別行の補足に落とすと、
           * 過去号を開いたときに「いつの号か」が題字から読めなくなる。
           */}
          <span className="mt-2 block text-base font-semibold tabular-nums text-muted-foreground sm:text-lg dark:text-gray-400">
            {formatWeekRange(weekStart, weekEnd)}
          </span>
        </Title>

        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className={cn(
              "inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]",
              freshness.isPast
                ? "text-muted-foreground"
                : "text-sky-700 dark:text-sky-400"
            )}
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              {/* 有効な号のときだけ光らせる。過去号で光らせると、
                  古い情報を最新のものとして押し出すことになる。 */}
              {!freshness.isPast && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-1.5 w-1.5 rounded-full",
                  freshness.isPast ? "bg-muted-foreground" : "bg-sky-600"
                )}
              />
            </span>
            {freshness.label}の号
          </span>
        </p>

        {/* リード。この号を読むかどうかは、ここ数行で決まる。 */}
        <p className="mt-6 text-[17px] font-semibold leading-[1.9] sm:text-lg dark:text-gray-100">
          {headline}
        </p>

        <p className="mt-5 max-w-[42rem] text-sm leading-[2] text-muted-foreground dark:text-gray-400">
          {summary}
        </p>
      </div>

      {/*
       * いつ時点の情報かを出さないと、ストライキや休館の記述は誤情報になりうる。
       * あわせて更新の頻度も出す。次にいつ来ればいいかが分からないと、
       * 読み終えた読者はそのまま離れてしまう。
       */}
      <p className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-3 text-[11px] tabular-nums text-muted-foreground dark:border-neutral-800 dark:text-gray-500">
        <span>{format(researchedAt, "yyyy年M月d日")} 調査</span>
        <span aria-hidden className="opacity-40">
          ／
        </span>
        <span>毎週更新(翌週分を前の週にお届け)</span>
      </p>
    </header>
  );
}
