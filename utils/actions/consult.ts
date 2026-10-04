"use server";
import db from "../db";
import { randomUUID } from "crypto";
import { consultationSchema } from "../schemas";
import {
  RATE_LIMITED,
  SEND_LIMITS as LIMITS,
  clientIp,
  looksLikeBot,
  since,
} from "../form-guard";
import { sendReaderMail } from "../mail";
import { SITE_URL } from "@/lib/seo";
import {
  ACAS_EARLY_CONCILIATION_URL,
  GENERIC_DEADLINE_ADVICE,
  deadlineAdvice,
} from "@/lib/jobs/claim-deadline";
import { CONSULT_CONFIRM_PATH } from "@/lib/jobs/consult";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ConsultState = {
  success: boolean;
  errors?: Record<string, string[] | undefined>;
  error?: string;
};

/**
 * 相談の送信。お問い合わせ(contact.ts)と同じく、ここでは保存して確認メールを
 * 送るだけで、運営者に届くのは確認リンクを踏んだとき(utils/consultation.ts)。
 */
export async function sendConsultation(
  prevState: ConsultState,
  formData: FormData,
): Promise<ConsultState> {
  if (looksLikeBot(formData)) return { success: true };

  const parsed = consultationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const blocked = await db.blockedContactEmail.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (blocked) return { success: true };

  const ip = clientIp();
  const [byEmail, byIp, total] = await Promise.all([
    db.serviceChargeConsultation.count({
      where: {
        email: { equals: data.email, mode: "insensitive" },
        createdAt: since(LIMITS.perEmail.windowMs),
      },
    }),
    ip
      ? db.serviceChargeConsultation.count({
          where: { ip, createdAt: since(LIMITS.perIp.windowMs) },
        })
      : 0,
    db.serviceChargeConsultation.count({
      where: { createdAt: since(LIMITS.global.windowMs) },
    }),
  ]);
  if (
    byEmail >= LIMITS.perEmail.max ||
    byIp >= LIMITS.perIp.max ||
    total >= LIMITS.global.max
  ) {
    return { success: false, errors: {}, error: RATE_LIMITED };
  }

  const token = randomUUID();
  await db.serviceChargeConsultation.create({
    data: {
      ...data,
      lastPaidOn: data.lastPaidOn ? new Date(data.lastPaidOn) : null,
      token,
      ip,
    },
  });

  const confirmUrl = `${SITE_URL}${CONSULT_CONFIRM_PATH}?token=${token}`;
  const advice =
    deadlineAdvice(data.lastPaidOn, data.acas) ?? GENERIC_DEADLINE_ADVICE;
  const greeting = data.nickname ? `${data.nickname} 様` : "";

  try {
    await sendReaderMail({
      to: data.email,
      subject: "【ジャスト・ロンドン】ご相談の確認メール",
      text: `${greeting ? `${greeting}\n\n` : ""}サービスチャージのご相談ありがとうございます。
以下のリンクを開くと、ご相談が運営者に届きます。

${confirmUrl}

―― 期限について
${advice.headline}
${advice.body}

Acas Early Conciliation（無料）:
${ACAS_EARLY_CONCILIATION_URL}

※このメールには返信できません。`,
      html: `
    ${greeting ? `<p>${escapeHtml(greeting)}</p>` : ""}
    <p>サービスチャージのご相談ありがとうございます。</p>
    <p>以下のリンクを開くと、ご相談が運営者に届きます。</p>
    <p><a href="${confirmUrl}">${confirmUrl}</a></p>
    <hr>
    <p><strong>${escapeHtml(advice.headline)}</strong></p>
    <p>${escapeHtml(advice.body)}</p>
    <p>Acas Early Conciliation（無料）:<br><a href="${ACAS_EARLY_CONCILIATION_URL}">${ACAS_EARLY_CONCILIATION_URL}</a></p>
    <p><em>※このメールには返信できません。</em></p>
  `,
    });
  } catch (err) {
    console.error("相談の確認メール送信エラー:", err);
    return {
      success: false,
      errors: {},
      error:
        "確認メールを送れませんでした。メールアドレスをご確認のうえ、もう一度お試しください。",
    };
  }

  return { success: true };
}
