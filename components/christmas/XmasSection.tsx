import { cn } from "@/lib/utils";

/**
 * 特集の節。見出しの番号をオーナメント(吊り下げの球)にする。
 * 番号は節ナビ(GuideSectionNav)の番号と一致させる。
 *
 * 球の色は赤と緑を交互に。どちらも白い数字が 4.5:1 を超える濃さ。
 */
export function Bauble({ n }: { n: number }) {
  const red = n % 2 === 1;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-[inset_-3px_-4px_8px_rgba(0,0,0,0.28),0_2px_6px_rgba(0,0,0,0.15)]",
        red
          ? "bg-gradient-to-br from-red-600 to-red-800"
          : "bg-gradient-to-br from-emerald-600 to-emerald-800",
      )}
    >
      <span className="absolute -top-1.5 left-1/2 h-2 w-3 -translate-x-1/2 rounded-sm bg-amber-400 ring-1 ring-amber-600/40" />
      {n}
    </span>
  );
}

export default function XmasSection({
  n,
  id,
  title,
  lead,
  children,
  className,
}: {
  n: number;
  id: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("mt-16 scroll-mt-24 first-of-type:mt-0", className)}>
      <h2 className="flex items-start gap-3 text-xl font-bold leading-snug text-neutral-900 dark:text-neutral-100 sm:text-2xl">
        <Bauble n={n} />
        <span className="pt-1">{title}</span>
      </h2>
      {lead && (
        <div className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 sm:pl-12">
          {lead}
        </div>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}
