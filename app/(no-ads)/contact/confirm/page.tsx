import { confirmContactRequest } from "@/utils/actions/contact";
import { sendAdminNotification } from "@/utils/actions/contact";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SitePageShell } from "@/components/site/SitePageLayout";

import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("お問い合わせの確認");

/**
 * 確認メールのリンクの着地点。3通りの結末があり、読者にとっては
 * 「もう一度送り直す必要があるのか」だけが知りたいことなので、
 * 見出しでそれを言い切り、詳細を下に添える。
 */
type Result = {
  kicker: string;
  title: string;
  body: string;
  tone: "ok" | "warn" | "error";
};

const TONE = {
  ok: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
} as const;

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  let result: Result;

  const request = token ? await confirmContactRequest(token) : null;

  if (!request) {
    result = {
      kicker: "Contact",
      title: "リンクが無効です",
      body: "リンクの有効期限が切れているか、すでに確認が済んでいる可能性があります。お手数ですが、お問い合わせフォームからもう一度お送りください。",
      tone: "error",
    };
  } else {
    try {
      await sendAdminNotification(request);
      result = {
        kicker: "Contact",
        title: "お問い合わせを受け付けました",
        body: "内容を確認のうえ、順次お返事します。送り直していただく必要はありません。",
        tone: "ok",
      };
    } catch (err) {
      console.error("管理者通知メール送信エラー:", err);
      // 確認自体は DB に記録済みなので、読者に再送を促すと二重になる。
      result = {
        kicker: "Contact",
        title: "確認は完了しました",
        body: "ただし運営者への通知メールの送信に失敗しました。お返事が遅れる場合があります。お急ぎの場合は、お手数ですがもう一度お送りください。",
        tone: "warn",
      };
    }
  }

  return (
    <SitePageShell>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
        {result.kicker}
      </p>
      <h1
        className={`mt-3 text-2xl font-bold leading-tight tracking-tight md:text-4xl ${TONE[result.tone]}`}
      >
        {result.title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-8 text-gray-700 dark:text-gray-300 md:text-base">
        {result.body}
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">お問い合わせフォーム</Link>
        </Button>
      </div>
    </SitePageShell>
  );
}
