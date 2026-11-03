import { ExternalLink } from "lucide-react";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import {
  TICKET_LEVEL_LABEL,
  type SpotPractical,
  type TicketLevel,
} from "@/lib/sightseeing/practical";
import { formatCheckedAt } from "@/lib/time-routes";
import type { StoryLike } from "@/components/sightseeing/stories";

/**
 * 「行く前に知っておきたいこと」。チケットの取り方・当日の決まり(公式で
 * 確かめたもの)と、読み物のうち訪問の実務を扱う節(kind: practical)を
 * 1つの節にまとめる。
 *
 * 以前は practical の読み物が歴史や豆知識と同じ並びの最後にあり、
 * 「予約が要る」「日曜は見学できない」のような、行く前にしか手を打てない
 * 事実がページの最下部に埋まっていた。
 *
 * 中身が何も無いスポットでは何も描かない。
 */

const LEVEL_STYLE: Record<TicketLevel, string> = {
  timed:
    "bg-amber-100 text-amber-900 ring-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-800",
  advance:
    "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-900",
  "free-booking":
    "bg-amber-100 text-amber-900 ring-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-800",
  "walk-in":
    "bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900",
  closed:
    "bg-neutral-100 text-neutral-700 ring-neutral-300 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-700",
};

export default function SpotBeforeYouGo({
  id,
  ticketsId,
  practical,
  stories,
}: {
  id: string;
  /** チケットの小見出しの id。早わかりからのページ内リンクの行き先。 */
  ticketsId: string;
  practical: SpotPractical | null;
  /** kind が practical の読み物。表示順に並べたもの。 */
  stories: StoryLike[];
}) {
  const tickets = practical?.tickets ?? null;
  const onSite = practical?.onSite ?? [];
  if (!tickets && onSite.length === 0 && stories.length === 0) return null;

  return (
    <section id={id} className="scroll-mt-24 space-y-6">
      <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
        行く前に知っておきたいこと
      </h2>

      {tickets && (
        <div
          id={ticketsId}
          className="scroll-mt-24 rounded-2xl border border-border p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              チケットと予約
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${LEVEL_STYLE[tickets.level]}`}
            >
              {TICKET_LEVEL_LABEL[tickets.level]}
            </span>
          </div>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-muted-foreground/60">
            {tickets.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {tickets.url && (
            <a
              href={tickets.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-link underline underline-offset-4 hover:opacity-80 dark:text-blue-400"
            >
              公式サイトの料金・チケットのページ
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </div>
      )}

      {onSite.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold tracking-tight">
            当日に知っておくこと
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-muted-foreground/60">
            {onSite.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {stories.map((story) => (
        <div key={story.id} className="space-y-2">
          {story.heading?.trim() && (
            <h3 className="text-base font-semibold tracking-tight">
              {story.heading.trim()}
            </h3>
          )}
          <MarkdownBody>{story.body}</MarkdownBody>
        </div>
      ))}

      {practical && (tickets || onSite.length > 0) && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {tickets ? "チケットと当日の案内" : "当日の案内"}は
          {formatCheckedAt(practical.checkedAt)}
          に公式の案内で確かめた内容です(
          {practical.sources.map((source, i) => (
            <span key={source.url}>
              {i > 0 && "、"}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80"
              >
                {source.label}
              </a>
            </span>
          ))}
          )。
        </p>
      )}
    </section>
  );
}
