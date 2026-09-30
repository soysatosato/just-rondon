import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock,
  Stamp,
  TrainFront,
} from "lucide-react";

import StampImpression from "@/components/stamps/StampImpression";
import { COLUMN_BASE, columnPath } from "@/components/column/jsonld";
import { categoryLabel } from "@/components/sightseeing/categories";
import {
  AREAS_BASE,
  areaGuidePath,
} from "@/components/sightseeing/areas/areas";
import { cn } from "@/lib/utils";
import type {
  ShioriArea,
  ShioriColumn,
  ShioriData,
  ShioriPlace,
} from "@/lib/stamp-share";
import { STAMP_BOOK_HREF, STAMP_META, STAMP_TYPES } from "@/lib/stamps";

/**
 * 旅のしおり(/stamps/shiori/…)の表示。読むのは、しおりを受け取った友人。
 *
 * スタンプ帳(StampBook)と同じ場所を並べるが、読み手と目的が違う。
 * スタンプ帳は本人が「あと何個で制覇か」を見るもので、しおりは友人が
 * 「どこへ行けばいいか」を見るもの。だから台紙・称号の目盛り・押した日は
 * 出さず、上から次の順に読ませる。
 *
 * 1. 表紙: 誰のしおりで、何か所あるか。
 * 2. エリアで歩く: エリアガイドのエリアごとに、行った場所と、そのエリアの
 *    エリアガイドへの入口。
 * 3. そのほかの観光スポット・美術館・ミュージカル。
 * 4. 行く前に読むコラム。
 * 5. 自分もスタンプ帳を始める入口。
 *
 * 表紙は、スタンプ帳と同じえんじのパスポートの色にしてある。受け取った人が
 * 自分でスタンプ帳を開いたときに、同じものの続きだと分かるように。
 */
export default function ShioriView({
  username,
  data,
}: {
  username: string;
  data: ShioriData;
}) {
  const placeCount = STAMP_TYPES.reduce((sum, t) => sum + data.counts[t], 0);

  const sections: { id: string; label: string; show: boolean }[] = [
    { id: "shiori-areas", label: "エリアで歩く", show: data.areas.length > 0 },
    {
      id: "shiori-others",
      label: "そのほかの観光スポット",
      show: data.otherAttractions.length > 0,
    },
    { id: "shiori-museums", label: "美術館・博物館", show: data.museums.length > 0 },
    { id: "shiori-musicals", label: "ミュージカル", show: data.musicals.length > 0 },
    { id: "shiori-columns", label: "行く前に読む", show: data.columns.length > 0 },
  ];

  return (
    <div className="space-y-12">
      <Cover username={username} data={data} placeCount={placeCount} />

      {placeCount > 0 ? (
        <nav aria-label="しおりの目次" className="-mt-6">
          <ul className="flex flex-wrap gap-2">
            {sections
              .filter((s) => s.show)
              .map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold transition hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:text-rose-400"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
          </ul>
        </nav>
      ) : (
        <EmptyNote username={username} />
      )}

      {data.areas.length > 0 && (
        <section aria-labelledby="shiori-areas">
          <SectionHeading
            id="shiori-areas"
            eyebrow="Walk by Area"
            title="エリアで歩く"
          />
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            同じエリアの場所は、半日あれば歩いて回れます。歩く順番と近くの見どころは、各エリアのエリアガイドにまとめてあります。
          </p>
          <div className="mt-5 space-y-4">
            {data.areas.map((area) => (
              <AreaCard key={area.area.slug} area={area} />
            ))}
          </div>
        </section>
      )}

      <PlaceSection
        id="shiori-others"
        eyebrow="Sightseeing"
        title="そのほかの観光スポット"
        places={data.otherAttractions}
      />
      <PlaceSection
        id="shiori-museums"
        eyebrow="Museums"
        title="美術館・博物館"
        places={data.museums}
      />
      <PlaceSection
        id="shiori-musicals"
        eyebrow="West End"
        title="観たミュージカル"
        places={data.musicals}
      />

      {data.columns.length > 0 && (
        <ColumnSection
          columns={data.columns}
          personal={data.columns.some((c) => c.reason)}
        />
      )}

      <StartYourOwn />

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        このしおりは、{username} さんがジャスト・ロンドンのスタンプ帳から作ったものです。
        <br className="hidden sm:inline" />
        スタンプが増えると、しおりにも増えていきます。
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 表紙
 * ------------------------------------------------------------------ */

function Cover({
  username,
  data,
  placeCount,
}: {
  username: string;
  data: ShioriData;
  placeCount: number;
}) {
  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5b1629] via-[#420f1f] to-[#240811] px-5 pb-6 pt-7 text-white shadow-xl shadow-rose-950/20 ring-1 ring-black/5 dark:ring-white/10 sm:px-9 sm:pb-8 sm:pt-9">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-amber-200/10"
      />

      <div className="relative">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/90">
          <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-400" />
          Travel Notes
        </p>
        <h1 className="mt-3 text-sm font-bold text-white/80 [overflow-wrap:anywhere] sm:text-base">
          {username} さんの
          <span className="mt-1 block font-serif text-[2rem] font-black leading-tight tracking-tight text-amber-200 sm:text-5xl">
            ロンドン旅のしおり
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-white/75 sm:text-sm">
          {placeCount > 0
            ? `今度ロンドンへ行くあなたへ。${username} さんがスタンプを押した${placeCount}か所を、歩きやすいようにエリアごとにまとめました。`
            : `今度ロンドンへ行くあなたへ。${username} さんのスタンプ帳から作ったしおりです。`}
        </p>

        {data.highlights.length > 0 && (
          <div className="stamp-paper mt-6 rounded-2xl px-3 pb-3 pt-4 shadow-lg shadow-black/30 sm:px-5">
            <ul className="flex justify-center gap-2 sm:gap-4">
              {data.highlights.map((place) => (
                <li
                  key={place.key}
                  className="flex w-1/5 max-w-[96px] flex-col items-center text-center"
                >
                  <span className="block w-full">
                    <PlaceStamp place={place} />
                  </span>
                  <span className="mt-1 line-clamp-1 w-full text-[9px] font-semibold text-stone-700 dark:text-stone-200 sm:text-[11px]">
                    {place.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <dl className="mt-4 grid grid-cols-4 divide-x divide-white/10 overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
          <CoverStat label="観光" value={data.counts.attraction} />
          <CoverStat label="美術館" value={data.counts.museum} />
          <CoverStat label="観劇" value={data.counts.musical} />
          <div className="px-1.5 py-3 text-center">
            <dt className="text-[10px] font-semibold tracking-wide text-white/55 sm:text-[11px]">
              称号
            </dt>
            <dd className="mt-1.5 text-sm font-black leading-none text-amber-200 sm:text-lg">
              {data.title.title}
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

function CoverStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-1.5 py-3 text-center">
      <dt className="text-[10px] font-semibold tracking-wide text-white/55 sm:text-[11px]">
        {label}
      </dt>
      <dd className="mt-1.5 font-serif text-2xl font-black leading-none tabular-nums text-white sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}

function EmptyNote({ username }: { username: string }) {
  return (
    <div className="stamp-paper -mt-4 rounded-3xl border border-border px-5 py-8 text-center">
      <p className="text-sm font-semibold">
        {username} さんのしおりには、まだ場所がありません
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
        スタンプが押されると、ここに並びます。それまでは、エリアガイドから歩く場所を探してみてください。
      </p>
      <Link
        href={AREAS_BASE}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:underline dark:text-rose-400"
      >
        エリアガイドを見る
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 共通
 * ------------------------------------------------------------------ */

/** 見出しはスタンプ帳(StampBook の SectionHeading)と同じ形。 */
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
        <h2 id={id} className="mt-1.5 scroll-mt-24 text-lg font-bold tracking-tight sm:text-xl">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}

/**
 * 場所に押した印。日付は彫らず、金と赤も分けない(lib/stamp-share.ts の冒頭)。
 * 傾きは場所ごとに決まるので、同じ場所は表紙と一覧で同じ顔になる。
 */
function PlaceStamp({ place }: { place: ShioriPlace }) {
  return (
    <StampImpression
      art={{
        type: place.type,
        engName: place.engName,
        category: place.category,
        stampedAt: "",
        onSite: false,
        seed: place.key,
      }}
    />
  );
}

function kindLabel(place: ShioriPlace): string {
  if (place.type === "attraction" && place.category) {
    return categoryLabel(place.category);
  }
  return STAMP_META[place.type].label;
}

function PlaceCard({ place }: { place: ShioriPlace }) {
  return (
    <Link
      href={STAMP_META[place.type].path(place.slug)}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 pr-3 transition hover:border-rose-300 hover:shadow-sm dark:hover:border-rose-800"
    >
      <img
        src={place.image}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn(
          "h-16 w-16 shrink-0 rounded-xl object-cover sm:h-[4.5rem] sm:w-[4.5rem]",
          !place.bookable && "grayscale",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[10px] font-semibold text-muted-foreground">
          {kindLabel(place)}
        </span>
        <span className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400">
          {place.name}
        </span>
        {!place.bookable && (
          <span className="mt-1 inline-block rounded-full bg-muted px-2 py-px text-[10px] font-semibold text-muted-foreground">
            上演終了
          </span>
        )}
      </span>
      <span className="block w-11 shrink-0 sm:w-12" aria-hidden>
        <PlaceStamp place={place} />
      </span>
    </Link>
  );
}

function PlaceGrid({ places }: { places: ShioriPlace[] }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {places.map((place) => (
        <li key={place.key}>
          <PlaceCard place={place} />
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ *
 * エリアで歩く
 * ------------------------------------------------------------------ */

function AreaCard({ area: { area, places, rest } }: { area: ShioriArea }) {
  return (
    <article
      aria-labelledby={`shiori-area-${area.slug}`}
      className="stamp-paper overflow-hidden rounded-3xl border border-border"
    >
      <div className="px-4 pb-4 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {area.eyebrow}
            </p>
            <h3
              id={`shiori-area-${area.slug}`}
              className="mt-0.5 text-base font-bold leading-snug sm:text-lg"
            >
              {area.label}
            </h3>
          </div>
          <p className="shrink-0 text-xs text-muted-foreground">
            <span className="mr-0.5 font-serif text-xl font-black tabular-nums text-rose-600 dark:text-rose-400">
              {places.length}
            </span>
            か所
          </p>
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            歩く目安 {area.walkTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <TrainFront className="h-3 w-3" aria-hidden />
            {area.station}
          </span>
        </p>

        <div className="mt-4">
          <PlaceGrid places={places} />
        </div>
      </div>

      <Link
        href={areaGuidePath(area.slug)}
        className="group flex items-center justify-between gap-3 border-t border-border bg-rose-50/70 px-4 py-3.5 transition hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 sm:px-6"
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-rose-700 dark:text-rose-300">
            エリアガイドを読む
          </span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
            {rest > 0
              ? `歩く順番と、このエリアのほかの見どころ${rest}か所`
              : "歩く順番と、回るときのコツ"}
          </span>
        </span>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-rose-600 transition group-hover:translate-x-0.5 dark:text-rose-400"
          aria-hidden
        />
      </Link>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * エリアに属さない場所
 * ------------------------------------------------------------------ */

function PlaceSection({
  id,
  eyebrow,
  title,
  places,
}: {
  id: string;
  eyebrow: string;
  title: string;
  places: ShioriPlace[];
}) {
  if (places.length === 0) return null;
  return (
    <section aria-labelledby={id}>
      <SectionHeading
        id={id}
        eyebrow={eyebrow}
        title={title}
        aside={
          <p className="shrink-0 text-xs text-muted-foreground">
            <span className="mr-0.5 font-serif text-base font-bold tabular-nums text-foreground">
              {places.length}
            </span>
            {places[0] ? STAMP_META[places[0].type].unit : ""}
          </p>
        }
      />
      <div className="mt-4">
        <PlaceGrid places={places} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 行く前に読む
 * ------------------------------------------------------------------ */

/**
 * コラムの見出しは平均50字あるので、写真の上に重ねず横に並べる
 * (AttractionColumnLinks と同じ理由)。なぜ並んでいるかを1行添える。
 * 「関連記事」とだけ置くと、観光ガイドの焼き直しだと思われて踏まれない。
 */
function ColumnSection({
  columns,
  personal,
}: {
  columns: ShioriColumn[];
  /** 押した場所やそのエリアにちなむコラムが1本でもあるか。 */
  personal: boolean;
}) {
  return (
    <section aria-labelledby="shiori-columns">
      <SectionHeading id="shiori-columns" eyebrow="Before You Go" title="行く前に読むコラム" />
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        {personal
          ? "しおりの場所にまつわる歴史や逸話を、1本ずつ掘り下げた読み物です。知ってから行くと、同じ場所でも見え方が変わります。"
          : "ロンドンの歴史や逸話を、1本ずつ掘り下げた読み物です。知ってから行くと、同じ場所でも見え方が変わります。"}
      </p>
      <ul className="mt-4 space-y-3">
        {columns.map((column) => (
          <li key={column.id}>
            <Link
              href={columnPath(column.slug)}
              className="group flex gap-4 rounded-2xl border border-border p-3 transition hover:border-amber-300 hover:shadow-md dark:hover:border-amber-800 sm:p-4"
            >
              {column.image && (
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-36">
                  <img
                    src={column.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                {column.reason ? (
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    <BookOpen className="h-3 w-3 shrink-0" aria-hidden />
                    <span className="truncate">{column.reason}</span>
                  </p>
                ) : (
                  column.seriesName && (
                    <p className="truncate text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      連載「{column.seriesName}」
                    </p>
                  )
                )}
                <p className="line-clamp-3 text-sm font-semibold leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400">
                  {column.title}
                </p>
                {column.summary && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {column.summary}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={COLUMN_BASE}
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
      >
        コラムの一覧を見る
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 自分も始める
 * ------------------------------------------------------------------ */

/**
 * 受け取った人を、自分のスタンプ帳へ誘う。
 *
 * /stamps はログインしていなければ説明(StampBookIntro)を、していれば
 * 本人のスタンプ帳を出すので、どちらの人もここから同じリンクで送れる。
 */
function StartYourOwn() {
  return (
    <aside className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5b1629] via-[#420f1f] to-[#240811] px-5 py-7 text-white sm:px-9">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/90">
            <Stamp className="h-3.5 w-3.5" aria-hidden />
            Your Stamp Book
          </p>
          <p className="mt-2 text-lg font-bold">あなたも、行った場所にスタンプを</p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/70">
            観光スポット・美術館・観たミュージカルのページで押すだけの記録帳です。
            旅行から帰ったら、今度はあなたがしおりを渡す番です。
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link
            href={STAMP_BOOK_HREF}
            className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-2.5 text-sm font-bold text-[#3a0d1b] transition hover:bg-amber-200"
          >
            スタンプ帳をはじめる
          </Link>
          <Link
            href={AREAS_BASE}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-white/70 hover:text-white hover:underline"
          >
            エリアガイドの一覧
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}
