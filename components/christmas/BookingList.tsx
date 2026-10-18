import Link from "next/link";
import { ExternalLink } from "lucide-react";
import styles from "./christmas.module.css";

export type BookingRow = {
  key: string;
  title: string;
  /** 会期や当日の日付。 */
  when: string;
  /** 発売の状況。 */
  status: string;
  price?: string;
  /** サイト内の詳しい案内。 */
  href: string;
  /** 公式の予約先。 */
  url?: string;
};

/**
 * いま予約が要るもの。プレゼントの荷札の形にする。
 *
 * 「残りわずか」のような、確かめられない言い方は書かない。書くのは
 * 発売日と、日時指定かどうかだけ(公式の案内にあることだけ)。
 */
export default function BookingList({ rows }: { rows: BookingRow[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <li
          key={row.key}
          className="relative flex overflow-hidden rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20"
        >
          <span aria-hidden="true" className="relative w-6 shrink-0 bg-red-700">
            <span className={styles.tagHole} />
          </span>
          <div className="min-w-0 flex-1 p-4">
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              <Link href={row.href} className="underline-offset-2 hover:underline">
                {row.title}
              </Link>
            </p>
            <p className="mt-0.5 text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
              {row.when}
            </p>
            <p className="mt-2 text-sm font-semibold leading-snug text-red-800 dark:text-red-300">
              {row.status}
            </p>
            {row.price && (
              <p className="mt-1 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                {row.price}
              </p>
            )}
            {row.url && (
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-link underline underline-offset-2"
              >
                公式の案内
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
