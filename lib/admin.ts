import { auth } from "@clerk/nextjs/server";

/**
 * 運営者かどうか。管理ページ(/admin/*)・プレビュー・/tweets で使う。
 *
 * Clerk のユーザー ID を環境変数 ADMIN_CLERK_IDS(カンマ区切り)と照らす。
 * 権限を DB(Profile の列や Clerk の publicMetadata)に持たせないのは、
 * API のバグで書き換えられる経路を作らないため。ユーザーネームや
 * メールアドレスは本人が変えられるので使わない。
 *
 * auth() はミドルウェアが走ったリクエストでしか使えない。呼ぶ側のパスを
 * middleware.ts の matcher に入れること。
 *
 * ページを開くときだけでなく、サーバーアクションの1回ごとにも呼ぶこと。
 * アクションは画面を通さず直接呼べる。
 */
export function isAdmin(): boolean {
  const { userId } = auth();
  if (!userId) return false;
  const allowed = (process.env.ADMIN_CLERK_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return allowed.includes(userId);
}
