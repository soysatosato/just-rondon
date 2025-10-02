import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, content, author } = body;

  // IPアドレス
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] || req.ip || "unknown";

  // User-Agent
  const userAgent = req.headers.get("user-agent") || "unknown";

  // セッションID
  let sessionId = req.cookies.get("sessionId")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  await db.post.create({
    data: { title, content, author, ip, userAgent, sessionId },
  });

  const res = NextResponse.redirect(new URL("/chatboard", req.url));
  res.cookies.set("sessionId", sessionId, { path: "/" });
  return res;
}
