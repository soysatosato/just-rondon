import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { isAdmin } from "@/lib/admin";
import { SCHEDULED_CATEGORIES } from "@/lib/publish-schedule";

/**
 * 管理ページのプレビューを始める。運営者にだけ Next の draft mode の
 * cookie を渡し、記事ページへ送る。
 *
 * draft mode 中は ISR のキャッシュを通らずに描画され、詳細ページは下書きと
 * 予約中の記事も引けるようになる(utils/actions/contents.ts の visibleWhere)。
 *
 * 送り先は読み物の詳細ページだけに絞る。任意の URL を受けると、
 * 運営者を外部サイトへ飛ばすリンクを作れてしまう。
 */
const PREVIEW_PATH = new RegExp(
  `^/(${SCHEDULED_CATEGORIES.join("|")})/[a-z0-9-]+$`,
);

export function GET(req: NextRequest) {
  if (!isAdmin()) return new NextResponse(null, { status: 404 });

  const path = req.nextUrl.searchParams.get("path") ?? "";
  if (!PREVIEW_PATH.test(path)) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  draftMode().enable();
  return NextResponse.redirect(new URL(path, req.url));
}
