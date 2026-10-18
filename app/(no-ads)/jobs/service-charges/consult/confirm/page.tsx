import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SitePageShell } from "@/components/site/SitePageLayout";
import DeadlineNotice from "@/components/jobs/consult/DeadlineNotice";
import { CASE_STORY_BASE } from "@/components/jobs/case-story/chapters";
import { CONSULT_PATH } from "@/lib/jobs/consult";
import {
  confirmConsultation,
  consultationAdvice,
  notifyConsultation,
} from "@/utils/consultation";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("ご相談の確認");

/**
 * 確認メールのリンクの着地点。お問い合わせの確認ページ(/contact/confirm)と同じく、
 * 読者が知りたいのは「もう一度送り直す必要があるのか」なので見出しで言い切る。
 * 受け付けたときは、期限の目安をもう一度出しておく。
 */
type Result = {
  title: string;
  body: string;
  tone: "ok" | "warn" | "error";
};

const TONE = {
  ok: "text-emerald-700 dark:text-emerald-400",
  warn: "text-amber-700 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
} as const;

export default async function ConsultConfirmPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token =
    typeof searchParams.token === "string" ? searchParams.token : undefined;
  const confirmed = token ? await confirmConsultation(token) : null;
  let result: Result;

  if (!confirmed) {
    result = {
      title: "リンクが無効です",
      body: "リンクの有効期限が切れているか、すでに確認が済んでいる可能性があります。お手数ですが、相談フォームからもう一度お送りください。",
      tone: "error",
    };
  } else if (!confirmed.firstTime) {
    result = {
      title: "ご相談は受け付け済みです",
      body: "このご相談はすでに確認が済んでいます。送り直していただく必要はありません。1週間を目安に返信します。",
      tone: "ok",
    };
  } else {
    let notified = false;
    try {
      notified = await notifyConsultation(confirmed.consultation);
    } catch (err) {
      console.error("相談の通知メール送信エラー:", err);
    }
    // 確認自体は DB に記録済みなので、通知に失敗しても読者に再送は促さない
    // (送り直すと二重になる)。
    result = notified
      ? {
          title: "ご相談を受け付けました",
          body: "1週間を目安に、ご入力のメールアドレスあてに返信します。送り直していただく必要はありません。",
          tone: "ok",
        }
      : {
          title: "確認は完了しました",
          body: "ただし運営者への通知メールの送信に失敗しました。返信が遅れる場合があります。お急ぎの場合は、お手数ですがもう一度お送りください。",
          tone: "warn",
        };
  }

  return (
    <SitePageShell>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
        Service charge
      </p>
      <h1
        className={`mt-3 text-2xl font-bold leading-tight tracking-tight md:text-4xl ${TONE[result.tone]}`}
      >
        {result.title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-8 text-neutral-700 dark:text-neutral-300 md:text-base">
        {result.body}
      </p>

      {confirmed && (
        <DeadlineNotice
          advice={consultationAdvice(confirmed.consultation)}
          className="mt-8 max-w-xl"
        />
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href={CASE_STORY_BASE}>当事者の記録に戻る</Link>
        </Button>
        {!confirmed && (
          <Button asChild variant="outline">
            <Link href={CONSULT_PATH}>相談フォーム</Link>
          </Button>
        )}
      </div>
    </SitePageShell>
  );
}
