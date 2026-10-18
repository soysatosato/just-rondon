"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  SlidersHorizontal,
  Star,
  TicketCheck,
  TrainFront,
  Wallet,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CATEGORY_SECTIONS,
  categoryChipMap,
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
import { pickOne, useUrlState, type UrlStateCodec } from "@/hooks/use-url-state";
import { responsiveImage } from "@/lib/wikimedia-image";

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
  /** 詳細ページの閲覧数(累計)。数字自体は出さず、人気順の並べ替えにだけ使う。 */
  views: number;
  londonPass: boolean;
  londonPassNote: string | null;
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

type SortKey = "recommended" | "popular" | "duration" | "price" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "おすすめ順" },
  { key: "popular", label: "人気順" },
  { key: "duration", label: "短時間で回れる順" },
  { key: "price", label: "料金が安い順" },
  { key: "name", label: "名前順" },
];

/** 区分ごとにカードで出す件数。残りは名前のリンクで並べる。lg の3列で2段。 */
const CARDS_PER_SECTION = 6;

/** カードの写真の表示幅。スマホは左の96px、sm 以上は2〜3列のカード幅。 */
const CARD_IMAGE_SIZES =
  "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 96px";

type Filters = {
  search: string;
  category: string | "all";
  duration: DurationSlug | "all";
  price: PriceSlug | "all";
  area: string | "all";
  kidsOnly: boolean;
  mustSeeOnly: boolean;
  topOnly: boolean;
  passOnly: boolean;
  sort: SortKey;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  category: "all",
  duration: "all",
  price: "all",
  area: "all",
  kidsOnly: false,
  mustSeeOnly: false,
  topOnly: false,
  passOnly: false,
  sort: "recommended",
};

/**
 * 絞り込みの URL 表現。?category= はスポット詳細のカテゴリタグと
 * トップの「ツアーを見る」が使っているので、名前を変えないこと。
 */
const FILTERS_IN_URL: UrlStateCodec<Filters> = {
  keys: ["q", "category", "price", "duration", "area", "top", "mustsee", "kids", "pass", "sort"],
  parse: (p) => ({
    search: p.get("q") ?? "",
    category: pickOne(p.get("category"), Object.keys(categoryChipMap)) ?? "all",
    price: pickOne(p.get("price"), PRICE_FILTERS.map((f) => f.slug)) ?? "all",
    duration:
      pickOne(p.get("duration"), DURATION_FILTERS.map((f) => f.slug)) ?? "all",
    area: pickOne(p.get("area"), Object.keys(AREA_LABELS)) ?? "all",
    topOnly: p.get("top") === "1",
    mustSeeOnly: p.get("mustsee") === "1",
    kidsOnly: p.get("kids") === "1",
    passOnly: p.get("pass") === "1",
    sort: pickOne(p.get("sort"), SORTS.map((s) => s.key)) ?? "recommended",
  }),
  serialize: (f) => ({
    q: f.search.trim() ? f.search : null,
    category: f.category === "all" ? null : f.category,
    price: f.price === "all" ? null : f.price,
    duration: f.duration === "all" ? null : f.duration,
    area: f.area === "all" ? null : f.area,
    top: f.topOnly ? "1" : null,
    mustsee: f.mustSeeOnly ? "1" : null,
    kids: f.kidsOnly ? "1" : null,
    pass: f.passOnly ? "1" : null,
    sort: f.sort === "recommended" ? null : f.sort,
  }),
};

export default function AttractionBrowser({
  attractions,
}: {
  attractions: BrowsableAttraction[];
}) {
  // 絞り込みは URL に持たせる。詳細から戻っても条件が残り、
  // ?category= 付きのリンクで開けばその区分から始まる。
  const [filters, setFilters] = useUrlState(FILTERS_IN_URL);
  const {
    search,
    category,
    duration,
    price,
    area,
    kidsOnly,
    mustSeeOnly,
    topOnly,
    passOnly,
    sort,
  } = filters;
  const update = (patch: Partial<Filters>) =>
    setFilters((current) => ({ ...current, ...patch }));

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
      if (passOnly && !a.londonPass) return false;
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
    if (sort === "popular") {
      // 閲覧数が並ぶ(公開直後は 0 が続く)ので、同数のときは元の並び
      // ——おすすめ度が高い順——を保つ。sort は安定なのでそのまま残る。
      sorted.sort((a, b) => b.views - a.views);
    } else if (sort === "name") {
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
    passOnly,
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
    topOnly ||
    passOnly;

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

  /**
   * 閲覧数がまだ1件も貯まっていないうちは「人気順」を出さない。
   * 全件0のまま並べ替えてもおすすめ順と同じ並びが返るだけで、
   * 選ばせておいて何も起きない選択肢になる。
   */
  const sortOptions = useMemo(
    () =>
      attractions.some((a) => a.views > 0)
        ? SORTS
        : SORTS.filter((s) => s.key !== "popular"),
    [attractions],
  );

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
    setFilters(DEFAULT_FILTERS);
  }

  // 絞り込みを変えた後に結果の頭へ移る。スマホのボトムシートを閉じたときと、
  // 区分の「すべて見る」を押したときに使う。
  const resultsRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  function showResults() {
    setSheetOpen(false);
    // シートが閉じてスクロールのロックが外れてから動かす。
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ block: "start" }),
    );
  }

  // スマホの「絞り込み」ボタンに出す件数。検索語は横の入力欄に見えているので数えない。
  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (area !== "all" ? 1 : 0) +
    (duration !== "all" ? 1 : 0) +
    (price !== "all" ? 1 : 0) +
    [kidsOnly, mustSeeOnly, topOnly, passOnly].filter(Boolean).length +
    (sort !== "recommended" ? 1 : 0);

  /**
   * 絞り込みの部品。sm 以上はページに並べ、スマホはボトムシートの中に出す。
   * 同じ部品を2か所に置くので、label と select を結ぶ id には接頭辞を付ける。
   */
  function renderControls(idPrefix: string, { withSearch }: { withSearch: boolean }) {
    return (
      <div className="space-y-4">
        {withSearch && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="名前・内容・最寄駅で検索（例: 展望、テムズ、Tower Hill）"
              value={search}
              onChange={(e) => update({ search: e.target.value })}
              className="pl-9"
            />
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            種類
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Chip
              on={category === "all"}
              onClick={() => update({ category: "all" })}
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
                    update({ category: category === c.slug ? "all" : c.slug })
                  }
                  label={`${c.label} ${n}`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <Select
            id={`${idPrefix}-price`}
            label="料金"
            value={price}
            onChange={(v) => update({ price: v as PriceSlug | "all" })}
            options={[
              { value: "all", label: "指定なし" },
              ...PRICE_FILTERS.map((p) => ({ value: p.slug, label: p.label })),
            ]}
          />
          <Select
            id={`${idPrefix}-duration`}
            label="滞在時間"
            value={duration}
            onChange={(v) => update({ duration: v as DurationSlug | "all" })}
            options={[
              { value: "all", label: "指定なし" },
              ...DURATION_FILTERS.map((d) => ({
                value: d.slug,
                label: d.label,
              })),
            ]}
          />
          <Select
            id={`${idPrefix}-area`}
            label="エリア"
            value={area}
            onChange={(v) => update({ area: v })}
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
              onClick={() => update({ topOnly: !topOnly })}
              label="おすすめ度が高い"
            />
            <Chip
              on={mustSeeOnly}
              onClick={() => update({ mustSeeOnly: !mustSeeOnly })}
              label="定番"
            />
            <Chip
              on={kidsOnly}
              onClick={() => update({ kidsOnly: !kidsOnly })}
              label="子ども向き"
            />
            <Chip
              on={passOnly}
              onClick={() => update({ passOnly: !passOnly })}
              label="ロンドンパス対象"
            />
          </div>
          <div className="sm:ml-auto">
            <Select
              id={`${idPrefix}-sort`}
              label="並び順"
              value={sort}
              onChange={(v) => update({ sort: v as SortKey })}
              options={sortOptions.map((s) => ({
                value: s.key,
                label: s.label,
              }))}
            />
          </div>
        </div>
      </div>
    );
  }

  // 件数と、条件に付く但し書き。ページ上の絞り込み欄とシートの両方に出す。
  const summary = (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-xs text-muted-foreground">
        <span className="font-bold text-foreground">{visible.length}</span>{" "}
        件を表示中（全 {attractions.length} 件）
      </p>
      {(duration !== "all" || price !== "all") && (
        <p className="text-xs text-muted-foreground">
          — 料金や所要時間が未確認のスポットは、この条件では表示されません
        </p>
      )}
      {/*
        「対象」の意味をここで言い切っておく。パスが付けるのが音声ガイドや
        土産のガイドブックだけの無料館は対象に数えていないので、
        断りなく件数だけ出すと、対象一覧より少ないことが誤りに見える。
        出口も損益分岐のページにする——対象だと分かった読者が次に要るのは
        買う理由ではなく、何館回れば元が取れるかのほう。
      */}
      {passOnly && (
        <p className="text-xs text-muted-foreground">
          — 入場料をパスが肩代わりするスポットだけです（元から無料の館は含みません）。
          <Link
            href="/sightseeing/passes"
            className="ml-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            元が取れるか見る
          </Link>
        </p>
      )}
      {(isFiltering || sort !== "recommended") && (
        <button
          type="button"
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 py-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          <X className="h-3 w-3" />
          条件をリセット
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/*
        スマホ: 検索と「絞り込み」だけの1行を画面上端に貼り付け、細かい条件は
        ボトムシートで選ぶ。以前は絞り込み欄(約600px)を常に開いて並べており、
        一覧の最初のカードが2画面目まで下がっていた。
      */}
      <div className="sticky top-[var(--sticky-top,0px)] z-20 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur transition-[top] duration-300 motion-reduce:transition-none supports-[backdrop-filter]:bg-background/80 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="スポットを検索"
              placeholder="名前・駅で検索"
              value={search}
              onChange={(e) => update({ search: e.target.value })}
              className="h-10 pl-9"
            />
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-10 shrink-0 gap-1.5 px-3">
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                絞り込み
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-indigo-600 px-1.5 text-xs font-bold leading-5 text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-0"
            >
              <SheetHeader className="text-left">
                <SheetTitle>絞り込みと並び順</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                {renderControls("attraction-sheet", { withSearch: false })}
              </div>
              <div className="sticky bottom-0 -mx-6 mt-6 flex items-center gap-3 border-t border-border bg-background px-6 py-3">
                <button
                  type="button"
                  onClick={reset}
                  className="px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  リセット
                </button>
                <Button className="flex-1" onClick={showResults}>
                  {visible.length}件を表示
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="mt-1.5">{summary}</div>
      </div>

      <div className="hidden space-y-4 rounded-xl border border-border bg-card p-4 sm:block">
        {renderControls("attraction", { withSearch: true })}
        <div className="border-t border-border pt-3">{summary}</div>
      </div>

      <div ref={resultsRef} className="scroll-mt-32">
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
            {sections.map(({ meta, items }) => {
              // 区分ごとに、おすすめ度の高い順に先頭の数件だけをカードにする。
              // 残りは名前のリンクで並べる——184件をすべてカードにすると
              // スマホで約100画面になっていた。名前は残すので、どのスポットにも
              // この一覧から1手で行ける(検索エンジンにとっても同じ)。
              const cards = items.slice(0, CARDS_PER_SECTION);
              const rest = items.slice(CARDS_PER_SECTION);
              const filterable = meta.slug in categoryChipMap;
              return (
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
                  <Grid items={cards} showCategory={false} />
                  {rest.length > 0 && (
                    <div className="rounded-xl border border-dashed border-border p-4">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {meta.label}のほかの{rest.length}件
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {rest.map((a) => (
                          <li key={a.id}>
                            <Link
                              href={`/sightseeing/${a.slug}`}
                              className="inline-block rounded-full border border-border bg-background px-3 py-1.5 text-xs transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              {a.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {/* 区分で絞り込んだ状態にする。条件は URL に残るので、
                          詳細を開いて戻ってもこの一覧のまま。 */}
                      {filterable && (
                        <button
                          type="button"
                          onClick={() => {
                            update({ category: meta.slug });
                            showResults();
                          }}
                          className="mt-3 inline-flex items-center py-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {meta.label}の{items.length}件を写真つきで見る →
                        </button>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <Grid items={visible} showCategory />
        )}
      </div>

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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
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
   *
   * スマホでは写真を左に置いた横長の1行(約110px)にする。縦のカード
   * (約430px)のままだと、184件の一覧が約100画面になっていた。
   * 一言の説明と英名は sm 以上でだけ出す。
   */
  return (
    <Card className="group relative flex h-full overflow-hidden border border-border transition hover:border-indigo-400 hover:shadow-lg sm:flex-col">
      <Link
        href={`/sightseeing/${a.slug}`}
        className="absolute inset-0 z-0"
        aria-label={`${a.name}の詳細を見る`}
      />
      <div className="relative w-24 shrink-0 self-stretch overflow-hidden bg-muted sm:h-40 sm:w-full sm:self-auto">
        <img
          {...responsiveImage(a.image, CARD_IMAGE_SIZES)}
          alt={a.name}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute right-2 top-2 hidden flex-wrap justify-end gap-1 sm:flex">
          {a.isForKids && (
            <Badge className="bg-sky-700 text-white hover:bg-sky-700">
              キッズ
            </Badge>
          )}
          {a.isFree && (
            <Badge className="bg-emerald-700 text-white hover:bg-emerald-700">
              無料
            </Badge>
          )}
        </div>
        {showCategory && (
          <span className="absolute bottom-2 left-2 hidden rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm sm:inline">
            {categoryLabel(a.category)}
          </span>
        )}
        {a.mustSee && (
          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-amber-700 px-2 py-0.5 text-xs font-bold text-white sm:bottom-2 sm:right-2">
            定番
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400 sm:text-base">
                {a.name}
              </h3>
              {a.engName && (
                <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">
                  {a.engName}
                </p>
              )}
            </div>
            {(a.recommendLevel ?? 0) >= 5 && (
              <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>

          {a.tagline && (
            <p className="hidden text-sm leading-relaxed text-muted-foreground sm:line-clamp-2">
              {a.tagline}
            </p>
          )}

          {/* 料金・所要時間・最寄駅。null は行ごと出さない(推測で埋めない方針)。
              スマホでは料金と所要時間を1行に並べる。 */}
          <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground sm:block sm:space-y-1 sm:border-t sm:border-border sm:pt-2">
            {a.priceAdult && (
              <div className="flex min-w-0 items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 shrink-0" />
                <dt className="sr-only">大人料金</dt>
                <dd className="truncate">{a.priceAdult}</dd>
              </div>
            )}
            {a.durationText && (
              <div className="flex min-w-0 items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <dt className="sr-only">滞在時間の目安</dt>
                <dd className="truncate">{a.durationText}</dd>
              </div>
            )}
            {a.nearestStation && (
              <div className="col-span-2 flex min-w-0 items-center gap-1.5">
                <TrainFront className="h-3.5 w-3.5 shrink-0" />
                <dt className="sr-only">最寄り駅</dt>
                <dd className="truncate">{a.nearestStation}</dd>
              </div>
            )}
            {/*
              ロンドンパス。LondonPassBadge を使わないのは、あれが判定ページへの
              <Link> で、カード全面の覆いリンクと重なる対話要素になるため。
              ここは印だけ出して、行き先は詳細ページに任せる。
              条件付き(note あり)を無条件と同じ顔にはしない——会社や商品が
              限られるものを当てにしてパスを買われるのがいちばん困る。
            */}
            {a.londonPass && (
              <div className="col-span-2 hidden items-center gap-1.5 text-emerald-700 dark:text-emerald-400 sm:flex">
                <TicketCheck className="h-3.5 w-3.5 shrink-0" />
                <dt className="sr-only">ロンドンパス</dt>
                <dd className="truncate font-medium">
                  ロンドンパス対象
                  {a.londonPassNote && (
                    <span className="font-normal">（条件あり）</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>

        {/* プランに追加。リンクの覆いより前に出すため z-10 を付ける。 */}
        <div className="relative z-10 flex justify-end px-3 pb-3 sm:block sm:border-t sm:border-border sm:p-3">
          <AddToPlanButton slug={a.slug} name={a.name} />
        </div>
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
        className="block text-xs font-semibold text-muted-foreground"
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
