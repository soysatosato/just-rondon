import { OG_HUBS } from "@/lib/og-hubs";
import { renderArticleOgCard, renderOgCard } from "@/lib/og-render";
import { OG_THEMES } from "@/components/og/OgCard";
import { fetchModernBritainBySlug } from "@/utils/actions/contents";

/**
 * 「英国のいまを論じる」のSNS共有カード。
 * 挿絵を直接 og:image に書けない理由は app/og/column/[slug]/route.tsx に同じ。
 */

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const content = await fetchModernBritainBySlug(params.slug);
  // 記事が消えていてもカードは返す。SNSは画像の取得に失敗しても
  // 静かに既定画像へ戻るだけで、404を返した側からは気付けない。
  if (!content) {
    const hub = OG_HUBS["modern-britain"];
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
    badge: "BRITAIN, ARGUED",
    theme: "modern-britain",
    glyph: "今",
  });
}
