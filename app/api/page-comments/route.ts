import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { CommentTargetType } from "@prisma/client";
import db from "@/utils/db";
import { columnPath } from "@/components/column/jsonld";
import { attractionPath } from "@/components/sightseeing/jsonld";
import { museumPath } from "@/components/museums/jsonld";
import { housingGuidePath } from "@/components/housing/guides/guides";

/**
 * 記事ページの汎用コメント API。
 *
 * 旧掲示板(/api/chatboard)は入力を一切検証せず、そのまま Prisma に流していた。
 * こちらは公開ページに置くフォームなので、最低限の検証と長さ制限を入れる。
 * ログイン機構が無いため、荒らしは投稿後に isHidden で隠す運用が前提。
 */

const MAX_AUTHOR = 40;
const MAX_CONTENT = 2000;

/** 連投抑止。同一 sessionId から同じ記事への投稿を制限する間隔。 */
const COOLDOWN_MS = 30 * 1000;

function isTargetType(value: unknown): value is CommentTargetType {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(CommentTargetType, value)
  );
}

export async function GET(req: NextRequest) {
  const targetType = req.nextUrl.searchParams.get("targetType");
  const targetKey = req.nextUrl.searchParams.get("targetKey");

  if (!isTargetType(targetType) || !targetKey) {
    return NextResponse.json(
      { error: "targetType と targetKey は必須です" },
      { status: 400 }
    );
  }

  const comments = await db.pageComment.findMany({
    where: { targetType, targetKey, isHidden: false },
    orderBy: { createdAt: "desc" },
    select: { id: true, author: true, content: true, createdAt: true },
    take: 200,
  });

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
  if (trimmedContent.length > MAX_CONTENT) {
    return NextResponse.json(
      { error: `コメントは${MAX_CONTENT}文字以内で入力してください` },
      { status: 400 }
    );
  }

  // 名前は任意。空なら「匿名」で通す(名前の入力を必須にすると投稿が減る)。
  const rawAuthor = typeof author === "string" ? author.trim() : "";
  const finalAuthor = (rawAuthor || "匿名").slice(0, MAX_AUTHOR);

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
  // FOOD_TIP・HOUSING・COLUMN は targetKey がそのまま slug。
  // ATTRACTION・MUSEUM は targetKey が id(uuid)なので、パスを組むために
  // 一度 slug を引く(PageComment は対象への外部キーを持たないため)。
  switch (targetType) {
    case CommentTargetType.FOOD_TIP:
      revalidatePath(`/food/${targetKey}`);
      break;
    case CommentTargetType.HOUSING:
      revalidatePath(housingGuidePath(targetKey));
      break;
    case CommentTargetType.COLUMN:
      revalidatePath(columnPath(targetKey));
      break;
    case CommentTargetType.ATTRACTION: {
      const attraction = await db.attraction.findUnique({
        where: { id: targetKey },
        select: { slug: true },
      });
      if (attraction) revalidatePath(attractionPath(attraction.slug));
      break;
    }
    case CommentTargetType.MUSEUM: {
      const museum = await db.museum.findUnique({
        where: { id: targetKey },
        select: { slug: true },
      });
      if (museum) revalidatePath(museumPath(museum.slug));
      break;
    }
  }

  const res = NextResponse.json({ comment: created }, { status: 201 });
  res.cookies.set("sessionId", sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
