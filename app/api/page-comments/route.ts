import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import db from "@/utils/db";
import {
  COMMENT_MAX_CONTENT,
  TARGET_LABEL,
  isReservedAuthor,
  isTargetType,
  loadPageComments,
  resolvePath,
} from "@/lib/comments";
import { sendAdminMail } from "@/utils/mail";
import { SITE_URL } from "@/lib/seo";

/**
 * 記事ページの汎用コメント API。
 *
 * 旧掲示板(/api/chatboard)は入力を一切検証せず、そのまま Prisma に流していた。
 * こちらは公開ページに置くフォームなので、最低限の検証と長さ制限を入れる。
 * ログイン機構が無いため、荒らしは投稿後に管理ページ(/admin/comments)で
 * 隠す運用が前提。
 *
 * ここで作るのは読者の新規コメントだけ。返信(parentId)と運営の印(isOfficial)は
 * 管理ページのサーバーアクションでしか書かない。
 */

const MAX_AUTHOR = 40;

/** 連投抑止。同一 sessionId から同じ記事への投稿を制限する間隔。 */
const COOLDOWN_MS = 30 * 1000;

export async function GET(req: NextRequest) {
  const targetType = req.nextUrl.searchParams.get("targetType");
  const targetKey = req.nextUrl.searchParams.get("targetKey");

  if (!isTargetType(targetType) || !targetKey) {
    return NextResponse.json(
      { error: "targetType と targetKey は必須です" },
      { status: 400 }
    );
  }

  const comments = await loadPageComments(targetType, targetKey);

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const { targetType, targetKey, author, content } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (!isTargetType(targetType)) {
    return NextResponse.json(
      { error: "対象の種類が不正です" },
      { status: 400 }
    );
  }

  if (typeof targetKey !== "string" || !targetKey.trim()) {
    return NextResponse.json(
      { error: "対象の記事が不明です" },
      { status: 400 }
    );
  }

  const trimmedContent =
    typeof content === "string" ? content.trim() : "";
  if (!trimmedContent) {
    return NextResponse.json(
      { error: "コメントを入力してください" },
      { status: 400 }
    );
  }
  if (trimmedContent.length > COMMENT_MAX_CONTENT) {
    return NextResponse.json(
      { error: `コメントは${COMMENT_MAX_CONTENT}文字以内で入力してください` },
      { status: 400 }
    );
  }

  // 名前は任意。空なら「匿名」で通す(名前の入力を必須にすると投稿が減る)。
  const rawAuthor = typeof author === "string" ? author.trim() : "";
  const finalAuthor = (rawAuthor || "匿名").slice(0, MAX_AUTHOR);

  // 「運営」「管理人」などの名前で運営の返信に見せかけるのを防ぐ。
  // 記事ページの運営表示は isOfficial の列からしか描かないが、名前の文字だけでも
  // 読者は運営の発言だと受け取りかねない。
  if (isReservedAuthor(finalAuthor)) {
    return NextResponse.json(
      {
        error:
          "このお名前は運営と紛らわしいため使えません。別のお名前にしてください。",
      },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.ip ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  let sessionId = req.cookies.get("sessionId")?.value;
  const isNewSession = !sessionId;
  if (!sessionId) sessionId = crypto.randomUUID();

  // 既存セッションのみ連投チェック(新規セッションは過去投稿を持たない)。
  if (!isNewSession) {
    const recent = await db.pageComment.findFirst({
      where: {
        targetType,
        targetKey,
        sessionId,
        createdAt: { gt: new Date(Date.now() - COOLDOWN_MS) },
      },
      select: { id: true },
    });

    if (recent) {
      return NextResponse.json(
        { error: "投稿の間隔が短すぎます。少し待ってからお試しください。" },
        { status: 429 }
      );
    }
  }

  const created = await db.pageComment.create({
    data: {
      targetType,
      targetKey: targetKey.trim(),
      author: finalAuthor,
      content: trimmedContent,
      ip,
      userAgent,
      sessionId,
    },
    select: { id: true, author: true, content: true, createdAt: true },
  });

  // 記事ページは静的生成なので、コメント一覧を差し替えるため明示的に再検証する。
  const path = await resolvePath({ targetType, targetKey: targetKey.trim() });
  if (path) revalidatePath(path);

  // 承認制ではなく投稿即公開なので、荒らしに気付けるよう管理者にメールで知らせる。
  // 送信に失敗してもコメント自体は保存済みなので、握りつぶして 201 を返す。
  try {
    await sendAdminMail({
      subject: `【コメント】${TARGET_LABEL[targetType]}: ${finalAuthor}`,
      text: [
        `${TARGET_LABEL[targetType]}に新しいコメントが投稿されました。`,
        "",
        `名前: ${finalAuthor}`,
        `日時: ${created.createdAt.toLocaleString("ja-JP", {
          timeZone: "Asia/Tokyo",
        })}`,
        path
          ? `ページ: ${SITE_URL}${path}`
          : `対象: ${targetType} / ${targetKey.trim()}`,
        "",
        "----",
        trimmedContent,
        "----",
        "",
        `返信・非表示: ${SITE_URL}/admin/comments#c-${created.id}`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("コメント通知メールの送信に失敗しました", error);
  }

  const res = NextResponse.json(
    { comment: { ...created, replies: [] } },
    { status: 201 }
  );
  res.cookies.set("sessionId", sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
