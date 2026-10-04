import { clerkClient } from "@clerk/nextjs/server";

import db from "@/utils/db";
import { sendAdminMail } from "@/utils/mail";
import { isAdminId } from "@/lib/admin";
import { providerLabel, toLoginMethods } from "@/lib/login-methods";
import type { StampType } from "@/lib/stamps";

/**
 * 新しい読者が登録したことを、運営者にメールで知らせる。サーバー側専用。
 *
 * 知らせるのは、サイトの DB に Profile の行を初めて作ったとき
 * (lib/profile.ts の ensureProfile)。Clerk の Webhook(user.created)を
 * 使わない理由は ensureProfile のコメントと同じで、パッケージと署名用の
 * 秘密鍵、ダッシュボードの設定(dev と prod の両方)を足すほどの差が無い。
 * 登録するとまず /stamps に着き、モーダルで登録した人もスタンプや
 * プランの保存で戻ってくるので、ほぼ登録の直後に行ができる。
 * 登録してすぐ閉じた人の分は、次に来たときに届く(本文の登録日時で分かる)。
 *
 * ★ 読者のメールアドレスは本文に入れない。サイトは個人を特定する情報を
 *   Clerk にだけ置く方針で、通知に入れると運営者の受信箱に読者の
 *   アドレスが溜まっていく。要るときは Clerk のダッシュボードで引く。
 */

/**
 * Profile を作ることになった操作。通知の「きっかけ」に出す。
 *
 * どの機能が登録につながっているかを見るためのもの。ヘッダーの
 * 「ログイン」から登録した人は既定の行き先の /stamps に着くので
 * stamp-book になり、機能の中から登録した人はその機能の名前になる。
 */
export type ProfileTrigger =
  | { kind: "stamp-book" }
  | { kind: "stamp"; type: StampType; id: string }
  | { kind: "plan" }
  | { kind: "account" }
  | { kind: "together" }
  | { kind: "invite-create" }
  | { kind: "invite-accept" }
  | { kind: "shiori" };

const TRIGGER_LABELS: Record<ProfileTrigger["kind"], string> = {
  "stamp-book":
    "スタンプ帳を開いた(ヘッダーなどから登録すると、まずここに着く)",
  stamp: "スタンプを押した",
  plan: "旅行プランをアカウントに保存した",
  account: "アカウント設定を開いた",
  together: "旅仲間のページを開いた",
  "invite-create": "旅仲間の招待リンクを作った",
  "invite-accept": "旅仲間の招待を受けた",
  shiori: "旅のしおりを公開した",
};

/**
 * 送るのを待つ上限。
 *
 * 通知は登録した読者の最初の操作(スタンプ帳を開く、スタンプを押す)の
 * 中で送っていて、送り終わるまでその応答が返らない。SMTP がつながらない
 * ときに読者を待たせ続けないよう、ここで打ち切る。
 */
const SEND_TIMEOUT_MS = 5000;

/** スタンプを押した場所の名前。消えていれば null。 */
async function stampPlaceName(type: StampType, id: string): Promise<string | null> {
  const select = { name: true } as const;
  const place =
    type === "attraction"
      ? await db.attraction.findUnique({ where: { id }, select })
      : type === "museum"
        ? await db.museum.findUnique({ where: { id }, select })
        : await db.musical.findUnique({ where: { id }, select });
  return place?.name ?? null;
}

async function triggerLabel(trigger: ProfileTrigger): Promise<string> {
  const label = TRIGGER_LABELS[trigger.kind];
  if (trigger.kind !== "stamp") return label;
  const name = await stampPlaceName(trigger.type, trigger.id);
  return name ? `${label}(${name})` : label;
}

/** 「2026-10-04 15:20(ロンドン時間)」。サイトの読者が居る時間で見る。 */
function formatLondonTime(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}(ロンドン時間)`;
}

async function send(
  clerkId: string,
  username: string,
  trigger: ProfileTrigger,
): Promise<void> {
  const [user, total, how] = await Promise.all([
    clerkClient().users.getUser(clerkId),
    db.profile.count(),
    triggerLabel(trigger),
  ]);

  const { accounts } = toLoginMethods(user);
  const loginMethod =
    accounts.length > 0
      ? accounts.map((account) => providerLabel(account.provider)).join("・")
      : "メールの確認コード";

  await sendAdminMail({
    subject: `【ジャスト・ロンドン】新しい登録: ${username}`,
    text: [
      `ユーザーネーム: ${username}`,
      `ログイン方法: ${loginMethod}`,
      `きっかけ: ${how}`,
      `Clerk に登録した日時: ${formatLondonTime(new Date(user.createdAt))}`,
      `登録は全部で ${total} 人目`,
      "",
      `Clerk のユーザーID: ${clerkId}`,
    ].join("\n"),
  });
}

/**
 * 新しく Profile を作った直後に呼ぶ。
 *
 * 本番(Vercel の production)以外では送らない。.env の DB は本番なので、
 * ローカルで dev の Clerk からテスト登録すると本番の DB に行ができるが、
 * それは読者の登録ではない。運営者自身(ADMIN_CLERK_IDS)の分も送らない。
 *
 * 失敗しても例外にしない。通知は運営者のための補助で、読者の操作
 * (スタンプを押す、プランを保存する)を止める理由にはならない。
 */
export async function notifyNewProfile(
  clerkId: string,
  username: string,
  trigger: ProfileTrigger,
): Promise<void> {
  if (process.env.VERCEL_ENV !== "production") return;
  if (isAdminId(clerkId)) return;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      send(clerkId, username, trigger),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${SEND_TIMEOUT_MS}ms で打ち切り`)),
          SEND_TIMEOUT_MS,
        );
      }),
    ]);
  } catch (error) {
    console.error("[signup-notification] failed", error);
  } finally {
    clearTimeout(timer);
  }
}
