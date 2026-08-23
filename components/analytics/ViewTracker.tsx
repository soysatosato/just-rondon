"use client";

import { useEffect, useRef } from "react";

/**
 * 閲覧を記録するだけの、何も描画しないコンポーネント。
 *
 * 詳細ページ(観光スポット・美術館・ミュージカル・コラム・イギリス英語・
 * いまのイギリス)の末尾に置く。数字は読者に見せず、「人気のスポット」
 * 「人気の記事」の並べ替えに使う内部データとして貯める。
 *
 * サーバー側で数えないのは、詳細ページが revalidate=3600 の ISR で
 * キャッシュされるため。ページ本体が動くのはキャッシュ再生成のときだけで、
 * 1ページあたり1時間に1回しか加算されない。
 *
 * 失敗は握りつぶす。閲覧記録が取れないことより、読者の画面に
 * エラーが出るほうが困る。
 */
export default function ViewTracker({
  targetType,
  slug,
}: {
  targetType:
    | "attraction"
    | "museum"
    | "musical"
    | "column"
    | "britishEnglish"
    | "modernBritain";
  slug: string;
}) {
  // Strict Mode の二重実行と、同一ページ内での再描画で二重に送らないための旗。
  const sent = useRef<string | null>(null);

  useEffect(() => {
    const key = `${targetType}:${slug}`;
    if (sent.current === key) return;
    sent.current = key;

    // 別タブで開かれた(バックグラウンドで先読みされた)ページは、
    // まだ読まれていないので数えない。表向きになった時点で送る。
    if (document.visibilityState !== "visible") {
      const onVisible = () => {
        if (document.visibilityState === "visible") {
          document.removeEventListener("visibilitychange", onVisible);
          send(targetType, slug);
        }
      };
      document.addEventListener("visibilitychange", onVisible);
      return () => document.removeEventListener("visibilitychange", onVisible);
    }

    send(targetType, slug);
  }, [targetType, slug]);

  return null;
}

function send(targetType: string, slug: string) {
  // keepalive を付けて、送信中にページを離れても落ちないようにする。
  // 直帰(すぐ戻る)の閲覧を取りこぼすと、ランキングが滞在の長い
  // ページに偏るため。
  fetch("/api/views", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetType, slug }),
    keepalive: true,
  }).catch(() => {
    // 記録できなくてよい。読者の体験に影響させない。
  });
}
