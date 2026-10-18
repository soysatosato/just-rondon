import Link from "next/link";
import { Bus, Landmark, Sparkles, Store } from "lucide-react";
import type { DayNote } from "@/lib/christmas/days";
import { cn } from "@/lib/utils";
import styles from "./christmas.module.css";

export type AdventTile = {
  key: string;
  /** "24" や "29〜30"。札の大きな数字。 */
  dayLabel: string;
  /** "12月24日(木)"。 */
  dateLabel: string;
  /** 「クリスマス・イブ」「振替休日」。 */
  name?: string;
  tone: "stop" | "warn" | "info" | "plain";
  headline: string;
  transport: DayNote[];
  life: DayNote[];
  /** この日に休む館。 */
  closed: string[];
  /** この日の催し。 */
  happenings: string[];
  links: { href: string; label: string }[];
};

/** 札に名前を並べる休館の数。残りは早見表へ送る。 */
const CLOSED_SHOWN = 6;

const HEADER: Record<AdventTile["tone"], string> = {
  stop: cn(styles.candy, "text-white"),
  warn: "bg-amber-400 text-neutral-950",
  info: "bg-emerald-700 text-white",
  plain: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
};

function NoteList({
  icon: Icon,
  label,
  notes,
}: {
  icon: typeof Bus;
  label: string;
  notes: string[];
}) {
  if (notes.length === 0) return null;
  return (
    <div className="flex gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" aria-label={label} />
      <ul className="space-y-1">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 12月24日から1月1日までの日めくり。アドベントカレンダーの扉のように
 * 日付を大きく出し、その日の交通・店・休む館を書く。
 *
 * 25日はキャンディケインの縞で、ほかの日と見間違えないようにする。
 * ふつうの日は1枚にまとめる(「29〜30日」)。
 */
export default function AdventDays({ tiles }: { tiles: AdventTile[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((tile) => (
        <li
          key={tile.key}
          className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className={cn("flex items-end justify-between gap-3 px-4 pb-2 pt-3", HEADER[tile.tone])}>
            <p className="text-4xl font-black leading-none tabular-nums">{tile.dayLabel}</p>
            <div className="min-w-0 text-right">
              <p className="text-xs font-semibold opacity-90">{tile.dateLabel}</p>
              {tile.name && <p className="text-sm font-bold">{tile.name}</p>}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 p-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <p className="font-bold text-neutral-900 dark:text-neutral-100">{tile.headline}</p>
            <NoteList icon={Bus} label="交通" notes={tile.transport.map((n) => n.text)} />
            <NoteList icon={Store} label="店と催し" notes={tile.life.map((n) => n.text)} />
            {tile.closed.length > 0 && (
              <div className="flex gap-2">
                <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" aria-label="休館" />
                <p>
                  休館: {tile.closed.slice(0, CLOSED_SHOWN).join("、")}
                  {tile.closed.length > CLOSED_SHOWN && (
                    <>
                      ほか{tile.closed.length - CLOSED_SHOWN}か所(
                      <Link
                        href="/events/christmas/christmas-day#hours"
                        className="text-link underline underline-offset-2"
                      >
                        早見表
                      </Link>
                      )
                    </>
                  )}
                </p>
              </div>
            )}
            {tile.happenings.length > 0 && (
              <NoteList icon={Sparkles} label="この日の催し" notes={tile.happenings} />
            )}
            {tile.links.length > 0 && (
              <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-1">
                {tile.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm font-medium text-link underline underline-offset-2">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
