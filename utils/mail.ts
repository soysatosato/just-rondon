import nodemailer from "nodemailer";

/**
 * 管理者宛の通知メール。
 *
 * SMTP の設定は .env.local の EMAIL_* を使う(お問い合わせメールと同じ経路)。
 * 環境変数が無いローカルでは送らずに false を返す。通知はあくまで補助なので、
 * 呼び出し元の処理(コメントの保存など)を失敗させないこと。
 */
export async function sendAdminMail({
  subject,
  text,
  replyTo,
}: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, FROM_EMAIL } =
    process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) return false;

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: EMAIL_USER,
    subject,
    text,
    replyTo,
  });

  return true;
}
