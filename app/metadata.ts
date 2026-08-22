// app/metadata.ts
import { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * ルートレイアウトのデフォルト metadata。
 *
 * alternates.canonical は意図的に持たせていない。
 * Next はレイアウトの metadata をページへ浅くマージするため、ここに canonical を置くと
 * metadata を定義していないページがすべて「自分はトップページだ」と宣言してしまう
 * (実際に /sightseeing などの主要ページがこれで自滅していた)。
 * canonical は各ページが lib/seo.ts の buildPageMetadata で自分の path から出す。
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | ロンドン観光・美術館・ニュース・ミュージカル情報`,
  description:
    "初めてのロンドン旅行でも安心！美術館や必見作品、最新展覧会情報、ミュージカル・イベント・映画プレミア情報、ロンドンの最新ニュースや観光スポット情報をわかりやすく紹介する、観光客向け総合アート・エンタメガイドサイトです。",
  keywords:
    "ロンドン観光, 美術館, 展覧会, ミュージカル, 映画プレミア, ニュース, イベント, 観光スポット, アート, エンタメ",
  authors: [{ name: "ジャスト・ロンドン 運営", url: SITE_URL }],
  robots: {
    index: true, // インデックス許可
    follow: true, // リンク追従許可
  },
  openGraph: {
    title: `${SITE_NAME} | ロンドン観光・美術館・ニュース・ミュージカル情報`,
    description:
      "初めてのロンドン旅行でも安心！美術館、展覧会、ミュージカル・イベント・映画プレミア、ロンドンの最新ニュースや観光情報をわかりやすく紹介する総合ガイドサイト。",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "ja_JP",
    images: [
      {
        // SVGはどのSNSのOGレンダラーも表示できないためPNGを使う
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} | ロンドン観光・エンタメガイド`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ロンドン観光・美術館・ニュース・ミュージカル情報`,
    description:
      "美術館や展覧会、ミュージカル・イベント・映画プレミア、最新ニュースなどロンドン観光の情報をわかりやすく紹介する総合ガイドサイト。",
    images: [DEFAULT_OG_IMAGE],
    // X運用を一旦停止中のため site/creator は非表示
    // site: TWITTER_HANDLE,
    // creator: TWITTER_HANDLE,
  },
  icons: {
    // faviconとしてのSVGは各ブラウザが対応しているのでこちらはそのまま
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};
