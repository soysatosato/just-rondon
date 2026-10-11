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
 *
 * ★ 必ず await すること。`if (!isAdminSession())` は Promise を否定するので
 *   常に false になり、誰でも通る。しかも tsc はこの形をエラーにしない
 *   (`if (p)` と `p && …` は TS2801 で弾くが、`!p` は素通りする)。
 *   Clerk v6 で auth() が非同期になったとき、同期版の isAdmin から名前を
 *   変えたのは、古い呼び出しを残らずコンパイルエラーにして洗い出すため。
 */
export async function isAdminSession(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  return isAdminId(userId);
}

/**
 * その Clerk ユーザー ID が運営者のものか。
 *
 * ログインしている本人ではなく、渡された ID を見る。権限の判定には
 * isAdminSession を使うこと——こちらは「運営者自身の登録を通知しない」のように、
 * 処理の対象が誰かを見分けるためのもの。
 */
export function isAdminId(clerkId: string): boolean {
  const allowed = (process.env.ADMIN_CLERK_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return allowed.includes(clerkId);
}
