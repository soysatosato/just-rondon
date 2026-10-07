/**
 * 読み物(コラム・イギリス英語)の主画像を、登録できる形に揃える。
 *
 * 条件は2つある。
 *
 * 1. 原本の幅が1200px以上であること。Google Discover が大きな画像のカードを
 *    出す条件で(robots の max-image-preview:large と対。lib/seo.ts の
 *    INDEXABLE_ROBOTS)、これを満たさない記事は Discover では小さな
 *    サムネイル扱いになる。2026-10 の点検では、コラム73本中31本が
 *    120x248 などの小さな画像だった。
 * 2. 配る画像は1280px版にすること。原本をそのまま貼ると 8133x5422 / 18MB
 *    といった写真を記事の上部と一覧のカードで読ませることになる。
 *    1280px なら Discover の条件を満たしたまま数百KBで済む。
 *
 * 幅は URL からは分からないので Commons の API に聞く。Wikimedia 以外の
 * 画像は幅を確かめられないので受け付けない(スキルの指示でも Commons に
 * 限っている)。
 */

import { wikimediaThumbUrl } from "../../lib/og";

const UA =
  "just-rondon/1.0 (https://www.just-rondon.com; article image checker)";

/** Discover が「大きな画像」として扱う最小幅。 */
export const MIN_ARTICLE_IMAGE_WIDTH = 1200;

/**
 * 配る幅。Wikimedia が生成を許している幅(lib/og.ts の
 * WIKIMEDIA_THUMB_WIDTHS)のうち、1200 以上で最小のもの。
 */
const SERVED_WIDTH = 1280;

export type ArticleImage = {
  /** DB の image に入れる URL。 */
  url: string;
  /** 原本の寸法。 */
  width: number;
  height: number;
};

/** upload.wikimedia.org の URL から、どの wiki のどのファイルかを読む。 */
export function parseWikimediaUrl(
  url: string,
): { wiki: string; fileName: string } | null {
  // /wikipedia/commons/thumb/a/ab/<name>/<n>px-<name>
  // API が返す縮小版は thumb.wikimedia.org 側にあることがあるので両方読む。
  const thumb = url.match(
    /^https:\/\/(?:upload|thumb)\.wikimedia\.org\/wikipedia\/([^/]+)\/thumb\/[0-9a-f]\/[0-9a-f]{2}\/([^/]+)\//,
  );
  if (thumb) return { wiki: thumb[1], fileName: decodeURIComponent(thumb[2]) };

  // /wikipedia/commons/a/ab/<name>
  const original = url.match(
    /^https:\/\/(?:upload|thumb)\.wikimedia\.org\/wikipedia\/([^/]+)\/[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)$/,
  );
  if (original) {
    return { wiki: original[1], fileName: decodeURIComponent(original[2]) };
  }

  return null;
}

/**
 * 主画像の URL を検査し、DB に入れる URL を返す。
 * 条件を満たさなければ理由つきで例外を投げる(記事は作らせない)。
 */
export async function resolveArticleImage(url: string): Promise<ArticleImage> {
  // API やブラウザからコピーした URL には ?utm_source=... が付いてくる。
  const parsed = parseWikimediaUrl(url.trim().split(/[?#]/)[0]);
  if (!parsed) {
    throw new Error(
      `image must be an upload.wikimedia.org URL (got ${url}). ` +
        "Other hosts cannot be checked for width.",
    );
  }

  // en.wikipedia などのローカルファイルは、その wiki の API にしか無い。
  const api =
    parsed.wiki === "commons"
      ? "https://commons.wikimedia.org/w/api.php"
      : `https://${parsed.wiki}.wikipedia.org/w/api.php`;
  const query = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url|size",
    titles: `File:${parsed.fileName}`,
  });

  const res = await fetch(`${api}?${query}`, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    throw new Error(`Wikimedia API returned ${res.status} for ${url}`);
  }
  const json = (await res.json()) as any;
  const page: any = Object.values(json?.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error(`File not found on Wikimedia: ${parsed.fileName}`);

  const { width, height } = info as { width: number; height: number };
  if (width < MIN_ARTICLE_IMAGE_WIDTH) {
    throw new Error(
      `image is ${width}x${height}, narrower than ${MIN_ARTICLE_IMAGE_WIDTH}px ` +
        `(${parsed.fileName}). Google Discover needs ${MIN_ARTICLE_IMAGE_WIDTH}px ` +
        "or wider — pick another file.",
    );
  }

  // 1200〜1279px の原本は縮小版を作れない(原本より大きい幅は 400 になる)
  // ので原本のまま配る。その幅なら重くても1MB前後に収まる。
  //
  // 縮小版の URL は API の thumburl を使わず自分で組む。thumburl は
  // thumb.wikimedia.org を返すが、既存の記事と lib/og.ts のカード描画は
  // upload.wikimedia.org/.../thumb/ の形を前提にしている。
  const original: string = info.url.split("?")[0];
  const served =
    width >= SERVED_WIDTH ? wikimediaThumbUrl(original, SERVED_WIDTH) : original;

  // 縮小版は要求されて初めて作られる。ここで一度取り、実際に配れることを
  // 確かめておく(Wikimedia が受け付けない幅だと 400 が返る)。
  const check = await headWithRetry(served);
  const type = check.headers.get("content-type") ?? "";
  if (!check.ok || !type.startsWith("image/")) {
    throw new Error(`image URL does not serve an image (${check.status}): ${served}`);
  }

  return { url: served, width, height };
}

/**
 * HEAD を送る。429 のときだけ待って取り直す。
 *
 * Wikimedia は縮小版の新規生成を IP ごとに絞っており、何十本もまとめて
 * 検査すると数本目から 429 が返る。画像に問題があるわけではないので、
 * Retry-After(無ければ 2, 4, 8, 16 秒)だけ待って再試行する。
 */
async function headWithRetry(url: string): Promise<Response> {
  for (let attempt = 0; ; attempt += 1) {
    const res = await fetch(url, { method: "HEAD", headers: { "User-Agent": UA } });
    if (res.status !== 429 || attempt >= 4) return res;
    const retryAfter = Number(res.headers.get("retry-after"));
    const seconds = retryAfter > 0 ? retryAfter : 2 ** (attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
