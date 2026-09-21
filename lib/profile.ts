import { Prisma } from "@prisma/client";

import db from "@/utils/db";
import {
  checkUsername,
  randomUsername,
  usernameKey,
  type UsernameResult,
} from "@/lib/username";

/**
 * 読者の Profile(サイト内の名前)を読み書きする。サーバー側専用。
 *
 * Profile は Clerk のアカウント1つにつき1行で、持っているのはユーザーネームだけ。
 * 顔写真とメールアドレスは Clerk 側にしか置かない(理由は schema.prisma の Profile)。
 * 名前の規則と自動で付く名前の作り方は lib/username.ts。
 */

/** 数字なしで引く回数。これで空かなければ2桁を足す。 */
const PLAIN_ATTEMPTS = 3;
/** 引き直しの上限。数字付きでも埋まり始めたら、語を足す合図。 */
const MAX_ATTEMPTS = 10;

/** P2002(一意制約違反)が、指定した列で起きたか。 */
function isUniqueViolation(error: unknown, field: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2002") return false;
  const target = error.meta?.target;
  return Array.isArray(target) && target.includes(field);
}

/**
 * ランダムな名前で write を試し、名前が埋まっていたら引き直す。
 *
 * 空いているかを先に SELECT で確かめないのは、確かめてから書くまでの間に
 * 同じ名前を他人に取られうるため。一意制約に判定させれば取り合いは起きない。
 */
async function withRandomUsername<T>(
  write: (name: { username: string; usernameKey: string }) => Promise<T>,
  /** 引き直しで今と同じ名前が出たら、引いたことにしない。 */
  avoid?: string,
): Promise<T> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const username = randomUsername({ withNumber: attempt >= PLAIN_ATTEMPTS });
    if (username === avoid) continue;
    try {
      return await write({ username, usernameKey: usernameKey(username) });
    } catch (error) {
      if (isUniqueViolation(error, "usernameKey")) continue;
      throw error;
    }
  }
  throw new Error("空いているユーザーネームが見つかりませんでした");
}

/**
 * ログインした人の Profile を返す。まだ無ければランダムな名前で作る。
 *
 * 呼ぶのは名前かスタンプが初めて要る場面(/stamps・/account を開いた、
 * 最初のスタンプを押した)。登録するとまず /stamps に着くので、実際には
 * 登録の直後に作られる。Clerk の Webhook を使えば登録の瞬間に作れるが、
 * そのためにパッケージと署名用の秘密鍵を足すほどの差は無い。
 */
export async function ensureProfile(
  clerkId: string,
): Promise<{ username: string }> {
  const existing = await db.profile.findUnique({
    where: { clerkId },
    select: { username: true },
  });
  if (existing) return existing;

  try {
    return await withRandomUsername((name) =>
      db.profile.create({
        data: { clerkId, ...name },
        select: { username: true },
      }),
    );
  } catch (error) {
    // 同じ人のリクエストが同時に2本来て、もう片方が先に作った
    // (スタンプ帳を開いた直後にスタンプを押した等)。その行を使う。
    if (isUniqueViolation(error, "clerkId")) {
      return db.profile.findUniqueOrThrow({
        where: { clerkId },
        select: { username: true },
      });
    }
    throw error;
  }
}

/** 本人が入力した名前に変える。 */
export async function changeUsername(
  clerkId: string,
  input: string,
): Promise<UsernameResult> {
  const checked = checkUsername(input);
  if (!checked.ok) return checked;

  await ensureProfile(clerkId);
  try {
    const updated = await db.profile.update({
      where: { clerkId },
      data: {
        username: checked.username,
        usernameKey: usernameKey(checked.username),
      },
      select: { username: true },
    });
    return { ok: true, username: updated.username };
  } catch (error) {
    if (isUniqueViolation(error, "usernameKey")) {
      return { ok: false, error: "その名前はもう使われています" };
    }
    throw error;
  }
}

/** ランダムな名前を引き直す。 */
export async function rerollUsername(clerkId: string): Promise<UsernameResult> {
  const current = await ensureProfile(clerkId);
  const updated = await withRandomUsername(
    (name) =>
      db.profile.update({
        where: { clerkId },
        data: name,
        select: { username: true },
      }),
    current.username,
  );
  return { ok: true, username: updated.username };
}

/** Profile を消す。スタンプは外部キーの ON DELETE CASCADE で一緒に消える。 */
export async function deleteProfile(clerkId: string): Promise<void> {
  await db.profile.deleteMany({ where: { clerkId } });
}
