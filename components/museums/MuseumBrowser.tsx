"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Clock, MapPin, Search, Star, TrainFront, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AREAS,
  AREA_BY_SLUG,
  DURATIONS,
  GENRES,
  GENRE_BY_SLUG,
  areaOf,
  durationBucket,
  formatDuration,
  genreOf,
  type AreaSlug,
  type DurationSlug,
  type GenreSlug,
} from "@/components/museums/taxonomy";

const MuseumsMapComponent = dynamic(
  () => import("@/components/museums/MuseumsMapComponent"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  },
);

export type BrowsableMuseum = {
  id: string;
  name: string;
  engName: string | null;
  slug: string;
  tagline: string | null;
  summary: string | null;
  highlights: string[];
  price: number;
  address: string;
  image: string;
  lat: number;
  lng: number;
  recommendLevel: number | null;
  isForChildren: boolean;
  /** 詳細ページの閲覧数(累計)。数字自体は出さず、人気順の並べ替えにだけ使う。 */
  views: number;
  museumInfo: {
    recommendedDuration: number | null;
    nearestStation: string | null;
  } | null;
};

/** 表示に必要な派生値を1度だけ計算しておく。カード側で毎回引くと参照が散らかる。 */
type DecoratedMuseum = BrowsableMuseum & {
  genre: GenreSlug;
  area: AreaSlug;
  duration: DurationSlug;
  durationLabel: string | null;
  /** 検索用に小文字化して連結した本文。 */
  haystack: string;
};

type SortKey = "recommended" | "popular" | "duration" | "name" | "price";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "おすすめ順" },
  { key: "popular", label: "人気順" },
  { key: "duration", label: "短時間で回れる順" },
  { key: "name", label: "名前順" },
  { key: "price", label: "料金が安い順" },
];

export default function MuseumBrowser({
  museums,
}: {
  museums: BrowsableMuseum[];
}) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<GenreSlug | "all">("all");
  const [duration, setDuration] = useState<DurationSlug | "all">("all");
  const [area, setArea] = useState<AreaSlug | "all">("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [kidsOnly, setKidsOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended");

  const decorated = useMemo<DecoratedMuseum[]>(
    () =>
      museums.map((m) => {
        const minutes = m.museumInfo?.recommendedDuration ?? null;
        return {
          ...m,
          genre: genreOf(m.slug),
          area: areaOf(m.slug),
          duration: durationBucket(minutes),
          durationLabel: formatDuration(minutes),
          // 収蔵品や展示内容で引けるようにする。「恐竜」「ゴッホ」「マグナカルタ」は
          // 館名にはどこにも出てこないが、読者が打つのはその言葉のほう。
          haystack: [
            m.name,
            m.engName,
            m.tagline,
            m.summary,
            m.address,
            m.museumInfo?.nearestStation,
            ...m.highlights,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        };
      }),
    [museums],
  );

  // 47件しかないので、検索も絞り込みも並べ替えも全てクライアント側で完結する。
  // サーバー往復が無いぶん体感が速く、ページネーションとの噛み合わせ問題も起きない。
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = decorated.filter((m) => {
      if (freeOnly && m.price !== 0) return false;
      if (kidsOnly && !m.isForChildren) return false;
      if (genre !== "all" && m.genre !== genre) return false;
      if (duration !== "all" && m.duration !== duration) return false;
      if (area !== "all" && m.area !== area) return false;
      if (!q) return true;
      return m.haystack.includes(q);
    });

    const sorted = [...filtered];
    if (sort === "popular") {
      // 閲覧数が並ぶ(公開直後は 0 が続く)ので、同数のときは元の並び
      // ——おすすめ度が高い順——を保つ。sort は安定なのでそのまま残る。
      sorted.sort((a, b) => b.views - a.views);
    } else if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    } else if (sort === "price") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === "duration") {
      sorted.sort(
        (a, b) =>
          (a.museumInfo?.recommendedDuration ?? 999) -
          (b.museumInfo?.recommendedDuration ?? 999),
      );
    }
    // "recommended" はサーバー側の並び(recommendLevel desc → createdAt asc)をそのまま使う
    return sorted;
  }, [decorated, search, genre, duration, area, freeOnly, kidsOnly, sort]);

  const isFiltering =
    search.trim() !== "" ||
    genre !== "all" ||
    duration !== "all" ||
    area !== "all" ||
    freeOnly ||
    kidsOnly;

  // 条件を何も付けていないときは、47件を並べても選べないのでテーマ別に切って読ませる。
  // ひとつでも絞り込むと「探している」状態なので、章立てを畳んで結果だけを出す。
  const mode: "sections" | "results" =
    isFiltering || sort !== "recommended" ? "results" : "sections";

  const sections = useMemo(
    () =>
      GENRES.map((g) => ({
        meta: g,
        items: visible.filter((m) => m.genre === g.slug),
      })).filter((s) => s.items.length > 0),
    [visible],
  );

  /**
   * 閲覧数がまだ1件も貯まっていないうちは「人気順」を出さない。
   * 全件0のまま並べ替えてもおすすめ順と同じ並びが返るだけで、
   * 選ばせておいて何も起きない選択肢になる。
   */
  const sortOptions = useMemo(
    () =>
      museums.some((m) => m.views > 0)
        ? SORTS
        : SORTS.filter((s) => s.key !== "popular"),
    [museums],
  );

  const essentials = useMemo(
    () => decorated.filter((m) => (m.recommendLevel ?? 0) >= 5),
    [decorated],
  );

  function reset() {
    setSearch("");
    setGenre("all");
    setDuration("all");
    setArea("all");
    setFreeOnly(false);
    setKidsOnly(false);
    setSort("recommended");
  }

  return (
    <div className="space-y-8">
      {/* はじめての1館。10館を再掲するとページが重くなるので、名前だけの導線にする。 */}
      <section className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-sm font-bold tracking-tight">
            はじめてのロンドンなら、まずこの{essentials.length}館
          </h2>
          <Link
            href="/museums/best-10-museums"
            className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-300"
          >
            見どころ付きの解説を読む →
          </Link>
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1.5">
          {essentials.map((m) => (
            <li key={m.id}>
              <Link
                href={`/museums/${m.slug}`}
                className="inline-block rounded-full border border-indigo-300 bg-background px-2.5 py-1 text-xs font-medium transition hover:border-indigo-500 hover:text-indigo-700 dark:border-indigo-800 dark:hover:text-indigo-300"
              >
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 検索・絞り込み */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="館名・展示内容・エリアで検索（例: 恐竜、ゴッホ、South Kensington）"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* ジャンル。この一覧でいちばん最初に効く軸なので、選択肢を畳まず全部見せる。 */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            何が置いてあるか
          </p>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              on={genre === "all"}
              onClick={() => setGenre("all")}
              label="すべて"
            />
            {GENRES.map((g) => {
              const count = decorated.filter((m) => m.genre === g.slug).length;
              return (
                <FilterChip
                  key={g.slug}
                  on={genre === g.slug}
                  onClick={() => setGenre(genre === g.slug ? "all" : g.slug)}
                  label={`${g.chip} ${count}`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <SelectField
            id="museum-duration"
            label="滞在時間"
            value={duration}
            onChange={(v) => setDuration(v as DurationSlug | "all")}
            options={[
              { value: "all", label: "指定なし" },
              ...DURATIONS.map((d) => ({ value: d.slug, label: d.label })),
            ]}
          />
          <SelectField
            id="museum-area"
            label="エリア"
            value={area}
            onChange={(v) => setArea(v as AreaSlug | "all")}
            options={[
              { value: "all", label: "ロンドン全域" },
              ...AREAS.map((a) => ({
                value: a.slug,
                label: `${a.label}（${
                  decorated.filter((m) => m.area === a.slug).length
                }）`,
              })),
            ]}
          />
          <div className="flex items-center gap-1.5 pb-0.5">
            <FilterChip
              on={freeOnly}
              onClick={() => setFreeOnly((v) => !v)}
              label="無料のみ"
            />
            <FilterChip
              on={kidsOnly}
              onClick={() => setKidsOnly((v) => !v)}
              label="子ども向き"
            />
          </div>
          <div className="ml-auto">
            <SelectField
              id="museum-sort"
              label="並び順"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={sortOptions.map((s) => ({
                value: s.key,
                label: s.label,
              }))}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{visible.length}</span>{" "}
            館を表示中（全 {museums.length} 館）
          </p>
          {area !== "all" && (
            <p className="text-xs text-muted-foreground">
              — {AREA_BY_SLUG[area].note}
            </p>
          )}
          {(isFiltering || sort !== "recommended") && (
            <button
              type="button"
              onClick={reset}
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <X className="h-3 w-3" />
              条件をリセット
            </button>
          )}
        </div>
      </div>

      {/* 一覧 */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            条件に合う館が見つかりませんでした。
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            条件をリセットする
          </button>
        </div>
      ) : mode === "sections" ? (
        <div className="space-y-12">
          {sections.map(({ meta, items }) => (
            <section key={meta.slug} className="space-y-4">
              <div className="border-l-4 border-indigo-500 pl-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                  {meta.eyebrow}
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                  {meta.label}
                  <span className="ml-2 text-sm font-medium text-muted-foreground">
                    {items.length}館
                  </span>
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {meta.blurb}
                </p>
              </div>
              <MuseumGrid items={items} showGenre={false} />
            </section>
          ))}
        </div>
      ) : (
        // ジャンルで絞り込んでいる最中は、全カードに同じジャンル名が付くだけなので出さない。
        <MuseumGrid items={visible} showGenre={genre === "all"} />
      )}

      {/* 地図 */}
      <section className="space-y-3 pt-4">
        <h2 className="text-lg font-bold tracking-tight">地図で探す</h2>
        <p className="text-sm text-muted-foreground">
          絞り込んだ {visible.length} 館を表示しています。
          泊まる場所の近くにどの館があるかを確認できます。
        </p>
        <div className="h-[420px] overflow-hidden rounded-xl border border-border">
          <MuseumsMapComponent museums={visible} />
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Button asChild variant="outline">
          <Link href="/museums">美術館ガイドのトップへ</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/museums/best-10-museums">絶対に行くべき10館</Link>
        </Button>
      </div>
    </div>
  );
}

function MuseumGrid({
  items,
  showGenre,
}: {
  items: DecoratedMuseum[];
  showGenre: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => (
        <MuseumResultCard key={m.id} museum={m} showGenre={showGenre} />
      ))}
    </div>
  );
}

function MuseumResultCard({
  museum: m,
  showGenre,
}: {
  museum: DecoratedMuseum;
  showGenre: boolean;
}) {
  const station = m.museumInfo?.nearestStation?.trim();

  return (
    <Link href={`/museums/${m.slug}`} className="group block">
      <Card className="flex h-full flex-col overflow-hidden border border-border transition hover:border-indigo-400 hover:shadow-lg">
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <img
            src={m.image}
            alt={m.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-1">
            {m.isForChildren && (
              <Badge className="bg-sky-600 text-white hover:bg-sky-600">
                キッズ
              </Badge>
            )}
            <Badge
              className={
                m.price === 0
                  ? "bg-emerald-600 text-white hover:bg-emerald-600"
                  : "bg-slate-800 text-white hover:bg-slate-800"
              }
            >
              {m.price === 0 ? "無料" : `£${m.price}〜`}
            </Badge>
          </div>
          {showGenre && (
            <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {GENRE_BY_SLUG[m.genre].label}
            </span>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold leading-snug tracking-tight transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {m.name}
              </h3>
              {m.engName && (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {m.engName}
                </p>
              )}
            </div>
            {(m.recommendLevel ?? 0) >= 5 && (
              <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>

          {m.tagline && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {m.tagline}
            </p>
          )}

          {/* 何が置いてあるか。館名からは絶対に分からないので、ここが選ぶ手がかりになる。 */}
          {m.highlights.length > 0 && (
            <ul className="flex flex-wrap gap-1">
              {m.highlights.slice(0, 3).map((h) => (
                <li
                  key={h}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {h}
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-auto space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
            {m.durationLabel && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <dt className="sr-only">滞在時間の目安</dt>
                <dd>{m.durationLabel}</dd>
              </div>
            )}
            {station && (
              <div className="flex items-center gap-1.5">
                <TrainFront className="h-3.5 w-3.5 shrink-0" />
                <dt className="sr-only">最寄り駅</dt>
                <dd className="truncate">{station}</dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <dt className="sr-only">エリア</dt>
              <dd className="truncate">{AREA_BY_SLUG[m.area].label}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </Link>
  );
}

function FilterChip({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        on
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-border bg-background text-muted-foreground hover:border-indigo-400 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
