import { confirmContactRequest } from "@/utils/actions/contact";
import { sendAdminNotification } from "@/utils/actions/contact";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  let content: JSX.Element;

  if (!token) {
    content = <p>無効なリンクです</p>;
  } else {
    const request = await confirmContactRequest(token);
    if (!request) {
      content = <p>無効なリンクです</p>;
    } else {
      try {
        await sendAdminNotification(request);
        content = (
          <p className="text-green-600">
            お問い合わせを受け付けました。管理者に通知されました。
          </p>
        );
      } catch (err) {
        console.error("管理者通知メール送信エラー:", err);
        content = (
          <p className="text-red-600">
            確認は完了しましたが、通知メールの送信に失敗しました。
          </p>
        );
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 space-y-6 text-center">
      {content}

      <Link href="/">
        <Button className="mt-4">ホームに戻る</Button>
      </Link>
    </div>
  );
}
