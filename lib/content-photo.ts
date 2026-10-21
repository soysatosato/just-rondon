/**
 * コードに本文を書いたページ(「◯月のロンドン」・年中行事ガイド)の写真。
 *
 * Wikimedia Commons の CC 画像だけを使い、作者とライセンスを credit に書いて
 * 写真の下に出す(表示が利用の条件)。credit は DB の imageCredit と同じ
 * 「作者 / ライセンス, via Wikimedia Commons」の形。
 *
 * url は原本の幅が1200px以上のファイルの 1280px 版にする。Discover が
 * 大きな画像のカードを出す条件で(scripts/lib/article-image.ts)、ページの
 * og:image と JSON-LD の image にもこの写真を使う(lib/og.ts の photoOgImage)。
 *
 * 写すのは、その月・その行事の場所や様子。作品(展示物・期間限定の装飾)は
 * 写さない。撮影年はその年とは限らないので、年が違えば alt に書く。
 */
export type ContentPhoto = {
  url: string;
  /** 何が写っているかの1文。 */
  alt: string;
  credit: string;
  /** Commons のファイルページ。 */
  link: string;
};
