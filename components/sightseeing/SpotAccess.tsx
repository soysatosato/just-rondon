import { ExternalLink, MapPin, Navigation, Train } from "lucide-react";
import LazyPropertyMap from "@/components/museums/LazyPropertyMap";
import type { AccessRoute, PracticalSource } from "@/lib/sightseeing/practical";
import { formatCheckedAt } from "@/lib/time-routes";

/**
 * 「行き方と地図」。最寄駅、ほかの行き方(公式で確かめた入口や電車)、
 * 住所、Google マップの経路検索、地図、公式サイトを1つの節に置く。
 *
 * 以前の「場所とアクセス」の節は地図と住所だけで、
 * 最寄駅はページ冒頭のファクトバーにしか無く、公園のように入口が
 * 複数ある場所を表せなかった。しかも節はページの最下部、広告の後ろにあった。
 * 「◯◯ どこ」「◯◯ 行き方」で来た読者がたどり着けるよう、歴史の読み物より
 * 前に置く。
 *
 * 住所が "-" のスポット(決まった場所を持たないツアー)では地図を出さない。
 * 座標が中心部の既定値になっていることがあり、出すと誤解させる。
 */
export default function SpotAccess({
  id,
  name,
  engName,
  address,
  lat,
  lng,
  nearestStation,
  routes,
  routesCheckedAt,
  routesSources,
  website,
  fromLondon = false,
}: {
  id: string;
  name: string;
  engName: string | null;
  address: string;
  lat: number;
  lng: number;
  nearestStation: string | null;
  routes: AccessRoute[];
  /** routes を公式で確かめた日("YYYY-MM-DD")。routes があるときだけ出す。 */
  routesCheckedAt?: string;
  routesSources?: PracticalSource[];
  website: string | null;
  /**
   * ロンドンの外にある場所(ウィンザー城など)。見出しを「ロンドンから◯◯への
   * 行き方」にする。読者が探しているのは駅からの道より、ロンドンからの乗り方。
   */
  fromLondon?: boolean;
}) {
  const hasAddress = !!address && address.trim() !== "-";
  if (!hasAddress && !nearestStation && routes.length === 0 && !website) {
    return null;
  }

  // 検索は英名+住所で引く(日本語名では Google マップの施設に当たらないことがある)。
  // 経路は住所(郵便番号つき)を行き先にする。名前より確実に入口の近くに着く。
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    engName ? `${engName}, ${address}` : address,
  )}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address,
  )}&travelmode=transit`;

  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
        {fromLondon ? `ロンドンから${name}への行き方` : `${name}への行き方と地図`}
      </h2>

      {(nearestStation || routes.length > 0) && (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {nearestStation && (
            <li className="flex gap-3 p-4">
              <Train className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">最寄駅</p>
                <p className="text-sm font-semibold leading-snug">{nearestStation}</p>
              </div>
            </li>
          )}
          {routes.map((route) => (
            <li key={route.label} className="flex gap-3 p-4">
              <Navigation
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug">{route.label}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {route.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {routes.length > 0 && routesCheckedAt && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          最寄駅以外の行き方は{formatCheckedAt(routesCheckedAt)}
          に公式の案内で確かめた内容です
          {routesSources && routesSources.length > 0 && (
            <>
              (
              {routesSources.map((source, i) => (
                <span key={source.url}>
                  {i > 0 && "、"}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:opacity-80"
                  >
                    {source.label}
                  </a>
                </span>
              ))}
              )
            </>
          )}
          。
        </p>
      )}

      {hasAddress && (
        <div className="space-y-3">
          <p className="flex items-start gap-2 text-sm leading-relaxed">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <span className="sr-only">住所: </span>
              {address}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Navigation className="h-4 w-4" aria-hidden />
              今いる場所からの経路
            </a>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <MapPin className="h-4 w-4" aria-hidden />
              Google マップで開く
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <LazyPropertyMap lat={lat} lng={lng} />
          </div>
        </div>
      )}

      {website && (
        <p className="text-sm">
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-link underline underline-offset-4 hover:opacity-80 dark:text-blue-400"
          >
            公式サイト({safeHost(website)})
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </p>
      )}
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
