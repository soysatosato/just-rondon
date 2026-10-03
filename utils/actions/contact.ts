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

export async function sendContact(prevState: any, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, message } = parsed.data;
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
