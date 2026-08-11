"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Baby, MapPin, Search, Star } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  price: number;
  address: string;
  image: string;
  lat: number;
  lng: number;
  recommendLevel: number | null;
  isForChildren: boolean;
};

type SortKey = "recommended" | "name" | "price";

const FILTERS = [
  { key: "free", label: "無料のみ" },
  { key: "kids", label: "子ども向き" },
  { key: "top", label: "おすすめ度が高い" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function MuseumBrowser({
  museums,
}: {
  museums: BrowsableMuseum[];
}) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<FilterKey>>(new Set());
  const [sort, setSort] = useState<SortKey>("recommended");

  function toggle(key: FilterKey) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // 47件しかないので、検索も絞り込みも並べ替えも全てクライアント側で完結する。
  // サーバー往復が無いぶん体感が速く、ページネーションとの噛み合わせ問題も起きない。
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = museums.filter((m) => {
      if (active.has("free") && m.price !== 0) return false;
      if (active.has("kids") && !m.isForChildren) return false;
      if (active.has("top") && (m.recommendLevel ?? 0) < 4) return false;

      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        (m.engName?.toLowerCase().includes(q) ?? false) ||
        (m.tagline?.toLowerCase().includes(q) ?? false) ||
        m.address.toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered];
    if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    } else if (sort === "price") {
      sorted.sort((a, b) => a.price - b.price);
    }
    // "recommended" はサーバー側の並び(recommendLevel desc → createdAt asc)をそのまま使う
    return sorted;
  }, [museums, search, active, sort]);

  return (
    <div className="space-y-6">
      {/* 検索・絞り込み */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="館名・エリアで検索（例: テート、South Kensington）"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const on = active.has(f.key);
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => toggle(f.key)}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-border bg-background text-muted-foreground hover:border-indigo-400 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            <label
              htmlFor="museum-sort"
              className="text-xs text-muted-foreground"
            >
              並び順
            </label>
            <select
              id="museum-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
            >
              <option value="recommended">おすすめ順</option>
              <option value="name">名前順</option>
              <option value="price">料金が安い順</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{visible.length}</span> 館
          を表示中（全 {museums.length} 館）
          {(active.size > 0 || search) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActive(new Set());
              }}
              className="ml-2 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              条件をリセット
            </button>
          )}
        </p>
      </div>

      {/* 一覧 */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            条件に合う館が見つかりませんでした。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => (
            <Link key={m.id} href={`/museums/${m.slug}`} className="group block">
              <Card className="h-full overflow-hidden border border-border transition hover:shadow-lg">
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  <img
                    src={m.image}
                    alt={m.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    {m.isForChildren && (
                      <Badge className="bg-sky-600 text-white hover:bg-sky-600">
                        <Baby className="mr-1 h-3 w-3" />
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
                </div>

                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold leading-snug tracking-tight transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {m.name}
                    </h3>
                    {(m.recommendLevel ?? 0) >= 5 && (
                      <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                  </div>

                  {m.tagline && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {m.tagline}
                    </p>
                  )}

                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{m.address}</span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
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
