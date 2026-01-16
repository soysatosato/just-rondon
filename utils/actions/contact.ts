"use server";
import db from "../db";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { contactSchema } from "../schemas";

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

  const confirmUrl = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/contact/confirm?token=${token}`;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "【ジャスト・ロンドン】お問い合わせ確認メール",
    text: `${name} 様、お問い合わせありがとうございます。
以下のリンクをクリックしてお問い合わせを確定してください：

${confirmUrl}

※このメールには返信できません。`,
    html: `
    <p>${name} 様</p>
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

export async function confirmContactRequest(token: string) {
  const request = await db.contact.findUnique({ where: { token } });
  if (!request) return null;
  if (request.confirmed) return request;

  const updated = await db.contact.update({
    where: { token },
    data: { confirmed: true },
  });

  return updated;
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
