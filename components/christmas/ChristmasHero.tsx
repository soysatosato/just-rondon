import { cn } from "@/lib/utils";
import LightString from "./LightString";
import styles from "./christmas.module.css";

/**
 * クリスマス特集の見出しの帯。冬の夜空の上に電球のガーランドを垂らす。
 *
 * 写真は使わない。最初の画面に大きな写真を置くと、低速の回線では
 * それが読み込まれるまで見出しが出ない(トップは監査で18秒かかった)。
 * 夜空はCSSの重ね塗り、電球はSVGなので、文字と一緒にすぐ描ける。
 *
 * 夜空はライトでもダークでも同じ色にする。白い文字の読みやすさは
 * どちらでも変わらない。
 */
export default function ChristmasHero({
  eyebrow,
  title,
  lead,
  children,
  compact = false,
}: {
  /** 英語の小見出し。「CHRISTMAS IN LONDON 2026」。 */
  eyebrow: string;
  title: string;
  lead: React.ReactNode;
  /** 状態の札など、リード文の下に置くもの。 */
  children?: React.ReactNode;
  /** 子ページ用の低い帯。 */
  compact?: boolean;
}) {
  return (
    <header
      className={cn(
        styles.night,
        "relative isolate overflow-hidden rounded-3xl text-white shadow-lg ring-1 ring-black/5",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(styles.snow, "pointer-events-none absolute inset-0 -z-10 opacity-70")}
      />
      <LightString className="pointer-events-none absolute inset-x-0 top-0 w-full" />

      <div
        className={cn(
          "relative px-5 sm:px-8",
          compact ? "pb-6 pt-14 sm:pt-16" : "pb-7 pt-16 sm:pb-9 sm:pt-20",
        )}
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-300">
          {eyebrow}
        </p>
        <h1
          className={cn(
            "mt-2 font-bold leading-tight",
            compact ? "text-2xl sm:text-4xl" : "text-3xl sm:text-5xl",
          )}
        >
          {title}
        </h1>
        <div className="mt-3 max-w-2xl text-base leading-relaxed text-white/85">
          {lead}
        </div>
        {children}
      </div>
    </header>
  );
}
