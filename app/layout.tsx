import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";
import { defaultMetadata } from "./metadata";
import MainFooter from "@/components/home/MainFooter";
import MainNav from "@/components/navbar/MainNav";
import PlanFloatingBar from "@/components/attractions/plan/PlanFloatingBar";
import PlanSync from "@/components/attractions/plan/PlanSync";
import SiteJsonLd from "@/components/seo/SiteJsonLd";
import SearchDialog from "@/components/search/SearchDialog";
import ConsentDefaults from "@/components/consent/ConsentDefaults";

export const metadata = defaultMetadata;

// NEXT_PUBLIC_* はビルド時の文字列置換なので、process.env.X の形で完全に書く必要がある。
// 分割代入するとブラウザバンドルで undefined になり、無言で計測されなくなる。
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const isProduction = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
      ログイン状態はクライアント側で解決する。dynamic を渡していないので
      ClerkProvider はページを動的描画に落とさず、記事ページは
      ISR のキャッシュから返る。サーバー側でログイン状態を見るのは
      middleware.ts の matcher に挙げたページだけ。

      これが成り立つのは @clerk/nextjs v6 以降。v5 の ClerkProvider は
      dynamic の有無に関係なく毎回 headers() を読むので、ここに置くだけで
      全ページが動的描画になる。2026-09-21 にここへ入れてから v6 に
      上げるまでの間、全ページが cache-control: private, no-store で
      返り、記事の本文は loading.tsx の骨組みの後ろ(<div hidden>)に
      流し込まれていた。dynamic を渡す・v5 に戻す、はどちらも同じことになる。

      localization に jaJP を渡しているのは、サインイン画面の文言が
      英語のままだと、日本語で書かれたサイトの中で Clerk の画面だけが
      別サービスに飛ばされたように見えるため。
    */
    <ClerkProvider localization={jaJP}>
      <html lang="ja" suppressHydrationWarning>
        <head>
          {/* 英国・EEA・スイスの同意の初期値。GA の config より先に置く。 */}
          {isProduction && GA_ID && <ConsentDefaults />}
        </head>
        <body className="bg-background text-foreground transition-colors duration-300">
          <SiteJsonLd />
          <Providers>
            {/*
              本文へのスキップリンク。キーボードで最初に止まる位置に置く。
              ナビは区分だけで10項目以上あり、無いと毎ページそれを全部
              通らないと本文に届かない。普段は隠し、フォーカスで出す。
            */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus:ring-2 focus:ring-ring"
            >
              本文へスキップ
            </a>
            <MainNav />
            {/* サイト内検索の画面。どこから開いても同じ1つを使う。 */}
            <SearchDialog />
            {/*
              main はここの1つだけ。ページ側の本文の入れ物は
              data-page-main の div にしてある(main が入れ子になると、
              読み上げで本文の領域が2つあることになる)。
              tabIndex=-1 はスキップリンクで飛んだ先にフォーカスを移すため。
            */}
            <main
              id="main-content"
              tabIndex={-1}
              className="container py-4 focus:outline-none"
            >
              {children}
            </main>
            <MainFooter />
            {/* 組みかけの旅程はどのページからでも開ける。空なら何も出ない。 */}
            <PlanFloatingBar />
            {/* ログインしていれば、どのページで変えたプランもアカウントへ送る。 */}
            <PlanSync />
          </Providers>

          {/*
            AdSense 本体はここで読み込まない。ここに置くと /contact・/sign-in・
            404 など本文の無い画面にも入り、自動広告がそこに出てポリシー違反に
            なる。読み込みは components/ads/AdSenseLoader.tsx を参照。
          */}

          {isProduction && GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        </body>
      </html>
    </ClerkProvider>
  );
}
