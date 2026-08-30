"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export type BrowsableArtwork = {
  id: string;
  title: string;
  engTitle: string | null;
  artist: string | null;
  year: string | null;
  room: string;
  image: string | null;
  mustSee: boolean;
  recommendLevel: number;
  // カードに出すのは先頭の1行だけなので、残りのハイライトはページ payload に載せない
  highlight: string | null;
};

type SortKey = "room" | "recommended" | "artist";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "room", label: "展示室順" },
  { key: "recommended", label: "必見・おすすめ順" },
  { key: "artist", label: "作者順" },
];

const roomAnchor = (room: string) =>
  `room-${room.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export default function ArtworkBrowser({
  slug,
  artworks,
  rooms,
}: {
  slug: string;
  /** 展示室順に並んだ全作品 */
  artworks: BrowsableArtwork[];
  /** 展示室の表示順 */
  rooms: string[];
}) {
  const [search, setSearch] = useState("");
  const [mustSeeOnly, setMustSeeOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("room");

  const mustSeeCount = useMemo(
    () => artworks.filter((a) => a.mustSee).length,
    [artworks],
  );

  // 最大でも228件なので、検索も絞り込みも並べ替えもクライアント側で完結させる。
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = artworks.filter((a) => {
      if (mustSeeOnly && !a.mustSee) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        (a.engTitle?.toLowerCase().includes(q) ?? false) ||
        (a.artist?.toLowerCase().includes(q) ?? false) ||
        a.room.toLowerCase().includes(q)
      );
    });

    if (sort === "artist") {
      return [...filtered].sort(
        (a, b) =>
          (a.artist ?? "").localeCompare(b.artist ?? "", "ja") ||
          a.title.localeCompare(b.title, "ja"),
      );
    }
    if (sort === "recommended") {
      return [...filtered].sort(
        (a, b) =>
          Number(b.mustSee) - Number(a.mustSee) ||
          b.recommendLevel - a.recommendLevel ||
          a.title.localeCompare(b.title, "ja"),
      );
    }
    // "room" はサーバー側の並び(展示室順 → 必見・おすすめ順)をそのまま使う
    return filtered;
  }, [artworks, search, mustSeeOnly, sort]);

  const grouped = useMemo(() => {
    if (sort !== "room") return null;
    const byRoom = new Map<string, BrowsableArtwork[]>();
    visible.forEach((a) => {
      const list = byRoom.get(a.room);
      if (list) list.push(a);
      else byRoom.set(a.room, [a]);
    });
    return rooms
      .filter((room) => byRoom.has(room))
      .map((room) => ({ room, items: byRoom.get(room)! }));
  }, [visible, rooms, sort]);

  const filtering = mustSeeOnly || search.trim() !== "";

  return (
    <div className="space-y-6">
      {/* 検索・絞り込み。作品数が多いので、スクロール中も操作できるよう追従させる */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="作品名・作者・展示室で検索（例: ゴッホ、Room 43）"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMustSeeOnly((v) => !v)}
              aria-pressed={mustSeeOnly}
              className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                mustSeeOnly
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-border bg-background text-muted-foreground hover:border-red-400 hover:text-foreground"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              必見のみ（{mustSeeCount}点）
            </button>

            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="artwork-sort" className="text-xs text-muted-foreground">
                並び順
              </label>
              <select
                id="artwork-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{visible.length}</span> 点を表示中（全{" "}
            {artworks.length} 点）
            {filtering && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setMustSeeOnly(false);
                }}
                className="ml-2 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                条件をリセット
              </button>
            )}
          </p>
        </div>
      </div>

      {/* 展示室が数十室あるので、一覧は畳んでおいて必要な人だけ開く */}
      {rooms.length > 1 && (
        <details className="rounded-xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-sm font-semibold">
            展示室から探す（{rooms.length}室）
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {rooms.map((room) => (
              <a
                key={room}
                href={`#${roomAnchor(room)}`}
                onClick={() => setSort("room")}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition hover:border-indigo-400 hover:text-foreground"
              >
                {room}
              </a>
            ))}
          </div>
        </details>
      )}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            条件に合う作品が見つかりませんでした。
          </p>
        </div>
      ) : grouped ? (
        grouped.map(({ room, items }) => (
          <section key={room} id={roomAnchor(room)} className="scroll-mt-40">
            <div className="mb-3 flex items-baseline gap-3 border-b border-border pb-2">
              <h2 className="text-base font-bold tracking-tight md:text-xl">{room}</h2>
              <span className="text-xs text-muted-foreground">{items.length}点</span>
            </div>
            <ArtworkGrid slug={slug} items={items} />
          </section>
        ))
      ) : (
        <ArtworkGrid slug={slug} items={visible} showRoom />
      )}
    </div>
  );
}

function ArtworkGrid({
  slug,
  items,
  showRoom = false,
}: {
  slug: string;
  items: BrowsableArtwork[];
  showRoom?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {items.map((art, i) => (
        <li key={art.id}>
          <Link
            href={`/museums/${slug}/artworks/${art.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-indigo-400 hover:shadow-md"
          >
            <div className="relative aspect-square bg-muted/60">
              {/* 絵画は縦横比がまちまちなので、切り抜かずに収める */}
              <img
                src={art.image || "/placeholder.jpg"}
                alt={art.title}
                className="absolute inset-0 h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.03]"
                loading={i < 4 ? "eager" : "lazy"}
                decoding="async"
              />
              {art.mustSee && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                  <Flame className="h-3 w-3" />
                  必見
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1 p-3">
              <h3 className="line-clamp-2 text-sm font-bold leading-snug transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {art.title}
              </h3>
              {art.engTitle && (
                <p className="line-clamp-1 text-[11px] italic text-muted-foreground">
                  {art.engTitle}
                </p>
              )}
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {art.artist || "作者不明"}
                {art.year ? `・${art.year}` : ""}
              </p>
              {art.highlight && (
                <div className="mt-1 hidden sm:block">
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    {art.highlight}
                  </p>
                </div>
              )}
              {showRoom && (
                <span className="mt-auto pt-2 text-[11px] font-medium text-muted-foreground">
                  {art.room}
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
