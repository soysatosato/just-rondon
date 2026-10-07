"use server";

import { revalidatePath } from "next/cache";
import db from "../db";
import { isAdmin } from "@/lib/admin";
import { formatIgSlot, igSlotFor, nextIgSlot } from "@/lib/instagram/schedule";
import type { AdminActionState } from "./reading-admin";

/**
 * Instagram の管理ページ(/admin/instagram)の操作。状態の意味は
 * schema.prisma の InstagramPost のコメント。
 *
 *   承認                 draft    → approved(次の空き枠が入る)
 *   日付の変更           approved → approved(別の日の21:00)
 *   下書きに戻す         approved → draft
 *   アプリに入れた       approved → queued
 *   承認済みに戻す       queued   → approved(アプリの予約を取り消したとき)
 *   不採用               draft    → rejected
 *
 * queued の日付は動かせない。アプリ側の予約と食い違うので、動かすときは
 * 一度「承認済みに戻す」を経てもらう。
 */

const NOT_FOUND = { ok: false, message: "対象の投稿が見つかりません。" };

async function loadPost(formData: FormData) {
  if (!isAdmin()) return null;
  const id = String(formData.get("id") ?? "");
  if (!id) return null;
  return db.instagramPost.findUnique({
    where: { id },
    select: { id: true, status: true, scheduledAt: true },
  });
}

function done(message: string): AdminActionState {
  revalidatePath("/admin/instagram");
  revalidatePath("/ig");
  return { ok: true, message };
}

export async function approveIgPost(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const post = await loadPost(formData);
  if (!post) return NOT_FOUND;
  if (post.status !== "draft") {
    return { ok: false, message: "承認できるのは下書きだけです。" };
  }

  // 承認の直前に別の投稿が入っていてもずれないよう、ここで引き直す。
  const latest = await db.instagramPost.findFirst({
    where: { status: { in: ["approved", "queued"] }, scheduledAt: { not: null } },
    orderBy: { scheduledAt: "desc" },
    select: { scheduledAt: true },
  });
  const slot = nextIgSlot(latest?.scheduledAt ?? null);

  await db.instagramPost.update({
    where: { id: post.id },
    data: { status: "approved", scheduledAt: slot },
  });
  return done(`${formatIgSlot(slot)} の枠に入れました。`);
}

export async function rescheduleIgPost(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const post = await loadPost(formData);
  if (!post) return NOT_FOUND;
  if (post.status !== "approved") {
    return { ok: false, message: "日付を変えられるのは、アプリに入れる前の投稿だけです。" };
  }

  const slot = igSlotFor(String(formData.get("date") ?? ""));
  if (!slot) return { ok: false, message: "日付を選んでください。" };
  if (slot.getTime() <= Date.now()) {
    return { ok: false, message: `${formatIgSlot(slot)} はもう過ぎています。` };
  }

  await db.instagramPost.update({
    where: { id: post.id },
    data: { scheduledAt: slot },
  });
  return done(`${formatIgSlot(slot)} に変えました。`);
}

export async function unscheduleIgPost(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const post = await loadPost(formData);
  if (!post) return NOT_FOUND;
  if (post.status !== "approved") {
    return { ok: false, message: "下書きに戻せるのは承認済みの投稿だけです。" };
  }
  await db.instagramPost.update({
    where: { id: post.id },
    data: { status: "draft", scheduledAt: null },
  });
  return done("下書きに戻しました。");
}

export async function markIgQueued(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const post = await loadPost(formData);
  if (!post) return NOT_FOUND;
  if (post.status !== "approved") {
    return { ok: false, message: "承認済みの投稿だけに付けられます。" };
  }
  await db.instagramPost.update({
    where: { id: post.id },
    data: { status: "queued" },
  });
  return done("アプリの予約に入れた印を付けました。");
}

export async function unqueueIgPost(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const post = await loadPost(formData);
  if (!post) return NOT_FOUND;
  if (
    post.status !== "queued" ||
    !post.scheduledAt ||
    post.scheduledAt.getTime() <= Date.now()
  ) {
    return { ok: false, message: "戻せるのは、まだ投稿時刻が来ていない予約だけです。" };
  }
  await db.instagramPost.update({
    where: { id: post.id },
    data: { status: "approved" },
  });
  return done("承認済みに戻しました。アプリ側の予約も取り消してください。");
}

export async function rejectIgPost(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const post = await loadPost(formData);
  if (!post) return NOT_FOUND;
  if (post.status !== "draft") {
    return { ok: false, message: "不採用にできるのは下書きだけです。" };
  }
  await db.instagramPost.update({
    where: { id: post.id },
    data: { status: "rejected" },
  });
  return done("不採用にしました。");
}
