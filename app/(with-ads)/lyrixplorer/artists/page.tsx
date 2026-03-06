// app/artists/page.tsx
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchArtists } from "@/utils/actions/lyrics";
import Pagination from "@/components/home/Pagination";

function initials(name: string) {
  const s = (name || "").trim();
  if (!s) return "?";
  return Array.from(s).slice(0, 2).join("");
}

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams?: { page?: string; itemsPerPage?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);
  const itemsPerPage = Math.max(
    1,
    Number(searchParams?.itemsPerPage ?? 12) || 12,
  );
  const { artists, total } = await fetchArtists(page, itemsPerPage);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold">Artists</h1>
        <p className="text-sm text-muted-foreground">{total} artists</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.map((a) => (
          <Card
            key={a.id}
            className="rounded-2xl border hover:shadow-sm transition"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* image */}
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-muted">
                  {a.imageUrl ? (
                    <img
                      src={a.imageUrl}
                      alt={a.name}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-sm font-bold text-muted-foreground">
                      {initials(a.engName || a.name)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{a.name}</p>
                    {a.isHot && <Badge>Hot</Badge>}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {a.engName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a._count.songs} songs
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/lyrixplorer/artists/${a.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Pagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          baseUrl="/lyrixplorer/artists"
        />
      </section>
    </main>
  );
}
