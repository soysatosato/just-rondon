import RequestForm from "@/components/lyrix/RequestForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "歌詞リクエスト | LyriXplorer",
  description:
    "探している歌詞が見つからなかった場合は、こちらからリクエストできます。",
};

export default function RequestPage({
  searchParams,
}: {
  searchParams: { q?: string; success?: string };
}) {
  const q = searchParams.q ?? "";
  const success = searchParams.success === "1";

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>歌詞リクエスト</CardTitle>
            <CardDescription>
              検索しても見つからなかった曲があれば、こちらからリクエストできます。
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  リクエストを受け付けました。ありがとうございます。
                </p>
              </div>
            ) : (
              <RequestForm defaultTitle={q} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
