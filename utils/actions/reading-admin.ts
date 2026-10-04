"use server";

import { revalidatePath } from "next/cache";
import db from "../db";
import { isAdmin } from "@/lib/admin";
import {
  SCHEDULE_RULES,
  formatJst,
  formatLondon,
  isScheduledCategory,
  nextDailySlot,
  slotFor,
  type ScheduledCategory,
} from "@/lib/publish-schedule";

/**
 * 読み物の管理ページ(/admin/reading)の操作。要件は
 * docs/reading-scheduled-publishing.md §4。
 *
 * どれも publishedAt を書き換えるだけ。
 *
 *   承認         下書き(null) → 公開日時
 *   日付の変更   予約中 → 別の公開日時
 *   下書きに戻す 予約中 → null
 *
 * 公開済みの記事には触らせない。出たものを伏せたり日付を動かしたりすると、
 * 既に配った URL や sitemap と食い違う。
 *
 * 予約中の記事は読者に見えていないので、どの操作のあとも読者向けの
 * ページを作り直す必要はない。
 */

export type AdminActionState = { ok: boolean; message: string } | null;

const NOT_FOUND = { ok: false, message: "対象の記事が見つかりません。" };

async function loadTarget(formData: FormData) {
  if (!isAdmin()) return null;
  const id = String(formData.get("id") ?? "");
  if (!id) return null;
  const row = await db.content.findUnique({
    where: { id },
    select: { id: true, category: true, publishedAt: true },
  });
  if (!row || !isScheduledCategory(row.category)) return null;
  return { ...row, category: row.category as ScheduledCategory };
}

/** フォームの日付欄から、そのセクションの公開時刻を作る。過去なら弾く。 */
function slotFromForm(
  category: ScheduledCategory,
  formData: FormData,
): Date | string {
  const ymd = String(formData.get("date") ?? "");
  const slot = slotFor(category, ymd);
  if (!slot) return "日付を選んでください。";
  if (slot.getTime() <= Date.now()) {
    return `その日の公開時刻(ロンドン ${formatLondon(slot)})はもう過ぎています。`;
  }
  return slot;
}

function scheduled(slot: Date): AdminActionState {
  revalidatePath("/admin/reading");
  return {
    ok: true,
    message: `ロンドン ${formatLondon(slot)} / 日本 ${formatJst(slot)} に予約しました。`,
  };
}

export async function approveContent(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const row = await loadTarget(formData);
  if (!row) return NOT_FOUND;
  if (row.publishedAt) {
    return { ok: false, message: "この記事はもう承認されています。" };
  }

  let slot: Date;
  if (SCHEDULE_RULES[row.category].cadence === "daily") {
    // 毎日のセクションは日付を選ばせない。最後に入っている記事の翌日以降の
    // 空き枠に入れる。承認の直前に別の記事が入っていてもずれないよう、
    // ここで引き直す。
    const latest = await db.content.findFirst({
      where: { category: row.category, publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      select: { publishedAt: true },
    });
    slot = nextDailySlot(row.category, latest?.publishedAt ?? null);
  } else {
    const picked = slotFromForm(row.category, formData);
    if (typeof picked === "string") return { ok: false, message: picked };
    slot = picked;
  }

  await db.content.update({
    where: { id: row.id },
    data: { publishedAt: slot },
  });
  return scheduled(slot);
}

export async function rescheduleContent(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const row = await loadTarget(formData);
  if (!row) return NOT_FOUND;
  if (!row.publishedAt || row.publishedAt.getTime() <= Date.now()) {
    return { ok: false, message: "日付を変えられるのは予約中の記事だけです。" };
  }

  const picked = slotFromForm(row.category, formData);
  if (typeof picked === "string") return { ok: false, message: picked };

  await db.content.update({
    where: { id: row.id },
    data: { publishedAt: picked },
  });
  return scheduled(picked);
}

export async function unscheduleContent(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const row = await loadTarget(formData);
  if (!row) return NOT_FOUND;
  if (!row.publishedAt || row.publishedAt.getTime() <= Date.now()) {
    return { ok: false, message: "下書きに戻せるのは予約中の記事だけです。" };
  }

  await db.content.update({
    where: { id: row.id },
    data: { publishedAt: null },
  });
  revalidatePath("/admin/reading");
  return { ok: true, message: "下書きに戻しました。" };
}

/**
 * 「今月変わったロンドン」の号を公開する。
 *
 * 読み物と違って枠の予約はしない。月次号は「その月に何が変わったか」なので、
 * 承認した時点で出すのがいちばん早く役に立つ。公開済みの号は伏せない
 * (読み物と同じく、配った URL と食い違うため)。
 *
 * 読者に見えるようになるので、ハブと号のページのキャッシュを作り直す。
 */
export async function publishChangeIssue(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!isAdmin()) return NOT_FOUND;
  const id = String(formData.get("id") ?? "");
  if (!id) return NOT_FOUND;

  const issue = await db.monthlyChangeIssue.findUnique({
    where: { id },
    select: { id: true, slug: true, publishedAt: true },
  });
  if (!issue) return NOT_FOUND;
  if (issue.publishedAt) {
    return { ok: false, message: "この号はもう公開されています。" };
  }

  await db.monthlyChangeIssue.update({
    where: { id: issue.id },
    data: { publishedAt: new Date() },
  });
  revalidatePath("/admin/reading");
  revalidatePath("/changes");
  revalidatePath(`/changes/${issue.slug}`);
  return { ok: true, message: "公開しました。" };
}
