import Link from "next/link";
import { ExternalLink, WandSparkles } from "lucide-react";
import { londonDate } from "@/lib/publish-schedule";
import {
  formatFullDate,
  formatRange,
  resolveItems,
  seasonYear,
  statusOn,
  type ResolvedItem,
} from "@/lib/christmas";
import { effectiveEnd } from "@/lib/christmas/season";
import { HP_WINTER_FACTS } from "@/lib/christmas/harry-potter";
import { cn } from "@/lib/utils";
import StatusChip from "./StatusChip";

/**
 * ハリー・ポッターの冬。クリスマス特集のハブの1章と、ハリー・ポッター特集
 * (/sightseeing/harry-potter)の冬の囲みの両方に出す。
 *
 * スタジオツアーの冬の催しと、オックスフォード・ストリートの灯りの会期は
 * lib/christmas のデータから、その年だけの出来事(新しい店、ドラマの配信)は
 * lib/christmas/harry-potter.ts から出す。出すのは10月から、スタジオツアーの
 * 冬の催しが終わるまで。
 */

const STUDIO_SLUG = "hogwarts-in-the-snow";
const LIGHTS_SLUG = "oxford-street";

function Row({
  title,
  when,
  item,
  today,
  children,
}: {
  title: React.ReactNode;
  when?: string;
  item?: ResolvedItem;
  today: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-xl bg-white/80 p-4 ring-1 ring-amber-200/70 dark:bg-neutral-950/60 dark:ring-amber-900/50">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{title}</p>
        {item && <StatusChip status={statusOn(item.edition, today, item.kind)} kind={item.kind} />}
      </div>
      {when && (
        <p className="mt-0.5 text-xs font-semibold tabular-nums text-amber-900 dark:text-amber-200">{when}</p>
      )}
      <div className="mt-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{children}</div>
    </li>
  );
}

export default function HarryPotterWinter({
  heading = false,
  className,
}: {
  /** 見出しを自分で出すか。ハブでは節の見出しがあるので出さない。 */
  heading?: boolean;
  className?: string;
}) {
  const today = londonDate(new Date());
  const year = seasonYear(today);
  const items = resolveItems(year);
  const studio = items.find((i) => i.slug === STUDIO_SLUG);
  const lights = items.find((i) => i.slug === LIGHTS_SLUG);
  const facts = HP_WINTER_FACTS.filter((f) => f.season === year);

  const lastDay = studio?.edition ? effectiveEnd(studio.edition) : `${year + 1}-01-06`;
  if (today < `${year}-10-01` || today > lastDay) return null;

  return (
    <section
      aria-label="ハリー・ポッターの冬"
      className={cn(
        "rounded-2xl border border-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-red-50 p-4 dark:border-amber-900/60 dark:from-amber-950/30 dark:via-neutral-950 dark:to-red-950/20 sm:p-5",
        className,
      )}
    >
      {heading && (
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
          <WandSparkles className="h-5 w-5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
          ハリー・ポッターの冬({year}年)
        </h2>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {studio && (
          <Row
            title={
              <Link href={studio.href} className="underline-offset-2 hover:underline">
                スタジオツアー「{studio.title}」
              </Link>
            }
            when={studio.edition ? formatRange(studio.edition) : `未発表(${studio.usualTiming})`}
            item={studio}
            today={today}
          >
            {studio.summary}
          </Row>
        )}
        {lights && (
          <Row
            title={
              <Link href={lights.href} className="underline-offset-2 hover:underline">
                オックスフォード・ストリートの灯り
              </Link>
            }
            when={lights.edition ? formatRange(lights.edition) : `未発表(${lights.usualTiming})`}
            item={lights}
            today={today}
          >
            {lights.edition?.notes?.[0] ?? lights.summary}
          </Row>
        )}
        {facts.map((fact) => (
          <Row key={fact.title} title={fact.title} today={today}>
            <p>{fact.body}</p>
            <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              出典:{" "}
              <a
                href={fact.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-link underline underline-offset-2"
              >
                {fact.source.label}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              ({formatFullDate(fact.checkedAt)}確認)
            </p>
          </Row>
        ))}
      </ul>

      <div className="mt-4 rounded-xl border border-amber-200 bg-white/70 p-4 text-sm leading-relaxed text-neutral-800 dark:border-amber-900/50 dark:bg-neutral-950/50 dark:text-neutral-200">
        <p className="font-bold">街の中のハリー・ポッターを半日で</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 marker:font-bold marker:text-amber-700">
          <li>
            <Link href="/sightseeing/harry-potter-shop-platform-934" className="text-link underline underline-offset-2">
              キングス・クロス駅の9¾番線とショップ
            </Link>
            (壁に消えていくカートの前で写真が撮れる)
          </li>
          <li>
            <Link href="/sightseeing/leadenhall-market-london" className="text-link underline underline-offset-2">
              レドンホール・マーケット
            </Link>
            (映画1作目のダイアゴン横丁の撮影地)
          </li>
          <li>
            オックスフォード・ストリート(新しい公式店と、日の入りからの灯り)
          </li>
        </ol>
        <p className="mt-2">
          スタジオツアーはロンドンの北西のワトフォードにあり、見学に3〜4時間かかるので、別の日に入れてください。
        </p>
      </div>
    </section>
  );
}
