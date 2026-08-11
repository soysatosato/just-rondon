import { MapPin } from "lucide-react";

type HighlightSpot = {
  id: string;
  title: string;
  location: string | null;
  body: string;
};

/**
 * 「これだけは見て帰る」ポイント。
 * 作品データ(Artwork)が揃っている館は6館だけなので、画像を持たない
 * テキストの見どころをここで見せる。展示室・建築・体験も対象。
 */
export default function MuseumHighlightSpots({
  highlights,
  museumName,
}: {
  highlights: HighlightSpot[];
  museumName: string;
}) {
  if (highlights.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Must See
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          これだけは見て帰りたい
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {museumName}を短時間で回るなら、まずこの{highlights.length}つ。
          展示室の番号は改装で変わることがあるので、当日は館内の案内で確認してください。
        </p>
      </div>

      <ol className="space-y-4">
        {highlights.map((h, i) => (
          <li
            key={h.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 space-y-2">
                <h3 className="font-bold leading-snug tracking-tight">
                  {h.title}
                </h3>
                {h.location && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{h.location}</span>
                  </p>
                )}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {h.body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
