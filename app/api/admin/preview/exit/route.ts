import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";

/**
 * プレビューを終える。draft mode の cookie を消して管理ページへ戻す。
 *
 * 消すだけなので運営者かどうかは確かめない(cookie を持っていない人が
 * 呼んでも何も起きない)。
 */
export function GET(req: NextRequest) {
  draftMode().disable();
  return NextResponse.redirect(new URL("/admin/reading", req.url));
}
