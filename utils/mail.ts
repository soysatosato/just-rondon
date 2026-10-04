import nodemailer from "nodemailer";

function createTransport() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) return null;

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

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
  const transporter = createTransport();
  if (!transporter) return false;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: process.env.EMAIL_USER,
    subject,
    text,
    replyTo,
  });

  return true;
}

/**
 * 読者宛のメール(確認リンクなど)。管理者通知と違い、届かなければ
 * 読者はその先に進めないので、送れないときは例外にする。
 */
export async function sendReaderMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const transporter = createTransport();
  if (!transporter) throw new Error("EMAIL_* の環境変数がありません");

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text,
    html,
  });
}
