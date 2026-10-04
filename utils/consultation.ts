import db from "./db";
import { sendAdminMail } from "./mail";
import {
  type AcasStatus,
  GENERIC_DEADLINE_ADVICE,
  deadlineAdvice,
  formatJaDate,
} from "@/lib/jobs/claim-deadline";
import {
  ACAS_OPTIONS,
  EMPLOYMENT_OPTIONS,
  optionLabel,
} from "@/lib/jobs/consult";

/**
 * サービスチャージの相談のうち、確認リンクを踏んだあとの処理。
 * 確認ページ(サーバーコンポーネント)からだけ呼ぶので、server action にはしない。
 */

type Consultation = NonNullable<
  Awaited<ReturnType<typeof db.serviceChargeConsultation.findUnique>>
>;

/** DB の DATE 列は UTC の 0 時で返ってくる。 */
export function lastPaidOnIso(c: Pick<Consultation, "lastPaidOn">) {
  return c.lastPaidOn ? c.lastPaidOn.toISOString().slice(0, 10) : null;
}

export function consultationAdvice(
  c: Pick<Consultation, "lastPaidOn" | "acas">,
) {
  return (
    deadlineAdvice(lastPaidOnIso(c), c.acas as AcasStatus) ??
    GENERIC_DEADLINE_ADVICE
  );
}

/**
 * 確認リンクを踏んだときの処理。初回かどうかも返す。
 * 2回目以降(再読み込みや、メールのリンクスキャナの先読み)で
 * 運営者への通知を重複して送らないため。
 */
export async function confirmConsultation(token: string) {
  const { count } = await db.serviceChargeConsultation.updateMany({
    where: { token, confirmed: false },
    data: { confirmed: true },
  });
  const consultation = await db.serviceChargeConsultation.findUnique({
    where: { token },
  });
  if (!consultation) return null;

  return { consultation, firstTime: count > 0 };
}

/** 運営者への通知。返信はこのメールへの返信で相談者に届く。 */
export async function notifyConsultation(c: Consultation) {
  const lastPaidOn = lastPaidOnIso(c);
  const advice = consultationAdvice(c);

  const lines = [
    `いまの状況: ${optionLabel(EMPLOYMENT_OPTIONS, c.employment)}`,
    `最後の給与日: ${lastPaidOn ? formatJaDate(lastPaidOn) : "未入力"}`,
    `Acas: ${optionLabel(ACAS_OPTIONS, c.acas)}`,
    `期限: ${advice.headline}`,
    `サービスチャージの率: ${c.chargeRate ?? "未入力"}`,
    `還元のされ方: ${c.sharing ?? "未入力"}`,
    `Q&Aへの掲載: ${c.publishOk ? "可" : "不可"}`,
    `メール: ${c.email}`,
  ];

  return sendAdminMail({
    subject: `サービスチャージの相談（${c.nickname ?? "呼び名なし"}）`,
    text: `${lines.join("\n")}\n\n――\n${c.message}`,
    replyTo: c.email,
  });
}
