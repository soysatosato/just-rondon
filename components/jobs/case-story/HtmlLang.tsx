"use client";

import { useEffect } from "react";

/**
 * <html lang> をこのページの言語に合わせる。
 *
 * app/layout.tsx が唯一の <html> を描画しており、そこは lang="ja" 固定。
 * ルートレイアウトを分割せずに言語別の lang を出す方法が無いため、
 * マウント時に書き換え、離脱時に元へ戻す。
 * スクリーンリーダーの読み上げ言語とブラウザの翻訳提案がこれで正しくなる。
 */
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const el = document.documentElement;
    const previous = el.lang;
    el.lang = lang;
    return () => {
      el.lang = previous;
    };
  }, [lang]);

  return null;
}
