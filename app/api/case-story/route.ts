import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { findArticle } from "@/components/jobs/case-story/content/registry";
import { freeSectionCount } from "@/components/jobs/case-story/gate";
import type { Locale } from "@/components/jobs/case-story/types";

/**
 * 審判所の記録の、会員だけに出す節を返す。
 *
 * 章ページは全員に同じ HTML を返し、閉じた節は見出しだけ載せている
 * (components/jobs/case-story/gate.ts)。ログインしている読者のブラウザが
 * ここへ続きを取りに来る。
 *
 * 返すのは線より後の節だけ。線の前はページにもうあるので重ねて送らない。
 */

const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "ログインしてください", signedIn: false },
      { status: 401, headers: NO_STORE },
    );
  }

  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const locale: Locale =
    request.nextUrl.searchParams.get("locale") === "en" ? "en" : "ja";

  const article = findArticle(slug, locale);
  if (!article) {
    return NextResponse.json(
      { error: "not found" },
      { status: 404, headers: NO_STORE },
    );
  }

  const from = freeSectionCount(article.slug, article.sections.length);
  return NextResponse.json(
    { from, sections: article.sections.slice(from) },
    { headers: NO_STORE },
  );
}
