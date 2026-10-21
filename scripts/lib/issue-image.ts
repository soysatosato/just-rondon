/**
 * 週次・月次の号の写真を、DB の image* 列に入れる形にする。
 *
 * 条件は読み物の主画像と同じ(scripts/lib/article-image.ts): Wikimedia の
 * 画像で、原本の幅が1200px以上。配るのは 1280px 版。そのうえで、
 *
 * - 出典(作者とライセンス)が引けない画像は受け付けない。号の写真は題字の
 *   下に出し、表示が利用の条件なので、表記なしで入れる逃げ道を作らない。
 * - 何が写っているかの1文(imageAlt)を必須にする。号の写真は「その週の
 *   目玉の会場か様子」で、撮影年がその年とは限らない。alt に書いておかないと、
 *   読み上げでは何の写真か分からず、過去の写真を今年の様子と取り違えさせる。
 */

import { resolveArticleImage } from "./article-image";
import { creditColumns } from "./commons";

export type IssueImageColumns = {
  image: string | null;
  imageAlt: string | null;
  imageSource: string | null;
  imageCredit: string | null;
  imageLink: string | null;
};

const EMPTY: IssueImageColumns = {
  image: null,
  imageAlt: null,
  imageSource: null,
  imageCredit: null,
  imageLink: null,
};

export async function issueImageColumns(
  image: string | null | undefined,
  alt: string | null | undefined,
): Promise<IssueImageColumns> {
  if (!image?.trim()) return EMPTY;
  if (!alt?.trim()) {
    throw new Error(
      "imageAlt is required when image is set: one sentence on what the photo shows (and the year if it is not this year's).",
    );
  }

  // 幅が1200px未満・Wikimedia 以外なら、ここで理由つきの例外になる。
  const resolved = await resolveArticleImage(image);
  const credit = await creditColumns(resolved.url);
  if (credit.imageSource !== "commons" || !credit.imageCredit) {
    throw new Error(
      `Could not read the author and licence of ${resolved.url}. Pick another Wikimedia Commons photo.`,
    );
  }

  return { image: resolved.url, imageAlt: alt.trim(), ...credit };
}
