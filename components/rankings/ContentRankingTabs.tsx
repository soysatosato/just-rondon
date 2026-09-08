"use client";

import Link from "next/link";
import clsx from "clsx";
import * as TabsPrimitive from "@radix-ui/react-tabs";

/**
 * 読み物ハブ4面(英国を読む・コラム・イギリス英語・いまのイギリス)の、
 * 新着・週間・総合を切り替える棚。
 *
 * /reading だけは3セクションを跨いだ混成の一覧になる。棚の枠は親の紫、
 * 1件ずつの帯とチップは出身セクションの色(tone)という二重の配色にして、
 * 「3つの棚の総合である」ことを色で見せる。セクションのハブでは tone を
 * 渡さないので、全件が棚と同じ1色になる。
 *
 * 一覧はどれも createdAt の降順で、記事を足さない限り顔ぶれが動かない。
 * 既定の新着に読者側の軸(週間・総合)を足して、ハブのいちばん目立つ場所が
 * 毎週入れ替わるようにするのがこの棚の役目。/sightseeing の ViewRanking と
 * 狙いは同じだが、あちらは週間と総合を左右に並べる 2 カラムで、記事本文の
 * 要約を持たないスポット向けの作り。読み物は summary が主役になるので、
 * 3 つの軸をタブで切り替えて 1 軸ぶんの面積を広く使う。
 *
 * 見出しとタブ以外の文字は置かない。タブの名前(新着・週間ランキング・総合)が
 * そのまま並べ方の説明になっていて、その下にリード文を足すと、面積を食う割に
 * 何も足さない一文が毎回2つ挟まる。
 *
 * 同じ理由で、見出しに並べ方を書かない。「新着とランキング」と名乗ると、
 * すぐ右のタブと、その上の英字と、同じことを3回言うことになる。見出しは
 * 「何が置いてあるか」だけを言い、どの軸で並んでいるかはタブに任せる。
 *
 * DB には触らない。集計は呼び出し側(サーバー)で済ませ、ここは並べるだけ。
 * Date を渡さず整形済みの文字列を受けるのも、クライアント境界を跨いで
 * ロケール差の出る整形をやり直さないため。
 *
 * タブは「出せるものだけ」出す。日別の集計(DailyView)は運用開始から
 * 貯まるので、始めた直後は週間が空になる。件数の判断は呼び出し側
 * (MIN_WEEKLY)が行い、ここは渡された配列が空かどうかだけを見る。
 * 既定は先頭のタブ。新着は記事が1本でもあれば出せるので、週間が空の
 * 立ち上げ直後でも既定が総合に落ちることはない。
 */

export type RankingEntry = {
  /** リストの key。slug など、その一覧の中で一意なもの。 */
  key: string;
  href: string;
  title: string;
  /** 見出しの上に出す一言。イギリス英語なら英単語そのもの。 */
  eyebrow?: string | null;
  summary?: string | null;
  image?: string | null;
  /** 整形済みの公開日。 */
  date: string;
  /** 連載名など。無ければ出さない。 */
  badge?: string | null;
  /**
   * その1件だけ色を変えたいときのセクション名。
   *
   * 1セクションのハブでは全件が同じ色なので使わない。カテゴリを跨ぐ
   * /reading の棚だけが、行ごとに出身セクションの色を持つ。
   */
  tone?: RankingThemeName | null;
};

export type RankingThemeName =
  "reading" | "column" | "british-english" | "modern-britain";

/**
 * 配色。Tailwind はクラス名を文字列として拾うので、色を組み立てず
 * 完成したクラス名をそのまま置く。セクションごとの色は各ハブの
 * ヘッダー・カードと揃える(コラム=琥珀、英語=薔薇、いま=藍)。
 */
const THEMES: Record<
  RankingThemeName,
  {
    bar: string;
    dot: string;
    trigger: string;
    ring: string;
    text: string;
    chip: string;
    hero: string;
    rail: string;
  }
> = {
  /*
    3セクションを束ねる /reading の棚だけが使う色。紫は各セクションの
    琥珀・薔薇・藍のどれとも喧嘩しないので、混ざった一覧の枠に置ける。
  */
  reading: {
    bar: "bg-violet-500",
    dot: "bg-violet-500",
    trigger:
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-violet-500/30 focus-visible:ring-violet-400",
    ring: "hover:border-violet-300 dark:hover:border-violet-800",
    text: "text-violet-700 dark:text-violet-400",
    chip: "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
    hero: "from-violet-500 via-fuchsia-500 to-indigo-500",
    rail: "bg-violet-500",
  },
  column: {
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    trigger:
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-amber-500/30 focus-visible:ring-amber-400",
    ring: "hover:border-amber-300 dark:hover:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    hero: "from-amber-500 via-orange-500 to-rose-500",
    rail: "bg-amber-500",
  },
  "british-english": {
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    trigger:
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-rose-500/30 focus-visible:ring-rose-400",
    ring: "hover:border-rose-300 dark:hover:border-rose-800",
    text: "text-rose-700 dark:text-rose-400",
    chip: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    hero: "from-rose-500 via-red-500 to-orange-500",
    rail: "bg-rose-500",
  },
  "modern-britain": {
    bar: "bg-indigo-500",
    dot: "bg-indigo-500",
    trigger:
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/30 focus-visible:ring-indigo-400",
    ring: "hover:border-indigo-300 dark:hover:border-indigo-800",
    text: "text-indigo-700 dark:text-indigo-400",
    chip: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
    hero: "from-indigo-500 via-blue-500 to-cyan-500",
    rail: "bg-indigo-500",
  },
};

type Theme = (typeof THEMES)[RankingThemeName];

/**
 * その1件に使う色。tone を持つのはカテゴリを跨ぐ /reading の棚だけで、
 * 1セクションのハブでは棚の色がそのまま全件の色になる。
 */
function toneOf(entry: RankingEntry, fallback: Theme): Theme {
  return entry.tone ? THEMES[entry.tone] : fallback;
}

export default function ContentRankingTabs({
  title,
  eyebrow = "Start Here",
  kicker,
  weekly,
  allTime,
  latest,
  theme: themeName,
}: {
  title: string;
  /** 見出しの上の英字。既定は各セクションのハブと同じ "Start Here"。 */
  eyebrow?: string;
  /** 英字の右に添える一言。/reading の「3セクション横断」など。 */
  kicker?: string;
  weekly: RankingEntry[];
  allTime: RankingEntry[];
  latest: RankingEntry[];
  theme: RankingThemeName;
}) {
  const theme = THEMES[themeName];

  /*
    並びは新着・週間・総合。既定(いちばん左)を新着にしているのは、
    毎日更新しているものが更新した順に見えるのがハブの第一の役目で、
    再訪した人が最初に知りたいのも「前回から何が増えたか」だから。
    ランキングは2枚目以降に置いても、タブなら1クリックで届く。
  */
  const tabs = [
    latest.length > 0 && {
      id: "latest",
      label: "新着",
      eng: "New",
      live: false,
      items: latest,
      ranked: false,
    },
    weekly.length > 0 && {
      id: "weekly",
      label: "週間ランキング",
      eng: "Weekly",
      live: true,
      items: weekly,
      ranked: true,
    },
    allTime.length > 0 && {
      id: "all-time",
      label: "総合",
      eng: "All Time",
      live: false,
      items: allTime,
      ranked: true,
    },
  ].filter((t): t is Exclude<typeof t, false | undefined> => Boolean(t));

  if (tabs.length === 0) return null;

  return (
    <TabsPrimitive.Root defaultValue={tabs[0].id}>
      {/* 見出しとタブ。広い画面では同じ行に並べ、狭い画面ではタブが下に落ちる。 */}
      <div className="flex flex-col gap-4 border-b border-foreground/15 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span
              className={clsx("h-3 w-0.5 shrink-0 rounded-full", theme.bar)}
            />
            {eyebrow}
            {kicker && (
              <>
                <span className="text-foreground/20">/</span>
                <span className={clsx("tracking-[0.2em]", theme.text)}>
                  {kicker}
                </span>
              </>
            )}
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h2>
        </div>

        <TabsPrimitive.List
          aria-label="並べ方を切り替える"
          className="flex w-full shrink-0 items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white/70 p-1 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:w-auto"
        >
          {tabs.map((tab) => (
            <TabsPrimitive.Trigger
              key={tab.id}
              value={tab.id}
              className={clsx(
                "group relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold text-muted-foreground transition-all duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4 sm:text-sm",
                theme.trigger,
              )}
            >
              {tab.live && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span
                    className={clsx(
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 group-data-[state=active]:bg-white",
                      theme.dot,
                    )}
                  />
                  <span
                    className={clsx(
                      "relative inline-flex h-1.5 w-1.5 rounded-full group-data-[state=active]:bg-white",
                      theme.dot,
                    )}
                  />
                </span>
              )}
              {tab.label}
              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] opacity-60 md:inline">
                {tab.eng}
              </span>
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
      </div>

      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.id}
          value={tab.id}
          className="mt-5 focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-300"
        >
          {tab.ranked ? (
            <RankedPanel items={tab.items} theme={theme} />
          ) : (
            <LatestPanel items={tab.items} theme={theme} />
          )}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}

/**
 * ランキング面。1位だけを大きく出し、2位以下は詰めた行で続ける。
 *
 * 全件を同じ大きさで並べると順位が数字でしか伝わらない。1位に
 * 写真1枚ぶんの面積を与えると、切り替えた瞬間に何が変わったかが見える。
 */
function RankedPanel({
  items,
  theme,
}: {
  items: RankingEntry[];
  theme: Theme;
}) {
  const [lead, ...rest] = items;
  if (!lead) return null;

  // 混成の一覧では、1位の枠と地紋をその記事のセクション色にする。
  // 切り替えた瞬間に「どのセクションの記事が首位か」が色で分かる。
  const leadTheme = toneOf(lead, theme);

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <Link
        href={lead.href}
        className="group min-w-0 lg:col-span-5"
        aria-label={`1位 ${lead.title}`}
      >
        <article
          className={clsx(
            "relative flex h-full min-h-[15rem] flex-col justify-end overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70",
            leadTheme.ring,
          )}
        >
          {lead.image ? (
            <>
              <img
                src={lead.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/5" />
            </>
          ) : (
            <>
              <div
                className={clsx(
                  "absolute inset-0 bg-gradient-to-br",
                  leadTheme.hero,
                )}
              />
              {/* 写真の無いセクション(イギリス英語)向け。番号を大きな
                  地紋にして、写真の代わりに面を持たせる。 */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-4 -top-10 select-none text-[9rem] font-black leading-none text-white/20"
              >
                1
              </span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </>
          )}

          <div className="relative p-5 sm:p-6">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-900 shadow-sm">
                No.1
              </span>
              {lead.badge && (
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold text-white",
                    // 連載名は写真に馴染ませる。セクション名(混成の一覧)は
                    // 見分けが仕事なので、色を塗って前に出す。
                    lead.tone ? leadTheme.rail : "bg-white/20 backdrop-blur",
                  )}
                >
                  {lead.badge}
                </span>
              )}
              <span className="text-[11px] font-medium text-white/75">
                {lead.date}
              </span>
            </div>

            {lead.eyebrow && (
              <p className="mb-1 break-words text-2xl font-extrabold leading-tight tracking-tight text-white">
                {lead.eyebrow}
              </p>
            )}
            <h3 className="text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
              {lead.title}
            </h3>
            {lead.summary && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/80">
                {lead.summary}
              </p>
            )}
          </div>
        </article>
      </Link>

      {rest.length > 0 && (
        <ol
          start={2}
          className="min-w-0 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/60 lg:col-span-7"
        >
          {rest.map((item, i) => {
            const t = toneOf(item, theme);
            return (
              <li key={item.key} className="min-w-0">
                <Link
                  href={item.href}
                  className="group flex min-w-0 items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:gap-4 sm:px-5"
                >
                  <span
                    className={clsx(
                      "w-6 shrink-0 text-center text-xl font-black tabular-nums transition-colors sm:w-7 sm:text-2xl",
                      i < 2 ? t.text : "text-slate-300 dark:text-slate-700",
                    )}
                  >
                    {i + 2}
                  </span>

                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="hidden h-14 w-14 shrink-0 rounded-lg object-cover sm:block"
                      loading="lazy"
                      decoding="async"
                    />
                  )}

                  <span className="min-w-0 flex-1">
                    {/* 混成の一覧でだけ、行にセクション名を付ける。同じ順位表に
                      3セクションが混ざるので、色だけでは初見に伝わらない。 */}
                    {item.tone && item.badge && (
                      <span
                        className={clsx(
                          "mb-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                          t.chip,
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.eyebrow && (
                      <span
                        className={clsx(
                          "block truncate text-sm font-extrabold tracking-tight",
                          t.text,
                        )}
                      >
                        {item.eyebrow}
                      </span>
                    )}
                    <span className="block line-clamp-2 text-sm font-semibold leading-snug">
                      {item.title}
                    </span>
                    {item.summary && (
                      <span className="mt-0.5 hidden truncate text-[11px] text-muted-foreground sm:block">
                        {item.summary}
                      </span>
                    )}
                  </span>

                  <span className="hidden shrink-0 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/**
 * 新着面。順位が無いので、ランキングと同じ「1位＋行」の形にすると
 * 先頭が最上位に見えてしまう。カードを均等に並べ、いちばん新しい1枚にだけ
 * 印を付ける。
 */
function LatestPanel({
  items,
  theme,
}: {
  items: RankingEntry[];
  theme: Theme;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        // カード上端の帯と文字色は、混成の一覧では記事のセクション色。
        // 3色が混ざった帯が並ぶこと自体が「横断の棚」の合図になる。
        const t = toneOf(item, theme);
        return (
          <li key={item.key} className="min-w-0">
            <Link href={item.href} className="group block h-full">
              <article
                className={clsx(
                  "flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70",
                  t.ring,
                )}
              >
                <div className={clsx("h-1 w-full shrink-0", t.rail)} />

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {i === 0 && (
                      <span
                        className={clsx(
                          "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em]",
                          t.chip,
                        )}
                      >
                        New
                      </span>
                    )}
                    {item.tone && item.badge && (
                      <span className={clsx("text-[10px] font-bold", t.text)}>
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {item.date}
                    </span>
                  </div>

                  {item.eyebrow && (
                    <p
                      className={clsx(
                        "mb-1 break-words text-xl font-extrabold leading-tight tracking-tight",
                        t.text,
                      )}
                    >
                      {item.eyebrow}
                    </p>
                  )}
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug tracking-tight">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {item.summary}
                    </p>
                  )}

                  <p
                    className={clsx(
                      "mt-auto pt-3 text-right text-xs font-semibold transition-transform duration-200 group-hover:translate-x-0.5",
                      t.text,
                    )}
                  >
                    読む →
                  </p>
                </div>
              </article>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
