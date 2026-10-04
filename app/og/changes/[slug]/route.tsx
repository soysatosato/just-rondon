import { renderOgCard } from "@/lib/og-render";
import { loadOgPhoto, splitWeeklyHeadline } from "@/lib/og";
import { OG_THEMES } from "@/components/og/OgCard";
import { fetchChangeIssueBySlug } from "@/utils/actions/changes";

/**
 * 「今月変わったロンドン」のSNS共有カード。
 *
 * バッジに号の月を、本文に headline を出す。headline は週次と同じく
 * 「いちばん効く変化の1文。ほかの変化の1文。」の形で書くので、割り方は
 * 週次の splitWeeklyHeadline をそのまま使う。
 *
 * ルートハンドラにしている理由と /api/ の下に置かない理由は
 * app/og/british-english/[slug]/route.tsx に書いてある。
 */

export const dynamic = "force-dynamic";

const BADGE = "WHAT CHANGED IN LONDON";
/** 号に写真が無いときに左パネルへ敷く字。 */
const GLYPH = "改";
const PHOTO_WIDTH = 500;

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const issue = await fetchChangeIssueBySlug(params.slug);

  // 号が無くてもカードは返す。SNSは画像の取得に失敗しても静かに既定画像へ
  // 戻るだけで、404を返した側からは気付けない。
  if (!issue) {
    return renderOgCard({
      badge: BADGE,
      head: "今月変わったロンドン",
      tail: "運賃・入場料・光熱費・最低賃金・ビザの改定と開業・閉館を、出典つきで毎月まとめています。",
      glyph: GLYPH,
      photo: null,
      theme: OG_THEMES.changes,
    });
  }

  const { head, tail } = splitWeeklyHeadline(issue.headline);

  return renderOgCard({
    badge: `${BADGE}  ${issue.slug.replace("-", ".")}`,
    head,
    tail,
    glyph: GLYPH,
    photo: await loadOgPhoto(issue.image, PHOTO_WIDTH),
    theme: OG_THEMES.changes,
  });
}
