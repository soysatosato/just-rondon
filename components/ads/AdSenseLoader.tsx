"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT } from "@/lib/adsense";
import { allowsAds } from "@/lib/ad-placement";

const isProduction = process.env.NODE_ENV === "production";

/**
 * AdSense 本体(adsbygoogle.js)の読み込み。
 *
 * ルートのレイアウトには置かない。置くと /contact・/sign-in・404 といった
 * 本文の無い画面にも読み込まれ、自動広告を有効にした時点でそこに広告が
 * 出てポリシー違反になる。読み込むのは広告を出してよいページの
 * レイアウトだけ:
 *
 * - app/page.tsx(トップ)
 * - app/museums/layout.tsx
 * - app/(with-ads)/layout.tsx
 *
 * (with-ads) の配下にもフォーム・送信完了・ダッシュボードがあるので、
 * パスでの除外は lib/ad-placement.ts の allowsAds() に揃える。
 * 404 は notFound() でも存在しない URL でも app/not-found.tsx が
 * これらのレイアウトの外側で描くので、ここまで届かない。
 *
 * 同じ id の Script は next/script が1回しか読み込まないので、
 * 複数のレイアウトに置いても二重には読まれない。
 */
export default function AdSenseLoader() {
  const pathname = usePathname();

  // 開発環境で読み込むと無効トラフィック計上とコンソールノイズの原因になる
  if (!isProduction || !allowsAds(pathname)) return null;

  return (
    <Script
      id="adsbygoogle-loader"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
