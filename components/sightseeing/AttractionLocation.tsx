import Link from "next/link";
import dynamic from "next/dynamic";
import { ExternalLink, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DynamicMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

/**
 * 地図・住所・公式サイト。
 *
 * もとは Tabs で「Overview」「Map」に分かれていたが、Overview の中身は
 * 住所と公式サイトURLの2行しかなく、タブを1回クリックさせるだけの
 * 価値がなかった。地図と住所は同時に見たい情報なので、並べて出す。
 *
 * 住所が "-" のスポット(ツアー商品など、決まった住所を持たないもの)では
 * 地図を出さない。座標が中心部のダミーになっていることがあり、
 * 出すとかえって誤解させる。
 */
export default function AttractionLocation({
  name,
  engName,
  address,
  lat,
  lng,
  website,
}: {
  name: string;
  engName: string | null;
  address: string;
  lat: number;
  lng: number;
  website: string | null;
}) {
  const hasAddress = !!address && address !== "-";
  if (!hasAddress && !website) return null;

  // Google マップは英名で引くほうが正確に当たる。無ければ日本語名で引く。
  const mapsQuery = encodeURIComponent(engName || name);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}&query_place_id=${lat},${lng}`;

  return (
    <section id="location" className="scroll-mt-24 space-y-4">
      <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
        場所とアクセス
      </h2>

      {hasAddress && (
        <div className="overflow-hidden rounded-2xl border border-border">
          <DynamicMap lat={lat} lng={lng} />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {hasAddress && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-xl border border-border
              bg-muted/40 p-4 transition hover:border-neutral-400 hover:bg-muted"
          >
            <MapPin
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">住所</p>
              <p className="text-sm font-medium leading-snug group-hover:underline">
                {address}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Google マップで開く
              </p>
            </div>
          </a>
        )}

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-xl border border-border
              bg-muted/40 p-4 transition hover:border-neutral-400 hover:bg-muted"
          >
            <ExternalLink
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                公式サイト
              </p>
              <p className="text-sm font-medium leading-snug group-hover:underline">
                {name}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {/* URL をそのまま出すと長くて折り返すので、ホスト名だけ見せる */}
                {safeHost(website)}
              </p>
            </div>
          </a>
        )}
      </div>
    </section>
  );
}

/** URL が壊れていても落とさない。パースできなければ元の文字列を返す。 */
function safeHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
