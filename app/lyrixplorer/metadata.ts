// app/metadata.ts
import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title:
    "LyriXplorer（リリックスプローラー） | 洋楽歌詞の和訳・意味解説・英語表現を深く味わう",
  description:
    "LyriXplorer（リリックスプローラー）は、洋楽歌詞を丁寧に和訳し、比喩や背景、英語表現のニュアンスまで深く解説する和訳特化サイトです。英語学習にも、音楽鑑賞にも役立つ歌詞解釈を提供します。",
  keywords:
    "歌詞 和訳, 洋楽 和訳, 歌詞 意味, 英語 歌詞 解釈, 洋楽 英語表現, 歌詞 翻訳, 英語 学習, LyriXplorer",
  authors: [
    {
      name: "LyriXplorer 編集部",
      url: "https://www.just-rondon.com/lyrixplorer",
    },
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/lyrixplorer",
  },
  openGraph: {
    title: "LyriXplorer | 洋楽歌詞の和訳・意味解説・英語表現を深く味わう",
    description:
      "洋楽歌詞をただ訳すだけでなく、比喩・文化背景・英語表現のニュアンスまで丁寧に解説。音楽と英語を同時に楽しめる和訳特化サイト。",
    url: "https://www.just-rondon.com/lyrixplorer",
    siteName: "LyriXplorer",
    type: "website",
    images: [
      {
        url: "/apple-icon.png",
        width: 1200,
        height: 630,
        alt: "LyriXplorer | 洋楽歌詞和訳・意味解説サイト",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LyriXplorer | 洋楽歌詞の和訳・意味解説・英語表現を深く味わう",
    description:
      "洋楽歌詞を丁寧に和訳し、意味・背景・英語表現まで解説する和訳特化サイト。",
    images: ["/apple-icon.png"],
    site: "@lyrixplorer",
    creator: "@lyrixplorer",
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};
