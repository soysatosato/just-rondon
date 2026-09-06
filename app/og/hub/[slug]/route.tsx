import { OG_HUBS, type OgHubSlug } from "@/lib/og-hubs";
import { renderOgCard } from "@/lib/og-render";
import { OG_THEMES } from "@/components/og/OgCard";

/**
 * 読み物ハブのSNS共有カード。文面は lib/og-hubs.ts に置いてある。
 *
 * 記事のカードと同じ版面を使う。左パネルは写真のかわりにグラデーションと
 * 大きな1文字。セクションの色がそのまま出るので、4つのハブを並べても
 * どれがどれか一目で分かる。
 */

export const dynamic = "force-dynamic";

function isHubSlug(value: string): value is OgHubSlug {
  return Object.prototype.hasOwnProperty.call(OG_HUBS, value);
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  if (!isHubSlug(params.slug)) {
    return new Response("Not found", { status: 404 });
  }

  const hub = OG_HUBS[params.slug];
  return renderOgCard({
    badge: hub.badge,
    head: hub.head,
    tail: hub.tail,
    glyph: hub.glyph,
    photo: null,
    theme: OG_THEMES[hub.theme],
  });
}
