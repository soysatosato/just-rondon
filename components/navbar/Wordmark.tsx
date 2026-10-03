/**
 * ヘッダーのワードマーク「ジャスト・ロンドん！」。
 *
 * 以前は「ロンド」だけが素のテキストで、「ん！」が public/logo.png(当時はビッグベン入りの画像)という混成だった。
 * 和文フォントは端末任せなので字形も線の太さも揃わず、画像とのベースラインも
 * 目分量で合わせるしかなかった。いまは全体が1枚の画像で、
 * scripts/build-wordmark.py が書き出す。「ん！」は logo.svg の「ん」と、
 * それに合わせて作った「！」で、色もワードマーク全体を logo.svg に揃えている。
 *
 * 明暗2枚を出し分けている。ダーク用は logo.svg のままの白い線、
 * ライト用は白い地で白が見えないので、白をロゴの地色のネイビーに入れ替えたもの。
 * 出し分けは next-themes の class 方式に合わせて dark: で行う。
 * prefers-color-scheme だと、テーマを手で切り替えた人に追随できない。
 */

const WIDTH = 1181;
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
