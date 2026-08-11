import Link from "next/link";
import { Baby, ExternalLink, MapPin, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type RankedMuseum = {
  id: string;
  name: string;
  engName: string | null;
  slug: string;
  tagline: string | null;
  summary: string | null;
  blurb: string | null;
  price: number;
  address: string;
  image: string;
  website: string | null;
  isForChildren: boolean;
};

/**
 * 順位付きの特集リスト。10選・キッズ向けが共通で使う。
 * 以前は両ページがタブ+アコーディオン+カードをそれぞれコピペで持っていた。
 */
export default function MuseumRankedList({
  museums,
  showKidsBadge = false,
}: {
  museums: RankedMuseum[];
  showKidsBadge?: boolean;
}) {
  return (
    <ol className="space-y-6">
      {museums.map((m, i) => (
        <li
          key={m.id}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,320px)_1fr]">
            <Link
              href={`/museums/${m.slug}`}
              className="group relative block h-52 overflow-hidden bg-muted md:h-full"
            >
              <img
                src={m.image}
                alt={m.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
              />
            </Link>

            <div className="space-y-3 p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <Badge
                  className={
                    m.price === 0
                      ? "bg-emerald-600 text-white hover:bg-emerald-600"
                      : "bg-slate-800 text-white hover:bg-slate-800"
                  }
                >
                  <Ticket className="mr-1 h-3 w-3" />
                  {m.price === 0 ? "常設展 無料" : `£${m.price}〜`}
                </Badge>
                {showKidsBadge && m.isForChildren && (
                  <Badge className="bg-sky-600 text-white hover:bg-sky-600">
                    <Baby className="mr-1 h-3 w-3" />
                    子ども向き
                  </Badge>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  <Link
                    href={`/museums/${m.slug}`}
                    className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {m.name}
                  </Link>
                </h2>
                {m.engName && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {m.engName}
                  </p>
                )}
              </div>

              {m.blurb && (
                <p className="border-l-2 border-indigo-500 pl-3 text-sm italic leading-relaxed text-muted-foreground">
                  {m.blurb}
                </p>
              )}

              {m.summary && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {m.summary}
                </p>
              )}

              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{m.address}</span>
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild size="sm">
                  <Link href={`/museums/${m.slug}`}>見どころを読む</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${m.name} ${m.address} London`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    地図で見る
                  </Link>
                </Button>
                {m.website && (
                  <Button asChild size="sm" variant="ghost">
                    <Link
                      href={m.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      公式サイト
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
