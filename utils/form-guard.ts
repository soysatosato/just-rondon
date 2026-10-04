import { headers } from "next/headers";

/**
 * 読者がメールアドレスを入れて送るフォーム(お問い合わせ・サービスチャージの相談)の
 * スパム除け。フォーム側は components/form/BotGuardFields.tsx を置く。
 */

/** 表示からこれより早い送信は人の手ではないとみなす。 */
const MIN_FILL_MS = 3000;

/**
 * 営業スパムのボット判定。どれかに当たったら黙って成功を返す
 * (弾いたと知らせると、ボット側が回避策を学ぶ)。
 *
 * - website: 人には見えない入力欄。埋まっていればボット。
 * - startedAt: フォームを描画した時刻。クライアントで入れるので、
 *   JS を動かさずに直接 POST するボットでは空になる。
 */
export function looksLikeBot(formData: FormData) {
  if (String(formData.get("website") ?? "") !== "") return true;

  const startedAt = Number(formData.get("startedAt"));
  if (!Number.isFinite(startedAt) || startedAt <= 0) return true;
  return Date.now() - startedAt < MIN_FILL_MS;
}

/** 送信元の IP。送信回数の上限を数えるのに使う。 */
export function clientIp() {
  return headers().get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

const HOUR = 60 * 60 * 1000;

/**
 * 送信回数の上限。連投や DoS で DB と SMTP の送信枠を食い潰されないため。
 * 読者が確認メールを見落として何度か送り直しても届かない数にしてある。
 */
export const SEND_LIMITS = {
  perEmail: { max: 5, windowMs: 24 * HOUR },
  perIp: { max: 5, windowMs: HOUR },
  // サイト全体。これを超えるのは攻撃なので、その間は読者の送信も止める。
  global: { max: 30, windowMs: HOUR },
};

export const RATE_LIMITED =
  "送信回数が多すぎます。しばらく時間をおいてからお試しください。";

export function since(ms: number) {
  return { gt: new Date(Date.now() - ms) };
}
