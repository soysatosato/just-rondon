import { OG_HUBS } from "@/lib/og-hubs";
import { renderArticleOgCard, renderOgCard } from "@/lib/og-render";
import { OG_THEMES } from "@/components/og/OgCard";
import { fetchAreaBySlug } from "@/utils/actions/contents";

/**
 * 「ロンドンの街」のSNS共有カード。
 * 挿絵を直接 og:image に書けない理由は app/og/column/[slug]/route.tsx に同じ。
 */

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const content = await fetchAreaBySlug(params.slug);
  // 記事が消えていてもカードは返す。SNSは画像の取得に失敗しても
  // 静かに既定画像へ戻るだけで、404を返した側からは気付けない。
  if (!content) {
    const hub = OG_HUBS["areas"];
    return renderOgCard({
      badge: hub.badge,
      head: hub.head,
      tail: hub.tail,
      glyph: hub.glyph,
      photo: null,
      theme: OG_THEMES[hub.theme],
    });
  }

  return renderArticleOgCard({
    content,
    // 街の英語名をバッジに出す。カードを見た時点で「どの街の記事か」が
    // 分かるようにするためで、セクション名(LONDON, NEIGHBOURHOOD BY
    // NEIGHBOURHOOD)は長すぎてバッジに収まらない。
    badge: (content.engTitle ?? "LONDON").toUpperCase(),
    theme: "area",
    glyph: "街",
  });
}
