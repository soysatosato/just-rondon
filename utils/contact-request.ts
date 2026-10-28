import "server-only";

import db from "./db";
import nodemailer from "nodemailer";

/**
 * お問い合わせのうち、確認リンクを踏んだあとの処理。
 * 確認ページ(サーバーコンポーネント)からだけ呼ぶので、server action にはしない。
 *
 * 以前は送信フォームと同じ utils/actions/contact.ts("use server")にあり、
 * 画面を通さずに外から呼べた。運営者宛ての通知は、ボット判定・回数制限・
 * 確認メールを通ったものだけが送られなければならない。
 */

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
