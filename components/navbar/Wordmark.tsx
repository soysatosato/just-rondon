/**
 * ヘッダーのワードマーク「ジャスト・ロンドん！」。
 *
 * 以前は「ロンド」だけが素のテキストで、「ん！」が public/logo.png という混成だった。
 * 和文フォントは端末任せなので字形も線の太さも揃わず、画像とのベースラインも
 * 目分量で合わせるしかなかった。いまは全体が1枚の画像で、
 * scripts/build-wordmark.py が書き出す(素材は今までどおり logo.png)。
 *
 * 明暗2枚を出し分けている。ワードマークのネイビー(「ジャスト」・ビッグベン・バス)は
 * ダークテーマの near-black の地にそのまま置くと沈むので、ダーク用は
 * ネイビーだけを明色に差し替えたものを使う。
 * 出し分けは next-themes の class 方式に合わせて dark: で行う。
 * prefers-color-scheme だと、テーマを手で切り替えた人に追随できない。
 */

const WIDTH = 1112;
const HEIGHT = 160;

export default function Wordmark({ className = "" }: { className?: string }) {
  const shared = `w-auto max-w-full select-none ${className}`;

  return (
    <>
      <img
        src="/wordmark.png"
        width={WIDTH}
        height={HEIGHT}
        alt="ジャスト・ロンドン"
        className={`${shared} dark:hidden`}
        decoding="async"
      />
      {/* 同じ語を2度読み上げさせないため、ダーク用は支援技術から隠す */}
      <img
        src="/wordmark-dark.png"
        width={WIDTH}
        height={HEIGHT}
        alt=""
        aria-hidden
        className={`hidden ${shared} dark:block`}
        decoding="async"
      />
    </>
  );
}
