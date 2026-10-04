"use server";
import db from "../db";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
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
/** 同じアドレスの未確認の問い合わせがこの件数に達したら、以降は受け付けない。 */
const MAX_UNCONFIRMED_PER_EMAIL = 2;

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

  // 確認リンクを踏まないまま何度も送ってくるアドレスは、スパムが同じ
  // アドレスを使い回しているとみなす。確認メールの送り直しを1回は許すため、
  // 1件目では弾かない。確認済みのアドレス(実在の読者)は数えない。
  const unconfirmed = await db.contact.count({
    where: { email: { equals: email, mode: "insensitive" }, confirmed: false },
  });
  if (unconfirmed >= MAX_UNCONFIRMED_PER_EMAIL) return { success: true };

  const token = randomUUID();

  await db.contact.create({
    data: { name, email, message, token },
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
