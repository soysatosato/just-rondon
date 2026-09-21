"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { changeUsername, deleteProfile, rerollUsername } from "@/lib/profile";
import type { UsernameResult } from "@/lib/username";

/**
 * /account のサーバーアクション(ユーザーネームの変更と退会)。
 *
 * 誰の操作かは必ず auth() で決める。clerkId をクライアントから受け取ると、
 * 他人の名前を書き換えたり、他人のアカウントを消したりできてしまう。
 */

type Failure = { ok: false; error: string };

const SIGNED_OUT: Failure = { ok: false, error: "ログインし直してください" };

/**
 * 名前を出しているページの、ブラウザ側のキャッシュを捨てる。
 * どちらも動的描画だが、Next.js は直前に開いたページをしばらく使い回すため、
 * 名前を変えた直後にスタンプ帳へ戻ると古い名前が出る。
 */
function revalidateUsernamePages() {
  revalidatePath("/stamps");
  revalidatePath("/account");
}

export async function updateUsernameAction(
  input: unknown,
): Promise<UsernameResult> {
  const { userId } = auth();
  if (!userId) return SIGNED_OUT;
  if (typeof input !== "string") {
    return { ok: false, error: "ユーザーネームを入力してください" };
  }

  try {
    const result = await changeUsername(userId, input);
    if (result.ok) revalidateUsernamePages();
    return result;
  } catch (error) {
    console.error("updateUsernameAction", error);
    return { ok: false, error: "保存できませんでした。時間をおいてもう一度お試しください" };
  }
}

export async function rerollUsernameAction(): Promise<UsernameResult> {
  const { userId } = auth();
  if (!userId) return SIGNED_OUT;

  try {
    const result = await rerollUsername(userId);
    revalidateUsernamePages();
    return result;
  } catch (error) {
    console.error("rerollUsernameAction", error);
    return { ok: false, error: "引き直せませんでした。時間をおいてもう一度お試しください" };
  }
}

/**
 * 退会。サイト側の記録(Profile とスタンプ)を消してから Clerk のアカウントを消す。
 *
 * Clerk の UserProfile や Account Portal にも削除ボタンはあるが、あれは
 * Clerk 側しか消さず、スタンプが持ち主のいないまま DB に残る。だから
 * サイトでは UserProfile を使わず、こちらを使わせる。Account Portal の
 * ほうは、ダッシュボードで本人による削除を切っておくこと。
 *
 * 順番は DB が先。Clerk を先に消してから DB で失敗すると、もう誰も
 * ログインできないアカウントの記録が残り、本人には消す手段が無い。
 * DB だけ消えて Clerk で失敗したなら、アカウントが残るだけで、
 * もう一度押せば消せる。
 */
export async function deleteAccountAction(): Promise<{ ok: true } | Failure> {
  const { userId } = auth();
  if (!userId) return SIGNED_OUT;

  try {
    await deleteProfile(userId);
    await clerkClient().users.deleteUser(userId);
    return { ok: true };
  } catch (error) {
    console.error("deleteAccountAction", error);
    return { ok: false, error: "削除できませんでした。時間をおいてもう一度お試しください" };
  }
}
