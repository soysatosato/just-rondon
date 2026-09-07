"use client";

import clsx from "clsx";
import { READING_ACCENT, type ReadingAccentName } from "@/lib/reading-accent";

/**
 * 読み物ハブの書庫(コラム・イギリス英語・英国のいま)で共通に使う部品。
 *
 * 3つのハブは中身も並べ方も違うが、「探して、絞って、めくる」という
 * 手つきは同じにしておきたい。色だけをハブごとに差し替える。
 */

/** 書庫の見出し。左の英字＋日本語の2段。 */
export function ArchiveHeading({
  accent,
  eyebrow,
  title,
  id,
  children,
}: {
  accent: ReadingAccentName;
  eyebrow: string;
  title: string;
  id?: string;
  /** 見出しの右に置くもの(並べ替えなど)。 */
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-foreground/15 pb-4">
      <div>
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <span
            className={clsx(
              "h-3 w-0.5 shrink-0 rounded-full",
              READING_ACCENT[accent].bar,
            )}
          />
          {eyebrow}
        </p>
        <h2
          id={id}
          className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

/** 並べ替え。選択肢が2つなのでセレクトにせず、押した状態が見える形にする。 */
export function SortToggle<T extends string>({
  accent,
  value,
  options,
  onChange,
}: {
  accent: ReadingAccentName;
  value: T;
  options: { key: T; label: string }[];
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white/70 p-1 dark:border-slate-800 dark:bg-slate-900/70">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={clsx(
            "rounded-full px-3 py-1.5 text-xs font-bold transition",
            value === o.key
              ? clsx(READING_ACCENT[accent].on, "shadow-sm")
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({
  accent,
  value,
  onChange,
  placeholder,
  label,
}: {
  accent: ReadingAccentName;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={clsx(
          "w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900",
          READING_ACCENT[accent].focus,
        )}
      />
    </div>
  );
}

export function FilterChip({
  accent,
  active,
  onClick,
  label,
  count,
}: {
  accent: ReadingAccentName;
  active: boolean;
  onClick: () => void;
  label: string;
  /** 省略すると件数を出さない(頭文字の絞り込みなど)。 */
  count?: number;
}) {
  const a = READING_ACCENT[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? clsx(a.on, "border-transparent")
          : clsx(
              "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
              a.idle,
            ),
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={clsx(
            "ml-1.5 text-xs tabular-nums",
            active ? "text-white/75" : "text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/** 何も残らなかったときの面。 */
export function EmptyResult({
  accent,
  onReset,
}: {
  accent: ReadingAccentName;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
      <p className="text-muted-foreground">見つかりませんでした。</p>
      <button
        type="button"
        onClick={onReset}
        className={clsx(
          "mt-3 text-sm font-medium underline",
          READING_ACCENT[accent].text,
        )}
      >
        絞り込みを解除する
      </button>
    </div>
  );
}

/**
 * ページ番号の並び。総数が増えても横1行に収まるよう、現在地の前後と
 * 両端だけを残して間を「…」で畳む。
 */
export function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const keep = new Set([1, total, current - 1, current, current + 1]);
  // 端にいるときは反対側を1つ伸ばして、見える番号の数を揃える。
  if (current <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (current >= total - 2)
    [total - 3, total - 2, total - 1].forEach((n) => keep.add(n));

  const out: (number | "gap")[] = [];
  let prev = 0;
  for (let n = 1; n <= total; n++) {
    if (!keep.has(n)) continue;
    if (prev && n - prev > 1) out.push("gap");
    out.push(n);
    prev = n;
  }
  return out;
}

export function Pager({
  accent,
  current,
  total,
  onChange,
  label,
}: {
  accent: ReadingAccentName;
  current: number;
  total: number;
  onChange: (page: number) => void;
  label: string;
}) {
  const a = READING_ACCENT[accent];

  return (
    <nav
      aria-label={label}
      className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
    >
      <PagerButton
        accent={accent}
        label="前のページへ"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        ← 前へ
      </PagerButton>

      {pageNumbers(current, total).map((n, i) =>
        n === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            aria-label={`${n} ページ目へ`}
            aria-current={n === current ? "page" : undefined}
            onClick={() => onChange(n)}
            className={clsx(
              "h-9 min-w-9 rounded-full px-3 text-sm font-bold tabular-nums transition",
              n === current
                ? clsx(a.on, "shadow-sm")
                : clsx("text-muted-foreground", a.soft),
            )}
          >
            {n}
          </button>
        ),
      )}

      <PagerButton
        accent={accent}
        label="次のページへ"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
      >
        次へ →
      </PagerButton>
    </nav>
  );
}

function PagerButton({
  accent,
  label,
  disabled,
  onClick,
  children,
}: {
  accent: ReadingAccentName;
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "h-9 rounded-full border px-3.5 text-xs font-bold transition",
        disabled
          ? "cursor-default border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700"
          : clsx(
              "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300",
              READING_ACCENT[accent].soft,
            ),
      )}
    >
      {children}
    </button>
  );
}
