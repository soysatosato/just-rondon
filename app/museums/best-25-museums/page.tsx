// app/london-museums/page.tsx
import MuseumBlurbList from "@/components/museums/MuseumBlurbList";
import { fetchTop25Museums } from "@/utils/actions/museums";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";

export const metadata = {
  title: "ロンドンの美術館おすすめセレクション| ロンドん!!",
  description:
    "ロンドン観光で絶対行くべき美術館のおすすめセレクションを紹介！ナショナルギャラリーやテートモダン、ヴィクトリア＆アルバート美術館など、無料・話題の展示情報も網羅。見どころやアクセス、最新展覧会まで初心者でも安心して楽しめるガイドです。",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/museums/best-25-museums",
  },
};

export default async function LondonMuseumsPage() {
  const museums = await fetchTop25Museums();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary to-background text-foreground">
      <div>
        <MuseumBreadCrumbs name="美術館ナビ" link2="" name2="おすすめ美術館" />
      </div>
      {/* Hero / Lead Copy */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-10">
          <div className="bg-indigo-600 text-white py-20 text-center">
            <Badge className="rounded-2xl px-3 py-1 text-sm mb-5">
              <Sparkles className="mr-1 h-4 w-4" /> ロンドん！特集
            </Badge>
            <h1 className="text-3xl font-bold mb-2">美術館25選</h1>
            <p className="">ロンドンで行くべき25のミュージアムを紹介！</p>
          </div>

          <p className="mt-4 text-muted-foreground leading-8 text-lg">
            旅の朝、テムズはまだ薄い銀色を帯びている。
          </p>
          <p className="mt-2 text-muted-foreground leading-8 text-lg">
            ここは〈ロンドん！〉― ロンドンに魔法の促音をひとつ足した造語。
            日常と非日常の境目が、少しだけ跳ねる場所。名品も実験も、王道も路地裏も、
            25の館を選りすぐり一冊の小説みたいに緩急をつけて特集しています。
            ページの順番は、あなたの足で自由に書き換えてください。
          </p>
          <p className="mt-2 text-muted-foreground leading-8 text-lg">
            それでは、扉の鍵は渡しました。物語の第一章は、どの館から始めますか。
          </p>
        </div>
        {/* <div className="h-72 md:h-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-white" /> */}
      </section>

      {/* Museums Grid */}
      <section className="mx-auto max-w-6xl px-6 mt-8 mb-16">
        <MuseumBlurbList museums={museums} />
      </section>
    </div>
  );
}
