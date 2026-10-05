import { CommentTargetType } from "@prisma/client";
import db from "@/utils/db";
import { columnPath } from "@/components/column/jsonld";
import { attractionPath } from "@/components/sightseeing/jsonld";
import { museumPath } from "@/components/museums/jsonld";
import { housingGuidePath } from "@/components/housing/guides/guides";
import { SITE_NAME } from "@/lib/seo";
import type { PageCommentItem } from "@/components/comments/PageCommentSection";

/**
 * 記事コメント(PageComment)のサーバー側の共通処理。
 * 投稿 API(/api/page-comments)・記事ページ・管理ページ(/admin/comments)で使う。
 */

/** コメント本文の上限。読者の投稿と運営の返信で共通。 */
export const COMMENT_MAX_CONTENT = 2000;

/** 運営の返信の名前欄に入れる値。表示側は isOfficial を見て名前を出す。 */
export const OFFICIAL_AUTHOR = SITE_NAME;

export function isTargetType(value: unknown): value is CommentTargetType {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(CommentTargetType, value)
  );
}

/** 通知メールや管理ページに出すコンテンツ種別の表示名。 */
export const TARGET_LABEL: Record<CommentTargetType, string> = {
  [CommentTargetType.FOOD_TIP]: "食費ガイド",
  [CommentTargetType.COLUMN]: "コラム",
  [CommentTargetType.ATTRACTION]: "観光スポット",
  [CommentTargetType.MUSEUM]: "美術館・博物館",
  [CommentTargetType.HOUSING]: "住まいガイド",
};

type Target = { targetType: CommentTargetType; targetKey: string };

function targetId({ targetType, targetKey }: Target) {
  return `${targetType}:${targetKey}`;
}

/**
 * コメント対象のページパスをまとめて引く。再検証と通知メール・管理ページの
 * リンクに使う。キーは `${targetType}:${targetKey}`。
 *
 * ATTRACTION・MUSEUM は targetKey が id(uuid)なので slug を引き直す
 * (PageComment は対象への外部キーを持たない)。対象が既に消えていれば null。
 */
export async function resolvePaths(
  targets: Target[],
): Promise<Map<string, string | null>> {
  const idsOf = (type: CommentTargetType) =>
    Array.from(
      new Set(
        targets.filter((t) => t.targetType === type).map((t) => t.targetKey),
      ),
    );
  const attractionIds = idsOf(CommentTargetType.ATTRACTION);
  const museumIds = idsOf(CommentTargetType.MUSEUM);

  const [attractions, museums] = await Promise.all([
    attractionIds.length
      ? db.attraction.findMany({
          where: { id: { in: attractionIds } },
          select: { id: true, slug: true },
        })
      : [],
    museumIds.length
      ? db.museum.findMany({
          where: { id: { in: museumIds } },
          select: { id: true, slug: true },
        })
      : [],
  ]);
  const attractionSlug = new Map(attractions.map((a) => [a.id, a.slug]));
  const museumSlug = new Map(museums.map((m) => [m.id, m.slug]));

  const paths = new Map<string, string | null>();
  for (const t of targets) {
    let path: string | null;
    switch (t.targetType) {
      case CommentTargetType.FOOD_TIP:
        path = `/food/${t.targetKey}`;
        break;
      case CommentTargetType.HOUSING:
        path = housingGuidePath(t.targetKey);
        break;
      case CommentTargetType.COLUMN:
        path = columnPath(t.targetKey);
        break;
      case CommentTargetType.ATTRACTION: {
        const slug = attractionSlug.get(t.targetKey);
        path = slug ? attractionPath(slug) : null;
        break;
      }
      case CommentTargetType.MUSEUM: {
        const slug = museumSlug.get(t.targetKey);
        path = slug ? museumPath(slug) : null;
        break;
      }
    }
    paths.set(targetId(t), path);
  }
  return paths;
}

export async function resolvePath(target: Target): Promise<string | null> {
  const paths = await resolvePaths([target]);
  return paths.get(targetId(target)) ?? null;
}

/**
 * 記事ページに出すコメント。新しい順に、運営の返信を古い順でぶら下げる。
 *
 * 返信は isOfficial のものだけ引く。記事ページは返信をすべて「運営」として
 * 描くので、将来読者の返信を開けるときは、ここと表示の両方を直すこと。
 */
export async function loadPageComments(
  targetType: CommentTargetType,
  targetKey: string,
): Promise<PageCommentItem[]> {
  const rows = await db.pageComment.findMany({
    where: { targetType, targetKey, parentId: null, isHidden: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      author: true,
      content: true,
      createdAt: true,
      replies: {
        where: { isOfficial: true, isHidden: false },
        orderBy: { createdAt: "asc" },
        select: { id: true, content: true, createdAt: true },
      },
    },
    take: 200,
  });

  return rows.map((c) => ({
    id: c.id,
    author: c.author,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    replies: c.replies.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    })),
  }));
}

/**
 * 読者の名前欄に使わせない語。運営になりすませる名前を弾く。
 * 比較の前に全角・半角と大文字・小文字を揃え、空白と記号を落とす
 * (「ジャスト・ロンドン」「Ｊｕｓｔ　Ｒｏｎｄｏｎ」も同じに扱う)。
 */
const RESERVED_AUTHOR_WORDS = [
  "運営",
  "管理人",
  "管理者",
  "公式",
  "編集部",
  "ジャストロンドン",
  "じゃすとろんどん",
  "justrondon",
  "admin",
  "moderator",
  "official",
];

export function isReservedAuthor(name: string): boolean {
  const normalized = name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, "");
  return RESERVED_AUTHOR_WORDS.some((word) => normalized.includes(word));
}
