// app/metadata.ts
import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title:
    "ジャスト・ロンドン | ロンドン観光・美術館・ニュース・ミュージカル情報",
  description:
    "初めてのロンドン旅行でも安心！美術館や必見作品、最新展覧会情報、ミュージカル・イベント・映画プレミア情報、ロンドンの最新ニュースや観光スポット情報をわかりやすく紹介する、観光客向け総合アート・エンタメガイドサイトです。",
  keywords:
    "ロンドン観光, 美術館, 展覧会, ミュージカル, 映画プレミア, ニュース, イベント, 観光スポット, アート, エンタメ",
  authors: [
    { name: "ジャスト・ロンドン 運営", url: "https://www.just-rondon.com" },
  ],
  robots: {
    index: true, // インデックス許可
    follow: true, // リンク追従許可
  },
  alternates: {
    canonical: "https://www.just-rondon.com",
  },
  openGraph: {
    title:
      "ジャスト・ロンドン | ロンドン観光・美術館・ニュース・ミュージカル情報",
    description:
      "初めてのロンドン旅行でも安心！美術館、展覧会、ミュージカル・イベント・映画プレミア、ロンドンの最新ニュースや観光情報をわかりやすく紹介する総合ガイドサイト。",
    url: "https://www.just-rondon.com",
    siteName: "ジャスト・ロンドン",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "ジャスト・ロンドン | ロンドン観光・エンタメガイド",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "ジャスト・ロンドン | ロンドン観光・美術館・ニュース・ミュージカル情報",
    description:
      "美術館や展覧会、ミュージカル・イベント・映画プレミア、最新ニュースなどロンドン観光の情報をわかりやすく紹介する総合ガイドサイト。",
    images: ["/logo.svg"],
    site: "@just_rondon",
    creator: "@just_rondon",
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};
