import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { postId, content, author, parentId } = body;

  // IPアドレス取得
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] || req.ip || "unknown";

  // User-Agent
  const userAgent = req.headers.get("user-agent") || "unknown";

  // セッションID
  let sessionId = req.cookies.get("sessionId")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  await db.comment.create({
    data: {
      postId,
      content,
      author,
      parentId: parentId || null,
      ip,
      userAgent,
      sessionId,
    },
  });

  // コメント投稿後は元の投稿ページに戻す例
  const res = NextResponse.redirect(new URL(`/chatboard/${postId}`, req.url));
  res.cookies.set("sessionId", sessionId, { path: "/" });
  return res;
}
