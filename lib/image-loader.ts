"use client";

import { resizedImageUrl } from "./wikimedia-image";

/**
 * next/image の画像ローダー(next.config.mjs の images.loaderFile)。
 *
 * Wikimedia の画像は、要求された幅以上の許可幅のサムネイルに差し替える
 * (元のURLの幅が上限。lib/wikimedia-image.ts の resizedImageUrl)。
 * Vercel の Image Optimization は通さないので課金は発生しない
 * (2026-08 に枠を使い切って 402 が返るようになったのが、unoptimized に
 * していた理由だった)。
 *
 * Wikimedia 以外(Supabase のポスターなど)は幅を変えられないので、
 * 呼び出し側で unoptimized={!isResizableImage(src)} を渡すこと。
 * 渡さないと、開発中に「loader が幅を実装していない」という警告が出る。
 */
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return resizedImageUrl(src, width);
}
