import { renderOgCard } from "@/lib/og-render";
import {
  loadOgPhoto,
  splitWeeklyHeadline,
  weeklyOgRange,
} from "@/lib/og";
import { OG_THEMES } from "@/components/og/OgCard";
import { fetchBriefBySlug } from "@/utils/actions/weekly";

/**
 * 週次ダイジェスト「今週のロンドン」のSNS共有カード。
 *
 * 以前は全ページ共通の既定画像が出ていて、どの週の号を共有しても同じ絵に
 * なっていた。タイムラインで「今週号」だと分かるように、バッジに週の日付、
 * 本文に headline の目玉を出す。版面はコラム・イギリス英語と同じ OgCard。
 *
 * ルートハンドラにしている理由と /api/ の下に置かない理由は
 * app/og/british-english/[slug]/route.tsx に書いてある。
 */

export const dynamic = "force-dynamic";

const BADGE = "THIS WEEK IN LONDON";
/** 号に写真が無いときに左パネルへ敷く字。 */
const GLYPH = "週";
/** 写真を持つ号のための許可幅。記事カードと同じ。 */
const PHOTO_WIDTH = 500;

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const brief = await fetchBriefBySlug(params.slug);

  // 号が消えていてもカードは返す。SNSは画像の取得に失敗しても
  // 静かに既定画像へ戻るだけで、404を返した側からは気付けない。
  if (!brief) {
    return renderOgCard({
      badge: BADGE,
      head: "今週のロンドン",
      tail: "その週だけの催しや展覧会、ストライキや運休を、出典つきで毎週まとめています。",
      glyph: GLYPH,
      photo: null,
      theme: OG_THEMES.weekly,
    });
  }

  const { head, tail } = splitWeeklyHeadline(brief.headline);

  return renderOgCard({
    badge: `${BADGE}  ${weeklyOgRange(brief.weekStart, brief.weekEnd)}`,
    head,
    tail,
    glyph: GLYPH,
    photo: await loadOgPhoto(brief.image, PHOTO_WIDTH),
    theme: OG_THEMES.weekly,
  });
}
