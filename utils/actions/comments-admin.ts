"use server";

import { revalidatePath } from "next/cache";
import type { CommentTargetType } from "@prisma/client";
import db from "../db";
import { isAdmin } from "@/lib/admin";
import {
  COMMENT_MAX_CONTENT,
  OFFICIAL_AUTHOR,
  resolvePath,
} from "@/lib/comments";

/**
 * コメントの管理ページ(/admin/comments)の操作。
 *
 *   返信               読者のコメントに運営の返信を付ける(isOfficial = true)
 *   返信の編集・削除   運営の返信だけ。読者のコメントの本文は書き換えない
 *   非表示・再表示     読者のコメント。荒らしの記録を残すため物理削除はしない
 *
 * 記事ページはキャッシュされているので、書き換えたら対象の記事を作り直す。
 */

export type CommentActionState = { ok: boolean; message: string } | null;

const NOT_FOUND = { ok: false, message: "対象のコメントが見つかりません。" };

const TARGET_SELECT = {
  id: true,
  targetType: true,
  targetKey: true,
  parentId: true,
  isHidden: true,
  isOfficial: true,
} as const;

/**
 * フォームの id のコメントを引く。運営者でなければ null。
 * アクションは画面を通さず直接呼べるので、操作のたびに確かめる。
 */
async function loadTarget(formData: FormData) {
  if (!isAdmin()) return null;
  const id = String(formData.get("id") ?? "");
  if (!id) return null;
  return db.pageComment.findUnique({ where: { id }, select: TARGET_SELECT });
}

/** 読者のコメント(返信ではないもの)。 */
async function loadReaderComment(formData: FormData) {
  const row = await loadTarget(formData);
  return row && !row.parentId && !row.isOfficial ? row : null;
}

/** 運営の返信。 */
async function loadOfficialReply(formData: FormData) {
  const row = await loadTarget(formData);
  return row && row.parentId && row.isOfficial ? row : null;
}

function readContent(formData: FormData): string | CommentActionState {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { ok: false, message: "返信を入力してください。" };
  if (content.length > COMMENT_MAX_CONTENT) {
    return {
      ok: false,
      message: `返信は${COMMENT_MAX_CONTENT}文字以内にしてください。`,
    };
  }
  return content;
}

async function refresh(target: {
  targetType: CommentTargetType;
  targetKey: string;
}) {
  const path = await resolvePath(target);
  if (path) revalidatePath(path);
  revalidatePath("/admin/comments");
}

export async function replyToComment(
  _prev: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const parent = await loadReaderComment(formData);
  if (!parent) return NOT_FOUND;
  if (parent.isHidden) {
    return {
      ok: false,
      message: "非表示のコメントには返信できません。再表示してから返信してください。",
    };
  }

  const content = readContent(formData);
  if (typeof content !== "string") return content;

  await db.pageComment.create({
    data: {
      targetType: parent.targetType,
      targetKey: parent.targetKey,
      parentId: parent.id,
      author: OFFICIAL_AUTHOR,
      content,
      isOfficial: true,
    },
  });
  await refresh(parent);
  return { ok: true, message: "返信を載せました。" };
}

export async function updateReply(
  _prev: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const reply = await loadOfficialReply(formData);
  if (!reply) return NOT_FOUND;

  const content = readContent(formData);
  if (typeof content !== "string") return content;

  await db.pageComment.update({ where: { id: reply.id }, data: { content } });
  await refresh(reply);
  return { ok: true, message: "返信を直しました。" };
}

export async function deleteReply(
  _prev: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const reply = await loadOfficialReply(formData);
  if (!reply) return NOT_FOUND;

  await db.pageComment.delete({ where: { id: reply.id } });
  await refresh(reply);
  return { ok: true, message: "返信を消しました。" };
}

/** 読者のコメントを隠す・戻す。隠すと、付いている運営の返信も記事に出なくなる。 */
export async function setCommentHidden(
  _prev: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const row = await loadReaderComment(formData);
  if (!row) return NOT_FOUND;

  const hidden = formData.get("hidden") === "1";
  await db.pageComment.update({
    where: { id: row.id },
    data: { isHidden: hidden },
  });
  await refresh(row);
  return {
    ok: true,
    message: hidden ? "非表示にしました。" : "再表示しました。",
  };
}
