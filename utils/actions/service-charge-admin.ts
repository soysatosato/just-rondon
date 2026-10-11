"use server";

import { revalidatePath } from "next/cache";
import db from "../db";
import { isAdminSession } from "@/lib/admin";
import { STORES_BASE, storePath, storeSlug } from "@/lib/jobs/store-slug";
import type { AdminActionState } from "./reading-admin";

/**
 * サービスチャージ調査の自由記述の承認(/admin/service-charges)。
 *
 * 承認すると commentsApprovedAt に日時が入り、店舗ページ・一覧・声の一覧に
 * 文章が出る。取り消すと null に戻して伏せる。回答そのものは消さない。
 */
export async function setServiceChargeCommentsApproved(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  // アクションは画面を通さず直接呼べるので、操作のたびに確かめる。
  if (!(await isAdminSession())) {
    return { ok: false, message: "運営者としてログインしてください。" };
  }

  const id = String(formData.get("id") ?? "");
  const approve = formData.get("approve") === "1";

  const charge = await db.serviceCharge.findUnique({
    where: { id },
    select: { placeId: true, storeName: true, postcode: true },
  });
  if (!charge) return { ok: false, message: "対象の回答が見つかりません。" };

  await db.serviceCharge.update({
    where: { id },
    data: { commentsApprovedAt: approve ? new Date() : null },
  });

  // 店舗ページと一覧はキャッシュされているので作り直す。
  // ダッシュボードと声の一覧は毎回描画なのでそのままでよい。
  revalidatePath(storePath(storeSlug(charge)));
  revalidatePath(STORES_BASE);
  revalidatePath("/admin/service-charges");

  return {
    ok: true,
    message: approve ? "載せました。" : "伏せました。",
  };
}
