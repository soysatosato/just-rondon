import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Crown,
  Drama,
  Landmark,
  Lock,
  MapPin,
  Star,
  Trees,
  type LucideIcon,
} from "lucide-react";

import StampImpression, {
  CompleteSeal,
  StampSlot,
  type StampArt,
} from "@/components/stamps/StampImpression";
import { cn } from "@/lib/utils";
import type { StampBookData, StampBookEntry } from "@/lib/stamp-progress";
import {
  pickNextGoals,
  RALLY_GROUPS,
  type RallyProgress,
  type RallySlot,
  type StampMark,
} from "@/lib/stamp-rallies";
import {
  formatStampDate,
  STAMP_META,
  STAMP_TITLES,
  STAMP_TYPES,
  stampTitleFor,
  type StampTitle,
  type StampType,
} from "@/lib/stamps";

/**
 * スタンプ帳。/stamps だけが使う表示。
 *
 * 以前は押したスタンプを種別ごとに並べ、「12 / 184」と細い棒を添える
 * だけだった。押しても6%しか進まない棒では、今どこにいて次に何をすれば
 * いいのかが見えない。今は上から次の順に読ませる。
 *
 * 1. 表紙: いまの称号と、次の称号まであと何個か。
 * 2. あと少しで制覇: 残りの欄が少ない台紙と、その残りの場所。
 * 3. ラリーの台紙: エリアやテーマで区切った台紙。空いた欄も描く。
 * 4. 押したスタンプ: 押した順に全部。
 * 5. 称号の一覧: この先の目標。
 *
 * 押していないものを並べるのは台紙の中だけにしている。184件を全部
 * 空欄で並べると押した12個が埋もれるが、12欄の台紙の空欄は
 * 「あと少し」の形をしている。
 */

/** 押してからこの時間は NEW を付け、開いたときに押す動きを見せる。 */
const FRESH_MS = 36 * 60 * 60 * 1000;

function isFresh(stampedAt: string, now: number): boolean {
  const at = new Date(stampedAt).getTime();
  return Number.isFinite(at) && now - at < FRESH_MS;
}

function artOf(mark: StampMark): StampArt {
  return {
    type: mark.type,
    engName: mark.engName,
    category: mark.category,
    stampedAt: mark.stampedAt,
    onSite: mark.onSite,
    seed: mark.stampId,
  };
}

const RALLY_ICONS: Record<string, LucideIcon> = {
  "must-see": Star,
  "great-museums": Landmark,
  "west-end": Drama,
  royal: Crown,
  parks: Trees,
};

export default function StampBook({
  username,
  data,
  children,
}: {
  username: string;
  data: StampBookData;
  /**
   * 押したスタンプの一覧のあとに差し込む欄。/stamps が旅仲間の入口
   * (components/stamps/friends/StampFriendsCard)を置くのに使う。
   * 旅仲間は自分でデータを引くので、StampBookData には混ぜていない。
   */
  children?: ReactNode;
}) {
  const { entries, rallies, totals, counts } = data;
  const now = Date.now();

  return (
    <div className="space-y-12">
      <Cover
        username={username}
        entries={entries}
        rallies={rallies}
        capacity={STAMP_TYPES.reduce((sum, type) => sum + totals[type], 0)}
        now={now}
      />
      <NextGoals rallies={rallies} />
      <RallyShelf rallies={rallies} now={now} />
      <Collection entries={entries} totals={totals} counts={counts} now={now} />
      {children}
      <TitleLadder total={entries.length} />

      <p className="flex items-start gap-2.5 rounded-2xl border border-dashed border-amber-300/80 bg-amber-50/50 px-4 py-3.5 text-xs leading-relaxed text-muted-foreground dark:border-amber-800/50 dark:bg-amber-950/10">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        金のスタンプは、その場所の近くで位置情報を付けて押したときだけ付きます。
        先に押しておいた赤いスタンプも、現地で押し直せば金になります。
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 表紙
 * ------------------------------------------------------------------ */

/**
 * パスポートの表紙の色(えんじに金の箔押し)。サイトの他のページが
 * 白地の読みものなので、ここだけは「自分の帳面を開いた」と分かる面にする。
 */
function Cover({
  username,
  entries,
  rallies,
  capacity,
  now,
}: {
  username: string;
  entries: StampBookEntry[];
  rallies: RallyProgress[];
  capacity: number;
  now: number;
}) {
  const total = entries.length;
  const { current, next } = stampTitleFor(total);
  const latest = entries[0] ?? null;

  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5b1629] via-[#420f1f] to-[#240811] px-5 pb-5 pt-7 text-white shadow-xl shadow-rose-950/20 ring-1 ring-black/5 dark:ring-white/10 sm:px-9 sm:pb-8 sm:pt-9">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-amber-200/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full border border-amber-200/10"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/90">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-400" />
            Stamp Book
          </p>
          <h1 className="mt-2 text-base font-bold [overflow-wrap:anywhere] sm:text-xl">
            {username} のスタンプ帳
          </h1>

          <p className="mt-6 text-[11px] font-semibold text-white/50">いまの称号</p>
          <p className="mt-1.5 font-serif text-[2rem] font-black leading-none tracking-tight text-amber-200 sm:text-5xl">
            {current.title}
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-200/50">
            {current.eng}
          </p>
          <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/70">
            {current.note}
          </p>
        </div>

        <LatestStamp
          entry={latest}
          fresh={latest ? isFresh(latest.stampedAt, now) : false}
        />
      </div>

      <NextTitle total={total} current={current} next={next} />

      <dl className="relative mt-4 grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
        <CoverStat label="スタンプ" value={total} of={capacity} />
        <CoverStat
          label="金スタンプ"
          value={entries.filter((e) => e.onSite).length}
        />
        <CoverStat
          label="制覇した台紙"
          value={rallies.filter((r) => r.completedAt).length}
          of={rallies.length}
        />
      </dl>

      <p className="relative mt-4 text-right">
        <Link
          href="/account"
          className="text-[11px] text-white/45 underline-offset-2 hover:text-white/80 hover:underline"
        >
          名前を変える
        </Link>
      </p>
    </header>
  );
}

/** 表紙に貼った紙片。いちばん新しいスタンプを1つだけ大きく見せる。 */
function LatestStamp({
  entry,
  fresh,
}: {
  entry: StampBookEntry | null;
  fresh: boolean;
}) {
  return (
    <div className="stamp-paper w-[5.75rem] shrink-0 rotate-3 rounded-xl p-2.5 shadow-lg shadow-black/30 sm:w-36 sm:p-3.5">
      {entry ? (
        <Link href={STAMP_META[entry.type].path(entry.slug)} className="block">
          <StampImpression art={artOf(entry)} pressing={fresh} delay={250} />
          <span className="mt-1.5 block text-center text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Latest
          </span>
          <span className="block truncate text-center text-[10px] font-semibold text-stone-700 dark:text-stone-200 sm:text-[11px]">
            {entry.name}
          </span>
        </Link>
      ) : (
        <>
          <StampSlot
            type="attraction"
            engName=""
            category={null}
            className="text-stone-300 dark:text-stone-600"
          />
          <span className="mt-1.5 block text-center text-[10px] font-semibold text-stone-500 dark:text-stone-400">
            最初の1個
          </span>
        </>
      )}
    </div>
  );
}

function NextTitle({
  total,
  current,
  next,
}: {
  total: number;
  current: StampTitle;
  next: StampTitle | null;
}) {
  if (!next) {
    return (
      <p className="relative mt-6 rounded-2xl bg-black/20 px-4 py-3.5 text-[13px] text-amber-100 ring-1 ring-white/10">
        最上位の称号です。あとは全部押し切るだけ。
      </p>
    );
  }

  const span = next.min - current.min;
  const done = total - current.min;

  return (
    <div className="relative mt-6 rounded-2xl bg-black/20 px-4 py-3.5 ring-1 ring-white/10">
      <p className="flex flex-wrap items-baseline gap-x-1 text-[13px] text-white/75">
        次の称号
        <span className="font-bold text-amber-200">「{next.title}」</span>
        まで
        <span className="ml-1 text-white">
          あと
          <span className="mx-1 font-serif text-2xl font-black tabular-nums">
            {next.min - total}
          </span>
          個
        </span>
      </p>
      <TitleMeter span={span} done={done} />
    </div>
  );
}

/**
 * 次の称号までの目盛り。16個までは1個1マスで刻み、次に埋まるマスを
 * 点滅させる。押すたびにマスが1つ埋まるのが見えるほうが、1本の棒が
 * 数%伸びるより手応えがある。
 */
function TitleMeter({ span, done }: { span: number; done: number }) {
  if (span <= 16) {
    return (
      <div className="mt-2.5 flex gap-1" aria-hidden>
        {Array.from({ length: span }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full",
              i < done
                ? "bg-gradient-to-r from-amber-300 to-amber-400"
                : i === done
                  ? "bg-white/30 motion-safe:animate-pulse"
                  : "bg-white/10",
            )}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden>
      <div
        className="h-full origin-left rounded-full bg-gradient-to-r from-amber-300 to-amber-400 motion-safe:animate-bar-fill"
        style={{ width: `${(done / span) * 100}%` }}
      />
    </div>
  );
}

function CoverStat({
  label,
  value,
  of,
}: {
  label: string;
  value: number;
  of?: number;
}) {
  return (
    <div className="px-1.5 py-3 text-center">
      <dt className="text-[10px] font-semibold tracking-wide text-white/55 sm:text-[11px]">
        {label}
      </dt>
      <dd className="mt-1.5 font-serif text-2xl font-black leading-none tabular-nums text-white sm:text-3xl">
        {value}
        {of !== undefined && (
          <span className="ml-1 text-[10px] font-semibold text-white/35 sm:text-xs">
            / {of}
          </span>
        )}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 共通
 * ------------------------------------------------------------------ */

function SectionHeading({
  id,
  eyebrow,
  title,
  aside,
}: {
  id: string;
  eyebrow: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-3 w-0.5 shrink-0 rounded-full bg-rose-500" />
          {eyebrow}
        </p>
        <h2 id={id} className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}

/**
 * 台紙の埋まり具合を点で。押したものを左から詰めるので、ポイントカードの
 * ように読める(台紙の欄の並びとは違う順になる)。
 */
function SlotDots({
  slots,
  className,
}: {
  slots: RallySlot[];
  className?: string;
}) {
  const gold = slots.filter((s) => s.stamp?.onSite).length;
  const red = slots.filter((s) => s.stamp && !s.stamp.onSite).length;
  return (
    <span className={cn("flex flex-wrap gap-1", className)} aria-hidden>
      {slots.map((slot, i) => (
        <span
          key={slot.place.id}
          className={cn(
            "h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2",
            i < gold
              ? "bg-amber-500"
              : i < gold + red
                ? "bg-rose-500"
                : "border border-stone-300 dark:border-stone-600",
          )}
        />
      ))}
    </span>
  );
}

function NewBadge() {
  return (
    <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 py-px text-[9px] font-black tracking-wider text-white shadow-sm">
      NEW
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * あと少しで制覇
 * ------------------------------------------------------------------ */

function NextGoals({ rallies }: { rallies: RallyProgress[] }) {
  const { started, goals } = pickNextGoals(rallies);
  if (goals.length === 0) return null;

  return (
    <section aria-labelledby="stamp-goals">
      <SectionHeading
        id="stamp-goals"
        eyebrow={started ? "Almost there" : "Start here"}
        title={started ? "あと少しで制覇" : "まずはこの台紙から"}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard key={goal.rally.slug} goal={goal} />
        ))}
      </div>
    </section>
  );
}

function GoalCard({ goal }: { goal: RallyProgress }) {
  const { rally, count, total, slots } = goal;
  const unit = STAMP_META[rally.type].unit;
  const left = total - count;
  const reach = left === 1;
  const missing = slots.filter((s) => !s.stamp);
  const shown = missing.slice(0, 3);

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border p-4",
        reach
          ? "border-amber-300 bg-amber-50/70 dark:border-amber-700/60 dark:bg-amber-950/20"
          : "border-rose-200/80 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/10",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {rally.eng}
          </p>
          <h3 className="mt-0.5 text-sm font-bold leading-snug">{rally.title}</h3>
        </div>
        {/* 残り1つ。ビンゴと同じで、ここまで来た人は最後の1つを取りに行く。 */}
        {reach && (
          <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black tracking-wider text-white motion-safe:animate-pulse">
            リーチ
          </span>
        )}
      </div>

      <p className="mt-3 flex items-baseline gap-1 text-[13px] text-muted-foreground">
        {count === 0 ? (
          <>
            全
            <span className="font-serif text-3xl font-black leading-none tabular-nums text-foreground">
              {total}
            </span>
            {unit}
          </>
        ) : (
          <>
            あと
            <span
              className={cn(
                "font-serif text-4xl font-black leading-none tabular-nums",
                reach
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {left}
            </span>
            {unit}で制覇
          </>
        )}
      </p>

      <SlotDots slots={slots} className="mt-3" />

      <p className="mt-4 text-[11px] font-semibold text-muted-foreground">
        {count === 0 ? "最初の1個に" : left <= 3 ? "残りはここ" : "次に押すなら"}
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {shown.map((slot) => (
          <li key={slot.place.id}>
            <Link
              href={STAMP_META[slot.place.type].path(slot.place.slug)}
              className="group flex items-center gap-2.5 rounded-xl p-1 pr-1.5 transition hover:bg-background/80"
            >
              <img
                src={slot.place.image}
                alt=""
                loading="lazy"
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-background"
              />
              <span className="line-clamp-1 flex-1 text-[13px] font-medium">
                {slot.place.name}
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
      {missing.length > shown.length && (
        <Link
          href={rally.href}
          className="mt-2 text-[11px] font-semibold text-rose-600 hover:underline dark:text-rose-400"
        >
          ほか{missing.length - shown.length}
          {unit} →
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * ラリーの台紙
 * ------------------------------------------------------------------ */

function RallyShelf({ rallies, now }: { rallies: RallyProgress[]; now: number }) {
  const completed = rallies.filter((r) => r.completedAt).length;

  return (
    <section aria-labelledby="stamp-rallies">
      <SectionHeading
        id="stamp-rallies"
        eyebrow="Rallies"
        title="ラリーの台紙"
        aside={
          <p className="shrink-0 text-xs text-muted-foreground">
            制覇
            <span className="mx-1 font-serif text-base font-bold tabular-nums text-foreground">
              {completed}
            </span>
            / {rallies.length}
          </p>
        }
      />
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        1つのスタンプは、当てはまる台紙すべてに押されます。ビッグベンなら
        「定番」「ウェストミンスター」「王室」の3枚が同時に進みます。
      </p>

      <div className="mt-6 space-y-7">
        {RALLY_GROUPS.map((group) => {
          const items = rallies.filter((r) => r.rally.group === group.key);
          if (items.length === 0) return null;
          return (
            <div key={group.key}>
              <p className="flex items-baseline gap-2 text-xs font-bold">
                {group.label}
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {group.eng}
                </span>
              </p>
              <div className="mt-2.5 space-y-2.5">
                {items.map((progress) => (
                  <RallyCard
                    key={progress.rally.slug}
                    progress={progress}
                    // 定番の台紙だけ開いておく。台紙に欄が並ぶ様子を、
                    // 開かなくても1枚は見られるようにする。
                    defaultOpen={progress.rally.slug === "must-see"}
                    now={now}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RallyRing({
  count,
  total,
  Icon,
}: {
  count: number;
  total: number;
  Icon: LucideIcon;
}) {
  const complete = total > 0 && count >= total;
  const r = 19;
  const circumference = 2 * Math.PI * r;
  const filled = total > 0 ? (count / total) * circumference : 0;

  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center" aria-hidden>
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx={24} cy={24} r={r} fill="none" strokeWidth={4} className="stroke-muted" />
        {count > 0 && (
          <circle
            cx={24}
            cy={24}
            r={r}
            fill="none"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className={complete ? "stroke-amber-500" : "stroke-rose-500"}
          />
        )}
      </svg>
      <span
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-full",
          complete
            ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-sm shadow-amber-500/40"
            : "text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
    </span>
  );
}

function RallyCard({
  progress,
  defaultOpen,
  now,
}: {
  progress: RallyProgress;
  defaultOpen: boolean;
  now: number;
}) {
  const { rally, slots, count, total, completedAt } = progress;
  const unit = STAMP_META[rally.type].unit;
  const complete = completedAt !== null;

  return (
    <details
      id={`rally-${rally.slug}`}
      open={defaultOpen}
      className={cn(
        "group/rally overflow-hidden rounded-2xl border bg-card",
        complete
          ? "border-amber-300 dark:border-amber-700/60"
          : "border-border",
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-3.5 py-3 transition hover:bg-muted/40 sm:gap-4 sm:px-5 [&::-webkit-details-marker]:hidden">
        <RallyRing count={count} total={total} Icon={RALLY_ICONS[rally.slug] ?? MapPin} />

        <span className="block min-w-0 flex-1">
          <span className="block truncate text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {rally.eng}
          </span>
          <span className="line-clamp-2 text-[15px] font-bold leading-snug">
            {rally.title}
          </span>
          <SlotDots slots={slots} className="mt-1.5" />
        </span>

        {complete ? (
          <span className="block w-14 shrink-0 sm:w-16">
            <CompleteSeal date={completedAt} seed={rally.slug} />
            <span className="sr-only">制覇</span>
          </span>
        ) : (
          <span className="block shrink-0 text-right">
            <span className="block font-serif text-lg font-black leading-none tabular-nums">
              {count}
              <span className="text-xs font-semibold text-muted-foreground"> / {total}</span>
            </span>
            <span className="mt-1 block text-[11px] text-muted-foreground">
              あと{total - count}
              {unit}
            </span>
          </span>
        )}

        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open/rally:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="stamp-paper border-t border-border px-3 pb-5 pt-4 sm:px-5">
        <p className="text-xs leading-relaxed text-muted-foreground">{rally.blurb}</p>
        <ol className="mt-4 grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
          {slots.map((slot, i) => (
            <li key={slot.place.id}>
              <SlotTile slot={slot} number={i + 1} now={now} />
            </li>
          ))}
        </ol>
        <Link
          href={rally.href}
          className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
        >
          {rally.hrefLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </details>
  );
}

function SlotTile({
  slot,
  number,
  now,
}: {
  slot: RallySlot;
  number: number;
  now: number;
}) {
  const { place, stamp } = slot;
  const fresh = stamp ? isFresh(stamp.stampedAt, now) : false;

  return (
    <Link
      href={STAMP_META[place.type].path(place.slug)}
      className="group flex flex-col items-center text-center"
    >
      <span className="relative block w-full max-w-[104px]">
        {stamp ? (
          <StampImpression art={artOf(stamp)} pressing={fresh} />
        ) : (
          <StampSlot
            type={place.type}
            engName={place.engName}
            category={place.category}
            number={number}
            className="text-stone-300 transition-colors group-hover:text-rose-300 dark:text-stone-700 dark:group-hover:text-rose-800"
          />
        )}
        {fresh && <NewBadge />}
      </span>
      <span
        className={cn(
          "mt-1.5 line-clamp-2 text-[11px] leading-tight",
          stamp ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {place.name}
      </span>
      {stamp && (
        <span className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
          {formatStampDate(stamp.stampedAt)}
        </span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * 押したスタンプ
 * ------------------------------------------------------------------ */

function Collection({
  entries,
  totals,
  counts,
  now,
}: {
  entries: StampBookEntry[];
  totals: Record<StampType, number>;
  counts: Record<StampType, number>;
  now: number;
}) {
  return (
    <section aria-labelledby="stamp-collection">
      <SectionHeading
        id="stamp-collection"
        eyebrow="Collection"
        title="押したスタンプ"
        aside={
          <p className="shrink-0 text-xs text-muted-foreground">
            <span className="mr-0.5 font-serif text-base font-bold tabular-nums text-foreground">
              {entries.length}
            </span>
            個
          </p>
        }
      />

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {STAMP_TYPES.map((type) => (
          <TypeMeter key={type} type={type} count={counts[type]} total={totals[type]} />
        ))}
      </div>

      <div className="stamp-paper mt-4 rounded-3xl border border-border p-4 sm:p-6">
        {entries.length > 0 ? (
          <ol className="grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
            {entries.map((entry, i) => {
              const fresh = isFresh(entry.stampedAt, now);
              return (
                <li key={entry.stampId}>
                  <Link
                    href={STAMP_META[entry.type].path(entry.slug)}
                    className="group flex flex-col items-center text-center"
                  >
                    <span className="relative block w-full max-w-[104px] transition group-hover:-translate-y-0.5">
                      <StampImpression
                        art={artOf(entry)}
                        pressing={fresh}
                        // 新しいものから順に、少しずつずらして押す。
                        delay={fresh ? Math.min(i, 8) * 90 : 0}
                      />
                      {fresh && <NewBadge />}
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-tight group-hover:underline">
                      {entry.name}
                    </span>
                    <span className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
                      {formatStampDate(entry.stampedAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="grid w-full max-w-xs grid-cols-3 gap-4" aria-hidden>
              {STAMP_TYPES.map((type) => (
                <StampSlot
                  key={type}
                  type={type}
                  engName=""
                  category={null}
                  className="text-stone-300 dark:text-stone-700"
                />
              ))}
            </div>
            <p className="mt-5 text-sm font-semibold">まだ1個もありません</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              観光スポット・美術館・ミュージカルの各ページにある「スタンプを押す」から始まります。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function TypeMeter({
  type,
  count,
  total,
}: {
  type: StampType;
  count: number;
  total: number;
}) {
  const meta = STAMP_META[type];
  // 184分の1でも棒が見えるように、1個でも押していれば最低限の幅を出す。
  const percent = total > 0 ? Math.max((count / total) * 100, count > 0 ? 3 : 0) : 0;

  return (
    <Link
      href={meta.hubHref}
      className="block rounded-xl border border-border px-3.5 py-2.5 transition hover:border-rose-300 dark:hover:border-rose-800"
    >
      <span className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold">{meta.label}</span>
        <span className="tabular-nums text-muted-foreground">
          <span className="font-serif text-sm font-bold text-foreground">{count}</span> / {total}
        </span>
      </span>
      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full origin-left rounded-full bg-rose-500 motion-safe:animate-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * 称号の一覧
 * ------------------------------------------------------------------ */

/**
 * 称号の一覧。名前は全部見せ、添え書きは次の称号までしか見せない。
 * その先は、なってからのお楽しみにしておく。
 */
function TitleLadder({ total }: { total: number }) {
  const { index } = stampTitleFor(total);

  return (
    <section aria-labelledby="stamp-titles">
      <SectionHeading id="stamp-titles" eyebrow="Titles" title="称号" />
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        押した数で上がります。観光客からロンドナーへ、その先は叙勲と叙爵。
      </p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {STAMP_TITLES.map((title, i) => {
          const reached = i <= index;
          const current = i === index;
          return (
            <li
              key={title.min}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-3.5 py-3",
                current
                  ? "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                  : reached
                    ? "border-border"
                    : "border-dashed border-border",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  reached
                    ? "bg-amber-500 text-white"
                    : "bg-muted text-muted-foreground",
                )}
                aria-hidden
              >
                {reached ? <Check className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className={cn("font-bold", !reached && "text-muted-foreground")}>
                    {title.title}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {title.eng}
                  </span>
                  {current && (
                    <span className="rounded-full bg-amber-500 px-2 py-px text-[10px] font-bold text-white">
                      いまここ
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {i <= index + 1 ? title.note : "この称号になると読めます。"}
                </span>
              </span>
              <span className="shrink-0 font-serif text-xs tabular-nums text-muted-foreground">
                {title.min}個〜
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
