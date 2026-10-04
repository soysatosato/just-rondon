"use server";
import db from "../db";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { contactSchema } from "../schemas";
import { SITE_URL } from "@/lib/seo";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 表示からこれより早い送信は人の手ではないとみなす。 */
const MIN_FILL_MS = 3000;

const HOUR = 60 * 60 * 1000;
/**
 * 送信回数の上限。連投や DoS で DB と SMTP の送信枠を食い潰されないため。
 * 読者が確認メールを見落として何度か送り直しても届かない数にしてある。
 */
const LIMITS = {
  perEmail: { max: 5, windowMs: 24 * HOUR },
  perIp: { max: 5, windowMs: HOUR },
  // サイト全体。これを超えるのは攻撃なので、その間は読者の送信も止める。
  global: { max: 30, windowMs: HOUR },
};
const RATE_LIMITED = "送信回数が多すぎます。しばらく時間をおいてからお試しください。";

/**
 * 営業スパムのボット判定。どれかに当たったら黙って成功を返す
 * (弾いたと知らせると、ボット側が回避策を学ぶ)。
 *
 * - website: 人には見えない入力欄。埋まっていればボット。
 * - startedAt: フォームを描画した時刻。クライアントで入れるので、
 *   JS を動かさずに直接 POST するボットでは空になる。
 */
function looksLikeBot(formData: FormData) {
  if (String(formData.get("website") ?? "") !== "") return true;

  const startedAt = Number(formData.get("startedAt"));
  if (!Number.isFinite(startedAt) || startedAt <= 0) return true;
  return Date.now() - startedAt < MIN_FILL_MS;
}

export async function sendContact(prevState: any, formData: FormData) {
  if (looksLikeBot(formData)) return { success: true };

  const raw = Object.fromEntries(formData);
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, message } = parsed.data;

  const blocked = await db.blockedContactEmail.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (blocked) return { success: true };

  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const since = (ms: number) => ({ gt: new Date(Date.now() - ms) });
  const [byEmail, byIp, total] = await Promise.all([
    db.contact.count({
      where: {
        email: { equals: email, mode: "insensitive" },
        createdAt: since(LIMITS.perEmail.windowMs),
      },
    }),
    ip
      ? db.contact.count({
          where: { ip, createdAt: since(LIMITS.perIp.windowMs) },
        })
      : 0,
    db.contact.count({ where: { createdAt: since(LIMITS.global.windowMs) } }),
  ]);
  // ブロックリストと違い、こちらは読者本人が当たりうるので理由を見せる。
  if (
    byEmail >= LIMITS.perEmail.max ||
    byIp >= LIMITS.perIp.max ||
    total >= LIMITS.global.max
  ) {
    return { success: false, errors: {}, error: RATE_LIMITED };
  }

  const token = randomUUID();

  await db.contact.create({
    data: { name, email, message, token, ip },
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 環境変数ではなく SITE_URL を使う。以前は NEXT_PUBLIC_WEBSITE_URL から組み立てており、
  // スキーム無しの値で壊れたリンクを送り続け、1件も確認が完了していなかった。
  const confirmUrl = `${SITE_URL}/contact/confirm?token=${token}`;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "【ジャスト・ロンドン】お問い合わせ確認メール",
    text: `${name} 様、お問い合わせありがとうございます。
以下のリンクをクリックしてお問い合わせを確定してください：

${confirmUrl}

※このメールには返信できません。`,
    html: `
    <p>${escapeHtml(name)} 様</p>
    <p>お問い合わせありがとうございます。</p>
    <p>以下のリンクをクリックしてお問い合わせを確定してください：</p>
    <p><a href="${confirmUrl}">${confirmUrl}</a></p>
    <p><em>※このメールには返信できません。</em></p>
  `,
  });

  return { success: true };
}

export async function createContactRequest(data: {
  name: string;
  email: string;
  message: string;
}) {
  const token = randomUUID();

  const contact = await db.contact.create({
    data: { ...data, token, confirmed: false },
  });

  return contact;
}

/**
 * 確認リンクを踏んだときの処理。初回かどうかも返す。
 * 2回目以降(再読み込みや、メールのリンクスキャナの先読み)で
 * 管理者通知を重複して送らないため。
 */
export async function confirmContactRequest(token: string) {
  const { count } = await db.contact.updateMany({
    where: { token, confirmed: false },
    data: { confirmed: true },
  });
  const request = await db.contact.findUnique({ where: { token } });
  if (!request) return null;

  return { request, firstTime: count > 0 };
}

export async function sendAdminNotification(request: {
  name: string;
  email: string;
  message: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: process.env.EMAIL_USER,
    subject: `お問い合わせ（${request.name}）`,
    text: request.message,
    replyTo: request.email,
  });
}
