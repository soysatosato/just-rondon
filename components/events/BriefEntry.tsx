import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { ExternalLink, TriangleAlert, ChevronDown, CalendarX } from "lucide-react";
import type { WeeklyBriefItem } from "@prisma/client";

import { cn } from "@/lib/utils";
import { getKindMeta, getSeverityMeta, getTimingLabel } from "@/lib/weekly";

/**
 * 号の1項目。
 *
 * 以前は角丸のカードだった。1号は10〜13項目あるので、同じ形の箱が13枚
 * 縦に続き、どれが今週の目玉なのかが形からは読めなかった。箱をやめて、
 * 通し番号・細罫・余白で区切る誌面の組みに変えている。
 *
 *   - 枠を持つのは「影響大」の支障だけ。枠が意味を持つのはそこだけなので、
 *     他が枠を捨てると、赤い枠が一覧の中で本当に目立つようになる。
 *   - 種類は塗りチップではなく、色の丸+和文+欧文で示す。塗りが13個並ぶと
 *     色そのものが背景になってしまい、区別として働かなくなっていた。
 *   - 通し番号は号のどこを読んでいるかの目印であり、飛ばし読みの足がかりでもある。
 */

function formatPeriod(start: Date | null, end: Date | null): string | null {
  if (!start && !end) return null;
  if (start && end) {
    if (start.getTime() === end.getTime()) return format(start, "M月d日");
    return `${format(start, "M月d日")}〜${format(end, "M月d日")}`;
  }
  return format((start ?? end) as Date, "M月d日");
}

export default function BriefEntry({
  item,
  /** 号を通した1始まりの番号。誌面の見出し番号として出す。 */
  index,
  /**
   * 号の主役として大きく出すか。号の先頭1件にだけ立てる想定で、
   * 同じ大きさの項目が延々と続くのを避けて「その週の顔」を作る。
   */
  featured = false,
  /** 今週で会期が終わるか。日付から算出した結果を呼び出し側が渡す。 */
  endingThisWeek = false,
  /**
   * 日別タイムラインからの着地点にする日付 (YYYY-MM-DD)。
   * その日に始まる項目のうち先頭のものにだけ付く。
   */
  anchorDate,
}: {
  item: WeeklyBriefItem;
  index: number;
  featured?: boolean;
  endingThisWeek?: boolean;
  anchorDate?: string;
}) {
  const kind = getKindMeta(item.kind);
  const severity = getSeverityMeta(item.severity);
  const timingLabel = getTimingLabel(item.timing);

  // 旅程を組み替える必要があるものは、他の項目に埋もれさせない。
  const isCritical = item.severity === "high";

  /*
   * 本文は長さによらず一律で畳む。
   *
   * 字数でしきい値を切ると、隣り合う項目で畳まれているものと全文のものが
   * 混ざり、一覧の見た目が不揃いになる。3行のプレビューを常に見せる形なら、
   * 短い項目は3行に収まってそのまま全部読めるので、一律にしても
   * 読者が失うものは無い。
   *
   * 主役だけは開いたまま出す。畳むと大きくした意味が無くなる。
   */
  const isCollapsible = !featured;

  // 日付・場所・駅は1行に流す。以前はアイコン付きのチップに分けていたが、
  // 1項目に4つ並ぶと、13項目で50個以上のチップが画面に出ていた。
  const where = [
    formatPeriod(item.startDate, item.endDate),
    item.venue ?? item.area,
    item.nearestStation,
  ].filter(Boolean) as string[];

  const body = (
    <div
      className={cn(
        "prose prose-sm max-w-none leading-[1.95] text-muted-foreground marker:text-muted-foreground dark:prose-invert dark:text-gray-300 prose-headings:text-foreground prose-strong:text-foreground dark:prose-strong:text-white",
        featured && "sm:prose-base"
      )}
    >
      <ReactMarkdown>{item.description}</ReactMarkdown>
    </div>
  );

  return (
    <article
      id={anchorDate ? `day-${anchorDate}` : undefined}
      // sticky なセクションナビの下に潜り込まないよう余白を確保する。
      style={anchorDate ? { scrollMarginTop: "4.5rem" } : undefined}
      className={cn("py-7", featured && "pb-9")}
    >
      <div
        className={cn(
          "grid gap-x-5 sm:grid-cols-[2.5rem_minmax(0,1fr)]",
          // 影響大の支障だけは枠を持たせる。旅程が崩れる情報を、
          // 罫だけで区切られた並びの中に埋もれさせない。
          isCritical &&
            "rounded-r border-l-[3px] border-red-500 bg-red-500/[0.045] py-5 pl-4 pr-4 sm:pl-5 dark:bg-red-500/[0.07]"
        )}
      >
        {/* 番号。狭い画面では見出し行に混ぜるので、この列は隠す。 */}
        <span
          aria-hidden
          className={cn(
            "hidden select-none font-serif tabular-nums leading-none text-muted-foreground/45 sm:block",
            featured ? "text-3xl" : "text-xl pt-0.5"
          )}
        >
          {String(index).padStart(2, "0")}
        </span>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span
              aria-hidden
              className="select-none font-serif text-sm tabular-nums leading-none text-muted-foreground/50 sm:hidden"
            >
              {String(index).padStart(2, "0")}
            </span>

            <span
              className={cn(
                "inline-flex items-baseline gap-1.5 text-[11px] font-bold leading-none",
                kind.textClass
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "inline-block h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full",
                  kind.dotClass
                )}
              />
              {kind.label}
              <span className="font-serif text-[10px] font-semibold uppercase tracking-[0.14em] opacity-55">
                {kind.eng}
              </span>
            </span>

            {featured && (
              <span className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/70 dark:text-gray-300">
                Lead ・ 今週の一本
              </span>
            )}

            {severity && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-bold leading-none",
                  item.severity === "high"
                    ? "text-red-700 dark:text-red-400"
                    : item.severity === "medium"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-muted-foreground"
                )}
                title={severity.action}
              >
                {severity.label}
              </span>
            )}

            {/* 「今週」は既定なので出さない。「予告」だけを目立たせる。 */}
            {item.timing === "announced" && timingLabel && (
              <span className="rounded-sm border border-foreground/25 px-1.5 py-0.5 text-[10px] font-bold leading-none text-foreground/70 dark:text-gray-300">
                {timingLabel}
              </span>
            )}

            {item.isFree && (
              <span className="text-[11px] font-bold leading-none text-emerald-700 dark:text-emerald-400">
                無料
              </span>
            )}

            {/*
             * 「今週を逃すと見られない」は最も行動を促す情報なので、
             * ここだけ塗りにして一覧の中で拾えるようにする。
             */}
            {endingThisWeek && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-rose-600 px-1.5 py-1 text-[10px] font-bold leading-none text-white">
                <CalendarX className="h-3 w-3" />
                今週で見納め
              </span>
            )}
          </div>

          <h3
            className={cn(
              "font-bold tracking-tight dark:text-white",
              featured
                ? "text-xl leading-snug sm:text-2xl md:text-[1.75rem]"
                : "text-[17px] leading-snug sm:text-lg"
            )}
          >
            {item.title}
          </h3>

          {severity && (
            <p className="mt-1.5 text-xs text-muted-foreground dark:text-gray-400">
              {severity.action}
            </p>
          )}

          {where.length > 0 && (
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
              {where.map((part, i) => (
                <span key={`${i}-${part}`}>
                  {i > 0 && (
                    <span aria-hidden className="mx-1.5 opacity-40">
                      ／
                    </span>
                  )}
                  <span className="tabular-nums">{part}</span>
                </span>
              ))}
            </p>
          )}

          {/* 料金は長い文字列になりがちなので、場所の行から分けて置く。 */}
          {item.priceInfo && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
              {item.priceInfo}
            </p>
          )}

          {/* 「まだ覆りうる」情報であることは、本文より先に伝える必要がある。 */}
          {item.status === "planned" && (
            <p className="mt-3 flex gap-2 border-l-2 border-amber-500 py-1 pl-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                予告の段階です。中止・変更になる可能性があるため、出発前に公式サイトで確認してください。
              </span>
            </p>
          )}

          {isCollapsible ? (
            /*
             * 長い本文の折りたたみ。
             *
             * summary に文言だけを置くと、閉じている間は本文が1文字も見えず、
             * 開くかどうかを見出しだけで決めることになる。そこで本文自体を
             * summary の中に入れ、閉じているあいだは3行で切って見せる。
             * 読者は書き出しを読んでから開くかを判断できる。
             *
             * details/summary なのでクライアントJSは要らない。閉じていても
             * DOM には全文があるため、Ctrl+F の検索にも掛かる。
             * group/body で開閉状態を子に伝え、行数の制限と矢印の向きを切り替える。
             *
             * summary は既定で display:list-item のため、中のブロック要素が
             * 縦に積めない。list-none と併せて block にしておく。
             */
            <details className="group/body mt-3">
              <summary className="block cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                {/*
                 * 閉じているあいだの高さを3行ぶんに抑える。
                 *
                 * line-clamp ではなく max-height で切っている。本文は
                 * markdown から <p> が複数生まれるブロック構造で、
                 * line-clamp は自身の行ボックスにしか効かないため、
                 * 段落が分かれていると3行で止まらない。
                 *
                 * prose-sm は 0.875rem。leading-[1.95] で1行 1.71rem になる。
                 * 3行で 5.1rem だが、prose は先頭の <p> にも上マージンを
                 * 付けるため、そのぶん本文が押し下がって3行に満たなくなる。
                 * 先頭のマージンを潰したうえで切る。
                 *
                 * 下端の減衰は重ねた div ではなく mask-image で作る。
                 * かぶせる方式だと背景色を決め打ちする必要があり、
                 * 「影響大」の淡い赤の上では継ぎ目が出ていた。
                 */}
                <div className="max-h-[5.1rem] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_2.8rem,transparent)] [&_>div>*:first-child]:mt-0 group-open/body:max-h-none group-open/body:overflow-visible group-open/body:[mask-image:none]">
                  {body}
                </div>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-foreground/80 underline-offset-4 hover:underline dark:text-gray-200">
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open/body:rotate-180" />
                  <span className="group-open/body:hidden">続きを読む</span>
                  <span className="hidden group-open/body:inline">閉じる</span>
                </span>
              </summary>
            </details>
          ) : (
            <div className="mt-4">{body}</div>
          )}

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
            {item.website && (
              <a
                href={item.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground dark:text-gray-100"
              >
                公式サイト
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {/* 出典は必ず出す。ストライキや休館の情報は検証できて初めて価値がある。 */}
            {item.source === item.website ? (
              item.sourceName && (
                <span className="text-muted-foreground dark:text-gray-500">
                  出典: {item.sourceName}
                </span>
              )
            ) : (
              <a
                href={item.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:underline dark:text-gray-500"
              >
                出典{item.sourceName ? `: ${item.sourceName}` : ""}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </p>
        </div>
      </div>
    </article>
  );
}
