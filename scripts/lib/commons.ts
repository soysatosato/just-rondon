/**
 * Wikimedia Commons の画像を解決する。
 *
 * seed スクリプトはファイル名(File:...)だけを持ち、URL・作者・ライセンスは
 * 毎回ここで取り直す。Commons は同じファイル名のまま中身が差し替わることが
 * あり、解決済みURLを手で貼るとライセンス表記だけが古いまま残るため。
 */

const UA =
  "just-rondon/1.0 (https://www.just-rondon.com; content image resolver)";

export type CommonsImage = {
  url: string;
  credit: string;
  link: string;
};

/** Commons のキャプションは HTML で返ってくるのでタグを落とす。 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function resolveCommonsImage(
  fileTitle: string,
): Promise<CommonsImage | null> {
  const endpoint =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "1000",
      titles: fileTitle,
    }).toString();

  const res = await fetch(endpoint, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;

  const json = (await res.json()) as any;
  const pages = json?.query?.pages ?? {};
  const page: any = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;

  const meta = info.extmetadata ?? {};
  const artist = meta.Artist?.value ? stripHtml(meta.Artist.value) : "不明";
  const license = meta.LicenseShortName?.value
    ? stripHtml(meta.LicenseShortName.value)
    : "Wikimedia Commons";

  // thumburl は縮小版。原寸は数MBあることがあり一覧に載せられない。
  // 縮小版が無い(元が十分小さい)ファイルでは url にトラッキング用の
  // クエリが付いてくるので落としておく。
  const rawUrl: string = info.thumburl ?? info.url;

  return {
    url: rawUrl.split("?")[0],
    credit: `${artist} / ${license}, via Wikimedia Commons`,
    link: info.descriptionurl,
  };
}

/** 画像フィールドを DB のカラム名に展開する。 */
export function imageColumns(image: CommonsImage | null) {
  return {
    image: image?.url ?? null,
    imageSource: image ? "commons" : null,
    imageCredit: image?.credit ?? null,
    imageLink: image?.link ?? null,
  };
}
