import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isResizableImage } from "@/lib/wikimedia-image";
import { spotGalleryFor } from "@/lib/sightseeing/gallery";

/**
 * ヒーローの下に並べる写真(lib/sightseeing/gallery.ts)。何が写っているかの
 * 1文と、作者・ライセンスを写真ごとに出す(Commons の CC は表示が利用の条件)。
 *
 * スマホは横に送る棚、PC は枚数ぶんの列の格子にする。PC で4列に固定すると、
 * 2枚しかないスポットで右半分が空く。押すと拡大する。
 *
 * 写真を持たないスポットでは何も描かない。
 */

const GRID_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export default function SpotGallery({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const photos = spotGalleryFor(slug);
  if (photos.length === 0) return null;
  const cols = GRID_COLS[Math.min(photos.length, 4)];

  return (
    <section aria-label={`${name}の写真`} className="mt-4">
      <ul
        className={`-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden ${cols}`}
      >
        {photos.map((photo) => (
          <li key={photo.url} className="w-[72%] shrink-0 snap-start sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label={`写真を拡大: ${photo.alt}`}
                  className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Image
                    src={photo.url}
                    unoptimized={!isResizableImage(photo.url)}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 72vw, 320px"
                    className="object-cover"
                    loading="lazy"
                  />
                </button>
              </DialogTrigger>
              <DialogContent
                aria-describedby={undefined}
                className="max-h-[95vh] max-w-[95vw] border-none bg-black/90 p-0"
              >
                <DialogTitle className="sr-only">{photo.alt}</DialogTitle>
                <figure>
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    className="max-h-[80vh] w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="space-y-1 p-3 text-sm text-white">
                    <span className="block">{photo.alt}</span>
                    <a
                      href={photo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-white/75 underline underline-offset-2"
                    >
                      画像: {photo.credit}
                    </a>
                  </figcaption>
                </figure>
              </DialogContent>
            </Dialog>
            <p className="mt-1.5 text-xs leading-snug">{photo.alt}</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              画像:{" "}
              <a
                href={photo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80"
              >
                {photo.credit}
              </a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
