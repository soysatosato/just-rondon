import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CalendarDays, Sparkles, Compass } from "lucide-react";
import { fetchChristmasMarkets } from "@/utils/actions/contents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

type SectionGroup = {
  where?: string;
  period?: string;
  tips?: string;
  extra?: string;
};

export const metadata = {
  title:
    "ロンドンのクリスマスマーケット特集 2025 | おすすめスポット・開催情報まとめ | ロンドん！",
  description:
    "ロンドンのクリスマスマーケット2025年最新版。サウスバンク、ウィンターワンダーランド、ロンドンブリッジなど、各マーケットの開催期間、見どころ、アクセス、おすすめポイントをわかりやすく紹介します。",
  keywords: [
    "ロンドン",
    "クリスマスマーケット",
    "London Christmas Market",
    "ロンドン クリスマス",
    "クリスマスイベント",
    "ヨーロッパ クリスマス",
    "ロンドン旅行",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/sightseeing/christmas-markets",
  },
  openGraph: {
    title:
      "ロンドンのクリスマスマーケット特集 2025 | 開催情報・おすすめ完全ガイド",
    description:
      "ロンドンの代表的なクリスマスマーケットをエリア別に徹底紹介。人気のウィンターワンダーランドから隠れた穴場まで、旅行に役立つ情報をまとめた決定版ガイド。",
    url: "https://www.just-rondon.com/sightseeing/christmas-markets",
    siteName: "ロンドん！ | クリスマスマーケット特集",
    locale: "ja_JP",
    type: "website",
  },
};

function normalizeSections(sections: any[]): SectionGroup {
  const group: SectionGroup = {};

  for (const sec of sections) {
    const title = sec.title.toLowerCase();

    if (title.includes("場所")) group.where = sec.description;
    if (title.includes("期間")) group.period = sec.description;
    if (title.includes("訪問")) group.tips = sec.description;
    if (title.includes("周辺")) group.extra = sec.description;
  }

  return group;
}

export default async function ChristmasMarketsPage() {
  const contents = await fetchChristmasMarkets();

  return (
    <main className="py-10">
      <header className="relative mb-8 h-40 flex flex-col justify-end p-4 overflow-hidden rounded-xl">
        <div
          className="absolute inset-0 bg-center opacity-85 pointer-events-none"
          style={{
            backgroundImage:
              "url(https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/london-cm-bg.jpeg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0" />

        <h1 className="relative text-xl font-bold my-4 z-10 text-white">
          ロンドン クリスマスマーケット 2025
        </h1>
        <p className="relative text-gray-100 z-10 text-sm leading-relaxed">
          ロンドンのクリスマスマーケットをまとめて一覧化。
          <br />
          期間、場所、訪問のコツ、周辺スポットをひと目でチェックできます。
        </p>
      </header>

      <section className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-full">
        {contents.map((item) => {
          const sec = normalizeSections(item.sections);

          return (
            <Link
              key={item.id}
              href={`/sightseeing/christmas-markets/${item.slug}`}
              className="block"
            >
              <Card className="w-full min-w-0 h-full border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="space-y-2 px-4 py-3">
                  <CardTitle className="text-base font-semibold">
                    {item.title}
                  </CardTitle>

                  {item.engTitle && (
                    <Badge
                      variant="outline"
                      className="w-fit border-sky-300 text-sky-700 dark:border-sky-400 dark:text-sky-100"
                    >
                      {item.engTitle}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 text-sm leading-relaxed px-4 pb-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.summary}
                  </ReactMarkdown>

                  {sec.period && (
                    <div className="flex items-start gap-2">
                      <CalendarDays className="h-4 w-4 text-emerald-400 shrink-0" />
                      <p className="text-xs text-gray-700 dark:text-gray-200">
                        {sec.period}
                      </p>
                    </div>
                  )}

                  {sec.where && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-sky-400 shrink-0" />
                      <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-1">
                        {sec.where}
                      </p>
                    </div>
                  )}

                  <p className="text-right text-xs text-sky-600 dark:text-sky-300 font-medium">
                    詳細を見る →
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
