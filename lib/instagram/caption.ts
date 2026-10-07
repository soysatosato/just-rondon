import type { IgCategory } from "./limits";
import { IG_SLIDE_COUNT } from "./limits";

/**
 * Instagram の投稿に付けるキャプションと、画像のURL。
 *
 * キャプションの本文だけを原稿として持ち、記事への誘導・画像クレジット・
 * タグはここで足す。誘導の文言を投稿ごとに書かせると揺れるうえ、
 * クレジットを原稿に書かせると写真を差し替えたときに古い表記が残る。
 */

/** プロフィールのリンク先(app/(no-ads)/ig/page.tsx)。キャプションのリンクは押せない。 */
export const IG_LINK_PAGE = "/ig";
export const IG_LINK_LABEL = "just-rondon.com/ig";

/**
 * プロフィールに貼るURL。GA4 で Instagram から来たセッションを数えるため、
 * 計測用の印をここにだけ付ける(サイト内のリンクには付けない。付けると
 * セッションが途中で切り替わる)。
 */
export const IG_BIO_URL =
  "https://www.just-rondon.com/ig?utm_source=instagram&utm_medium=social&utm_campaign=bio";

export function articlePath(category: IgCategory, slug: string): string {
  return `/${category}/${encodeURIComponent(slug)}`;
}

/**
 * CC BY / CC BY-SA の画像は、手を加えたことを示すのが条件。表紙は写真を
 * 切り抜いて文字を重ねているので、その旨を添える。
 */
function adaptationNote(credit: string): string {
  return /\bCC BY\b/.test(credit) ? "(切り抜き・文字入れをしています)" : "";
}

export function composeIgCaption({
  caption,
  hashtags,
  credit,
}: {
  caption: string;
  hashtags: string[];
  /** 表紙に写真を使ったときだけ渡す。 */
  credit: string | null;
}): string {
  const blocks = [
    caption.trim(),
    `記事の全文は、プロフィールのリンク(${IG_LINK_LABEL})から読めます。`,
  ];
  if (credit) blocks.push(`表紙の画像: ${credit}${adaptationNote(credit)}`);
  if (hashtags.length) blocks.push(hashtags.map((tag) => `#${tag}`).join(" "));
  return blocks.join("\n\n");
}

export type IgFormat = "feed" | "reel";

/**
 * 1枚の画像のURL。app/og/instagram/[id]/[n]/route.tsx と対。
 *
 * ?v= に原稿と記事の更新日時を入れる。ルートは immutable で配るので、
 * 原稿を直したら別URLにして取り直させる。
 */
export function igSlideUrl(
  post: { id: string; updatedAt: Date },
  contentUpdatedAt: Date,
  n: number,
  format: IgFormat = "feed",
): string {
  const v = `${IG_SLIDE_VERSION}-${post.updatedAt.getTime()}-${contentUpdatedAt.getTime()}`;
  return `/og/instagram/${post.id}/${n}?v=${v}${format === "reel" ? "&f=reel" : ""}`;
}

export function igSlideUrls(
  post: { id: string; updatedAt: Date },
  contentUpdatedAt: Date,
  format: IgFormat = "feed",
): string[] {
  return Array.from({ length: IG_SLIDE_COUNT }, (_, i) =>
    igSlideUrl(post, contentUpdatedAt, i + 1, format),
  );
}

/** 版面のバージョン。デザインを変えたら上げる(古い画像のキャッシュを外す)。 */
export const IG_SLIDE_VERSION = 1;
