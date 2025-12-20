// app/thanks/page.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function ThanksPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground flex items-center justify-center px-4">
      <Card className="max-w-md w-full border-border/60 shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>
          <CardTitle className="text-xl md:text-2xl">
            ご協力ありがとうございました
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            ご回答は匿名で記録され、個人が特定されることはありません。
            <br />
            集計されたデータは、現場の実態を可視化する目的のみに使用されます。
          </p>

          <div className="pt-2">
            <Button asChild className="w-full">
              <Link href="/jobs/service-charges/dashboard/archive">
                一覧表示を見る
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground space-y-1">
            <span className="block">
              ※ このページ以外から一覧表示へ移動するリンクは設けていません。
            </span>
            <span className="block">
              ※
              再度閲覧する場合は、リンク先のURLを保存するなどして控えておくことをおすすめします。
            </span>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
