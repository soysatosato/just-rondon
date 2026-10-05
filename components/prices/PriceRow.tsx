import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { toJpy } from "@/lib/fx/rate";
import { PRICE_BASES } from "@/lib/price-board/bases";
import {
  samePrice,
  type PriceItem,
  type PriceValue,
} from "@/lib/price-board/items";

/**
 * 物価ボードの1行。
 *
 * 左に品目と「何の数字か」、右にポンドと円。基準は行ごとに必ず出すが、
 * 小さな灰色の1行に留める。基準の名前はページ末尾の説明へのリンク、
 * 補足(TfL・8月・48件の中央値 など)は出典へのリンクにして、
 * 説明そのものは行に並べない。30行それぞれに妥当性の説明が付くと、
 * 値段を見比べるための表として読めなくなる。
 */

function gbpAmount(n: number): string {
  const body = Number.isInteger(n)
    ? n.toLocaleString("en-GB")
    : n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `£${body}`;
}

export function formatGbp(value: PriceValue, from = false): string {
  if (typeof value === "number") {
    if (value === 0) return "無料";
    return `${gbpAmount(value)}${from ? "〜" : ""}`;
  }
  return `${gbpAmount(value.min)}〜${gbpAmount(value.max)}`;
}

function formatJpy(value: PriceValue, rate: number, from = false): string | null {
  const yen = (n: number) => toJpy(n, rate).toLocaleString("ja-JP");
  if (typeof value === "number") {
    if (value === 0) return null;
    return `${yen(value)}円${from ? "〜" : ""}`;
  }
  return `${yen(value.min)}〜${yen(value.max)}円`;
}

/** "2026-11-01" → "11月1日"。今年でなければ年も付ける。 */
function dayJa(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return y === new Date().getFullYear() ? `${m}月${d}日` : `${y}年${m}月${d}日`;
}

export default function PriceRow({
  item,
  price,
  rate,
  previous,
  upcoming,
}: {
  item: PriceItem;
  price: PriceValue;
  /** £1 = 何円か。取れなかったときは null で、円の列を出さない。 */
  rate: number | null;
  /** 前回の確認時の値。前回が無い・品目が新しいときは undefined。 */
  previous?: PriceValue;
  upcoming: { date: string; price: number } | null;
}) {
  const basis = PRICE_BASES[item.basis];
  const sourceUrl = item.sourceUrl ?? basis.url;
  const per = item.per ? `/${item.per}` : "";
  const jpy = rate ? formatJpy(price, rate, item.from) : null;
  const changed = previous !== undefined && !samePrice(previous, price);

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[15px] font-bold leading-snug dark:text-white">
          {item.href ? (
            <Link
              href={item.href}
              className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground/40"
            >
              {item.label}
            </Link>
          ) : (
            item.label
          )}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground dark:text-gray-400">
          <a
            href={`#basis-${basis.id}`}
            className="underline decoration-dotted decoration-foreground/30 underline-offset-[3px] hover:decoration-foreground/60"
          >
            {basis.name}
          </a>
          {item.basisNote && (
            <>
              <span aria-hidden className="mx-1 text-muted-foreground/50">
                ·
              </span>
              {sourceUrl && item.basis !== "estimate" ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline gap-0.5 hover:text-foreground dark:hover:text-gray-200"
                >
                  {item.basisNote}
                  <ExternalLink aria-hidden className="h-2.5 w-2.5 self-center opacity-60" />
                </a>
              ) : (
                item.basisNote
              )}
            </>
          )}
        </p>
        {changed && previous !== undefined && (
          <p className="mt-1 text-[11px] font-bold tabular-nums text-emerald-800 dark:text-emerald-300">
            前回の確認では {formatGbp(previous, item.from)}
          </p>
        )}
        {upcoming && (
          <p className="mt-1 text-[11px] font-bold tabular-nums text-amber-800 dark:text-amber-300">
            {dayJa(upcoming.date)}から {formatGbp(upcoming.price)}
          </p>
        )}
      </div>

      <div className="text-right">
        <p className="whitespace-nowrap text-[15px] font-bold tabular-nums dark:text-white">
          {formatGbp(price, item.from)}
          {per && price !== 0 && (
            <span className="ml-0.5 text-[11px] font-semibold text-muted-foreground">{per}</span>
          )}
        </p>
        {jpy && (
          <p className="mt-0.5 whitespace-nowrap text-xs tabular-nums text-muted-foreground dark:text-gray-400">
            {jpy}
          </p>
        )}
      </div>
    </li>
  );
}
