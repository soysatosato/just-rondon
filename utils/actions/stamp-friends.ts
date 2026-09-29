"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { acceptInvite, createInvite, unlinkFriend } from "@/lib/stamp-friends";
import {
  invitePath,
  MAX_FRIENDS,
  TOGETHER_HREF,
} from "@/lib/stamp-friends-shared";
import { STAMP_BOOK_HREF } from "@/lib/stamps";

/**
 * スタンプ帳のつながり(旅仲間)のサーバーアクション。
 *
 * 誰の操作かは必ず auth() で決める。clerkId をクライアントから受け取ると、
 * 他人の名前で招待を作ったり、他人のつながりを切ったりできてしまう。
 */

type Failure = { ok: false; error: string };

const SIGNED_OUT: Failure = { ok: false, error: "ログインし直してください" };

const FULL_ERROR = `つながれるのは${MAX_FRIENDS}人までです。使っていないつながりを解除してから、もう一度お試しください`;

/**
 * 旅仲間を出しているページの、ブラウザ側のキャッシュを捨てる。
 * どちらも動的描画だが、Next.js は直前に開いたページをしばらく使い回すため、
 * つないだ直後にスタンプ帳へ戻ると相手がまだ出ていないことがある。
 */
function revalidateFriendPages() {
  revalidatePath(STAMP_BOOK_HREF);
  revalidatePath(TOGETHER_HREF);
}

export type CreateInviteActionResult =
  | { ok: true; path: string; expiresAt: string }
  | Failure;

/**
 * 招待リンクを作る。
 *
 * 返すのはパスだけ。オリジンはブラウザ側で足す(開発環境で本番の
 * URL を配ってしまわないように)。
 */
export async function createStampInviteAction(): Promise<CreateInviteActionResult> {
  const { userId } = auth();
  if (!userId) return SIGNED_OUT;

  try {
    const result = await createInvite(userId);
    if (!result.ok) return { ok: false, error: FULL_ERROR };
    return {
      ok: true,
      path: invitePath(result.token),
      expiresAt: result.expiresAt.toISOString(),
    };
  } catch (error) {
    console.error("createStampInviteAction", error);
    return { ok: false, error: "招待リンクを作れませんでした。時間をおいてもう一度お試しください" };
  }
}

export type AcceptInviteActionResult =
  | { ok: true; friendId: string }
  | Failure;

export async function acceptStampInviteAction(
  token: unknown,
): Promise<AcceptInviteActionResult> {
  const { userId } = auth();
  if (!userId) return SIGNED_OUT;
  if (typeof token !== "string") {
    return { ok: false, error: "この招待リンクは使えません" };
  }

  try {
    const result = await acceptInvite(userId, token);
    if (result.ok) {
      revalidateFriendPages();
      return result;
    }
    switch (result.reason) {
      case "self":
        return { ok: false, error: "自分で作った招待リンクです。つなぎたい相手に送ってください" };
      case "full":
        return { ok: false, error: FULL_ERROR };
      default:
        return {
          ok: false,
          error: "この招待リンクは期限が切れたか、すでに使われています。送ってくれた人に、新しいリンクを作ってもらってください",
        };
    }
  } catch (error) {
    console.error("acceptStampInviteAction", error);
    return { ok: false, error: "つなげませんでした。時間をおいてもう一度お試しください" };
  }
}

export async function unlinkStampFriendAction(
  friendId: unknown,
): Promise<{ ok: true } | Failure> {
  const { userId } = auth();
  if (!userId) return SIGNED_OUT;
  if (typeof friendId !== "string" || friendId.length === 0 || friendId.length > 64) {
    return { ok: false, error: "解除する相手が見つかりません" };
  }

  try {
    await unlinkFriend(userId, friendId);
    // もう消えていた(相手が先に解除した)ときも、望んだ状態にはなっているので成功として返す。
    revalidateFriendPages();
    return { ok: true };
  } catch (error) {
    console.error("unlinkStampFriendAction", error);
    return { ok: false, error: "解除できませんでした。時間をおいてもう一度お試しください" };
  }
}
