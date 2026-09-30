"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  publishShare,
  regenerateShare,
  shioriPath,
  unpublishShare,
} from "@/lib/stamp-share";
import { STAMP_BOOK_HREF } from "@/lib/stamps";

/**
 * 旅のしおり(スタンプ帳の公開リンク)のサーバーアクション。
 *
 * 誰の操作かは必ず auth() で決める。clerkId をクライアントから受け取ると、
 * 他人のスタンプ帳を公開したり、他人のリンクを止めたりできてしまう。
 *
 * 返すのはパスだけ。オリジンはブラウザ側で足す(招待リンクと同じ理由で、
 * 開発環境で本番の URL を配ってしまわないように)。
 */

type Failure = { ok: false; error: string };

const SIGNED_OUT: Failure = { ok: false, error: "ログインし直してください" };

export type ShioriLinkActionResult = { ok: true; path: string } | Failure;

/** しおりを公開する。もう公開していれば、同じリンクを返す。 */
export async function publishShioriAction(): Promise<ShioriLinkActionResult> {
  const { userId } = auth();
  if (!userId) return SIGNED_OUT;

  try {
    const token = await publishShare(userId);
    revalidatePath(STAMP_BOOK_HREF);
    return { ok: true, path: shioriPath(token) };
  } catch (error) {
    console.error("publishShioriAction", error);
    return { ok: false, error: "リンクを作れませんでした。時間をおいてもう一度お試しください" };
  }
}

/** リンクを作り直す。前のリンクは開けなくなる。 */
export async function regenerateShioriAction(): Promise<ShioriLinkActionResult> {
  const { userId } = auth();
  if (!userId) return SIGNED_OUT;

  try {
    const token = await regenerateShare(userId);
    revalidatePath(STAMP_BOOK_HREF);
    return { ok: true, path: shioriPath(token) };
  } catch (error) {
    console.error("regenerateShioriAction", error);
    return { ok: false, error: "リンクを作り直せませんでした。時間をおいてもう一度お試しください" };
  }
}

/** 公開をやめる。 */
export async function unpublishShioriAction(): Promise<{ ok: true } | Failure> {
  const { userId } = auth();
  if (!userId) return SIGNED_OUT;

  try {
    await unpublishShare(userId);
    revalidatePath(STAMP_BOOK_HREF);
    return { ok: true };
  } catch (error) {
    console.error("unpublishShioriAction", error);
    return { ok: false, error: "公開をやめられませんでした。時間をおいてもう一度お試しください" };
  }
}
