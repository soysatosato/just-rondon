import "./globals.css";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";
import { defaultMetadata } from "./metadata";
import MainFooter from "@/components/home/MainFooter";
import Navbar from "@/components/navbar/Navbar";
import PlanFloatingBar from "@/components/attractions/plan/PlanFloatingBar";
import SiteJsonLd from "@/components/seo/SiteJsonLd";
import { ADSENSE_CLIENT } from "@/lib/adsense";

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
      ClerkProvider はページを動的描画に落とさず、記事ページは今までどおり
      ISR のキャッシュから返る。サーバー側でログイン状態を見るのは
      middleware.ts の matcher に挙げたページだけ。

      localization に jaJP を渡しているのは、サインイン画面の文言が
      英語のままだと、日本語で書かれたサイトの中で Clerk の画面だけが
      別サービスに飛ばされたように見えるため。
    */
    <ClerkProvider localization={jaJP}>
      <html lang="ja" suppressHydrationWarning>
        <body className="bg-background text-foreground transition-colors duration-300">
          <SiteJsonLd />
          <Providers>
            <Navbar />
            <main className="container py-4">{children}</main>
            <MainFooter />
            {/* 組みかけの旅程はどのページからでも開ける。空なら何も出ない。 */}
            <PlanFloatingBar />
          </Providers>

          {/* 開発環境で読み込むと無効トラフィック計上とコンソールノイズの原因になる */}
          {isProduction && (
            <Script
              id="adsbygoogle-loader"
              async
              strategy="afterInteractive"
              crossOrigin="anonymous"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            />
          )}

          {isProduction && GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        </body>
      </html>
    </ClerkProvider>
  );
}
