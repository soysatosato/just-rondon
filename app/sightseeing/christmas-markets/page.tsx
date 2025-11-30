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
import { fetchChristmasMarket } from "@/utils/actions/contents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

export default async function Page() {
  const contents = await fetchChristmasMarket();

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

      <section
        className="
          grid gap-6 
          grid-cols-1 
          md:grid-cols-2
          max-w-full 
        "
      >
        {contents.map((item) => {
          const sec = normalizeSections(item.sections);

          return (
            <Card
              key={item.id}
              className="w-full min-w-0 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 shadow-sm"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                    <CardHeader className="space-y-2">
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

                    <span className="text-sm text-sky-600 dark:text-sky-300 font-medium whitespace-nowrap">
                      詳細を見る →
                    </span>
                  </div>
                </DialogTrigger>

                <CardContent className="space-y-4 text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.summary}
                  </ReactMarkdown>

                  {sec.period && (
                    <div className="flex items-start gap-2">
                      <CalendarDays className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="font-semibold">期間</p>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {sec.period}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {sec.where && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-sky-400" />
                      <div className="prose prose-sm max-w-full prose-a:text-sky-600 prose-a:no-underline dark:prose-invert dark:prose-a:text-sky-300">
                        <p className="font-semibold">場所</p>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 dark:text-sky-300 underline decoration-sky-500/50 hover:opacity-80"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {sec.where}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {sec.tips && (
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <div>
                        <p className="font-semibold">訪問のコツ</p>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {sec.tips}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {sec.extra && (
                    <div className="flex items-start gap-2">
                      <Compass className="h-4 w-4 text-purple-300" />
                      <div>
                        <p className="font-semibold">周辺でできること</p>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {sec.extra}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </CardContent>

                <DialogContent className="max-w-2xl space-y-6">
                  <DialogHeader>
                    <DialogTitle>{item.title}</DialogTitle>
                    {item.engTitle && (
                      <DialogDescription>{item.engTitle}</DialogDescription>
                    )}
                  </DialogHeader>

                  {item.image && (
                    <div className="w-full max-h-64 overflow-hidden rounded-lg">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {item.website && (
                    <p className="text-sm font-medium text-sky-600 dark:text-sky-300 underline">
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        公式サイトはこちら
                      </a>
                    </p>
                  )}

                  <div className="prose dark:prose-invert max-w-full max-h-80 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-md">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.mainText}
                    </ReactMarkdown>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
