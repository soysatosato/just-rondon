import { OG_HUBS } from "@/lib/og-hubs";
import { renderArticleOgCard, renderOgCard } from "@/lib/og-render";
import { OG_THEMES } from "@/components/og/OgCard";
import { fetchColumnBySlug } from "@/utils/actions/contents";

/**
 * コラムのSNS共有カードを1本ずつ描く。
 *
 * 以前は記事の挿絵(Wikimedia Commons)のURLをそのまま og:image に書いていた。
 * これが3つの理由で壊れていた:
 *
 *   1. upload.wikimedia.org は facebookexternalhit を 403 で拒否する。
 *      Facebook・Messenger・Instagram・Threads では画像が出ない。
 *   2. 挿絵は縦横比が任意で、縦長・小さすぎるものが混ざる。X は 300px 未満を
 *      捨てるので、120x248 の肖像画の回は画像ごと消えていた。
 *   3. 原本には 5MB を超える写真があり、これも X の上限で捨てられる。
 *
 * 自分のドメインから 1200x630 の PNG を配れば3つとも同時に消える。写真は
 * こちらのサーバーから取り直すので、Facebook 向けの遮断にも当たらない。
 *
 * ルートハンドラにしている理由と /api/ の下に置かない理由は
 * app/og/british-english/[slug]/route.tsx に書いてある。
 */

/**
 * 都度描画する。URLに記事の updatedAt を ?v= として付けており、
 * 同じURLの中身は変わらない前提でCDNに immutable で持たせる。
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const content = await fetchColumnBySlug(params.slug);
  // 記事が消えていてもカードは返す。SNSは画像の取得に失敗しても
  // 静かに既定画像へ戻るだけで、404を返した側からは気付けない。
  if (!content) {
    const hub = OG_HUBS["column"];
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
    badge: "COLUMN",
    theme: "column",
    glyph: "掘",
  });
}
