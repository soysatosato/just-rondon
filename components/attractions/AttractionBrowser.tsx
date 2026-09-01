"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Search, Star, TrainFront, Wallet, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CATEGORY_SECTIONS,
  categoryLabel,
} from "@/components/sightseeing/categories";
import AddToPlanButton from "@/components/attractions/plan/AddToPlanButton";
import {
  DURATION_FILTERS,
  PRICE_FILTERS,
  durationBucket,
  parseDurationMinutes,
  priceBucket,
  type DurationSlug,
  type PriceSlug,
} from "@/components/attractions/facts";

export type BrowsableAttraction = {
  id: string;
  name: string;
  engName: string | null;
  slug: string;
  tagline: string | null;
  summary: string | null;
  image: string;
  category: string;
  area: string | null;
  recommendLevel: number | null;
  mustSee: boolean;
  isForKids: boolean;
  isFree: boolean;
  priceAdult: string | null;
  durationText: string | null;
  nearestStation: string | null;
};

type Decorated = BrowsableAttraction & {
  duration: DurationSlug | null;
  minutes: number | null;
  price: PriceSlug | null;
  haystack: string;
};

/**
 * エリアの選択肢。
 *
 * Attraction.area はエリアガイド(/sightseeing/areas)の6区だけを持ち、
 * 「半日この辺りを歩く」に馴染まないスポットは意図的に null のまま。
 * 144件中70件が null なので、ここでも埋める側には回らず、
 * 「指定なし」のときは null の行もそのまま出す。
 */
const AREA_LABELS: Record<string, string> = {
  westminster: "ウェストミンスター",
  southbank: "サウスバンク",
  soho: "ソーホー",
  city: "シティ",
  greenwich: "グリニッジ",
  shoreditch: "ショーディッチ",
};

type SortKey = "recommended" | "duration" | "price" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "おすすめ順" },
  { key: "duration", label: "短時間で回れる順" },
  { key: "price", label: "料金が安い順" },
  { key: "name", label: "名前順" },
];

export default function AttractionBrowser({
  attractions,
}: {
  attractions: BrowsableAttraction[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | "all">("all");
  const [duration, setDuration] = useState<DurationSlug | "all">("all");
  const [price, setPrice] = useState<PriceSlug | "all">("all");
  const [area, setArea] = useState<string | "all">("all");
  const [kidsOnly, setKidsOnly] = useState(false);
  const [mustSeeOnly, setMustSeeOnly] = useState(false);
  const [topOnly, setTopOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended");

  const decorated = useMemo<Decorated[]>(
    () =>
      attractions.map((a) => ({
        ...a,
        duration: durationBucket(a.durationText),
        minutes: parseDurationMinutes(a.durationText),
        price: priceBucket(a.priceAdult),
        haystack: [
          a.name,
          a.engName,
          a.tagline,
          a.summary,
          a.nearestStation,
          categoryLabel(a.category),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      })),
    [attractions],
  );

  // 144件を一度に受け取っているので、絞り込みも並べ替えも往復なしで返せる。
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = decorated.filter((a) => {
      if (kidsOnly && !a.isForKids) return false;
      if (mustSeeOnly && !a.mustSee) return false;
      // 「おすすめ度が高い」は 4以上。完全一致にすると「★1だけ」という
      // 誰も求めていない絞り込みしか作れない。
      if (topOnly && (a.recommendLevel ?? 0) < 4) return false;
      if (category !== "all" && a.category !== category) return false;
      if (area !== "all" && a.area !== area) return false;
      // 料金・所要時間は原文が無い行があり、その場合 bucket は null になる。
      // 条件を付けたときは落とす——確かめられない行を混ぜると絞り込みが嘘になる。
      if (duration !== "all" && a.duration !== duration) return false;
      if (price !== "all" && a.price !== price) return false;
      if (!q) return true;
      return a.haystack.includes(q);
    });

    const sorted = [...filtered];
    if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    } else if (sort === "duration") {
      sorted.sort((a, b) => (a.minutes ?? 99999) - (b.minutes ?? 99999));
    } else if (sort === "price") {
      const rank = (p: PriceSlug | null) =>
        p === "free" ? 0 : p === "under20" ? 1 : p === "under40" ? 2 : p === "over40" ? 3 : 4;
      sorted.sort((a, b) => rank(a.price) - rank(b.price));
    }
    // "recommended" はサーバー側の並び(recommendLevel desc → name asc)をそのまま使う
    return sorted;
  }, [
    decorated,
    search,
    category,
    area,
    duration,
    price,
    kidsOnly,
    mustSeeOnly,
    topOnly,
    sort,
  ]);

  const isFiltering =
    search.trim() !== "" ||
    category !== "all" ||
    area !== "all" ||
    duration !== "all" ||
    price !== "all" ||
    kidsOnly ||
    mustSeeOnly ||
    topOnly;

  const mode: "sections" | "results" =
    isFiltering || sort !== "recommended" ? "results" : "sections";

  // CATEGORY_SECTIONS に無い category は最後にまとめる。分類を足し忘れても
  // スポットが一覧から消えないようにしておく。
  const sections = useMemo(() => {
    const known = new Set(CATEGORY_SECTIONS.map((c) => c.slug));
    const listed = CATEGORY_SECTIONS.map((meta) => ({
      meta,
      items: visible.filter((a) => a.category === meta.slug),
    })).filter((s) => s.items.length > 0);

    const rest = visible.filter((a) => !known.has(a.category));
    return rest.length > 0
      ? [
          ...listed,
          {
            meta: {
              slug: "other",
              label: "その他",
              eyebrow: "Other",
              blurb: "上のどの区分にも入っていないスポットです。",
            },
            items: rest,
          },
        ]
      : listed;
  }, [visible]);

  const counts = useMemo(() => {
    const byCategory = new Map<string, number>();
    const byArea = new Map<string, number>();
    for (const a of decorated) {
      byCategory.set(a.category, (byCategory.get(a.category) ?? 0) + 1);
      if (a.area) byArea.set(a.area, (byArea.get(a.area) ?? 0) + 1);
    }
    return { byCategory, byArea };
  }, [decorated]);

  function reset() {
    setSearch("");
    setCategory("all");
    setDuration("all");
    setPrice("all");
    setArea("all");
    setKidsOnly(false);
    setMustSeeOnly(false);
    setTopOnly(false);
    setSort("recommended");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="名前・内容・最寄駅で検索（例: 展望、テムズ、Tower Hill）"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            種類
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Chip
              on={category === "all"}
              onClick={() => setCategory("all")}
              label="すべて"
            />
            {CATEGORY_SECTIONS.map((c) => {
              const n = counts.byCategory.get(c.slug) ?? 0;
              if (n === 0) return null;
              return (
                <Chip
                  key={c.slug}
                  on={category === c.slug}
                  onClick={() =>
                    setCategory(category === c.slug ? "all" : c.slug)
                  }
                  label={`${c.label} ${n}`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <Select
            id="attraction-price"
            label="料金"
            value={price}
            onChange={(v) => setPrice(v as PriceSlug | "all")}
            options={[
              { value: "all", label: "指定なし" },
              ...PRICE_FILTERS.map((p) => ({ value: p.slug, label: p.label })),
            ]}
          />
          <Select
            id="attraction-duration"
            label="滞在時間"
            value={duration}
            onChange={(v) => setDuration(v as DurationSlug | "all")}
            options={[
              { value: "all", label: "指定なし" },
              ...DURATION_FILTERS.map((d) => ({
                value: d.slug,
                label: d.label,
              })),
            ]}
          />
          <Select
            id="attraction-area"
            label="エリア"
            value={area}
            onChange={setArea}
            options={[
              { value: "all", label: "指定なし" },
              ...Object.entries(AREA_LABELS)
                .filter(([slug]) => (counts.byArea.get(slug) ?? 0) > 0)
                .map(([slug, label]) => ({
                  value: slug,
                  label: `${label}（${counts.byArea.get(slug)}）`,
                })),
            ]}
          />
          <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
            <Chip
              on={topOnly}
              onClick={() => setTopOnly((v) => !v)}
              label="おすすめ度が高い"
            />
            <Chip
              on={mustSeeOnly}
              onClick={() => setMustSeeOnly((v) => !v)}
              label="定番"
            />
            <Chip
              on={kidsOnly}
              onClick={() => setKidsOnly((v) => !v)}
              label="子ども向き"
            />
          </div>
          <div className="ml-auto">
            <Select
              id="attraction-sort"
              label="並び順"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={SORTS.map((s) => ({ value: s.key, label: s.label }))}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{visible.length}</span>{" "}
            件を表示中（全 {attractions.length} 件）
          </p>
          {(duration !== "all" || price !== "all") && (
            <p className="text-xs text-muted-foreground">
              — 料金や所要時間が未確認のスポットは、この条件では表示されません
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

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            条件に合うスポットが見つかりませんでした。
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
                    {items.length}件
                  </span>
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {meta.blurb}
                </p>
                {meta.slug === "museum" && (
                  <Link
                    href="/museums/all-museums"
                    className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    美術館・博物館の全一覧へ →
                  </Link>
                )}
              </div>
              <Grid items={items} showCategory={false} />
            </section>
          ))}
        </div>
      ) : (
        <Grid items={visible} showCategory />
      )}

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Button asChild>
          <Link href="/plan">選んだスポットでプランを組む</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/sightseeing">観光ガイドのトップへ</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/sightseeing/areas">エリアごとに歩く</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/sightseeing/free">無料で楽しむ</Link>
        </Button>
      </div>
    </div>
  );
}

function Grid({
  items,
  showCategory,
}: {
  items: Decorated[];
  showCategory: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => (
        <SpotCard key={a.id} spot={a} showCategory={showCategory} />
      ))}
    </div>
  );
}

function SpotCard({
  spot: a,
  showCategory,
}: {
  spot: Decorated;
  showCategory: boolean;
}) {
  /*
   * カード全体をリンクにしつつ、「プランに追加」だけを上に浮かせる。
   *
   * 以前は <Link> でカードごと包んでいたが、その中にボタンを置くと
   * <a> の中に <button> が入り、押しても詳細ページへ遷移してしまう
   * (入れ子の対話要素はHTMLとして不正でもある)。リンクを絶対配置の
   * 覆いにして、ボタンだけを z-10 で前に出す。
   */
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border border-border transition hover:border-indigo-400 hover:shadow-lg">
      <Link
        href={`/sightseeing/${a.slug}`}
        className="absolute inset-0 z-0"
        aria-label={`${a.name}の詳細を見る`}
      />
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        <img
          src={a.image}
          alt={a.name}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-1">
          {a.isForKids && (
            <Badge className="bg-sky-600 text-white hover:bg-sky-600">
              キッズ
            </Badge>
          )}
          {a.isFree && (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              無料
            </Badge>
          )}
        </div>
        {showCategory && (
          <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {categoryLabel(a.category)}
          </span>
        )}
        {a.mustSee && (
          <span className="absolute bottom-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
            定番
          </span>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold leading-snug tracking-tight transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {a.name}
            </h3>
            {a.engName && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {a.engName}
              </p>
            )}
          </div>
          {(a.recommendLevel ?? 0) >= 5 && (
            <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </div>

        {a.tagline && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {a.tagline}
          </p>
        )}

        {/* 料金・所要時間・最寄駅。null は行ごと出さない(推測で埋めない方針)。 */}
        <dl className="mt-auto space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
          {a.priceAdult && (
            <div className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 shrink-0" />
              <dt className="sr-only">大人料金</dt>
              <dd className="truncate">{a.priceAdult}</dd>
            </div>
          )}
          {a.durationText && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <dt className="sr-only">滞在時間の目安</dt>
              <dd className="truncate">{a.durationText}</dd>
            </div>
          )}
          {a.nearestStation && (
            <div className="flex items-center gap-1.5">
              <TrainFront className="h-3.5 w-3.5 shrink-0" />
              <dt className="sr-only">最寄り駅</dt>
              <dd className="truncate">{a.nearestStation}</dd>
            </div>
          )}
        </dl>
      </CardContent>

      {/* プランに追加。リンクの覆いより前に出すため z-10 を付ける。 */}
      <div className="relative z-10 border-t border-border p-3">
        <AddToPlanButton slug={a.slug} name={a.name} />
      </div>
    </Card>
  );
}

function Chip({
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

function Select({
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
