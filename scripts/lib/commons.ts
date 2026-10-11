/**
 * Wikimedia Commons の画像を解決する。
 *
 * seed スクリプトはファイル名(File:...)だけを持ち、URL・作者・ライセンスは
 * 毎回ここで取り直す。Commons は同じファイル名のまま中身が差し替わることが
 * あり、解決済みURLを手で貼るとライセンス表記だけが古いまま残るため。
 */

import { parseWikimediaUrl } from "./article-image";

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
    // display:none の要素は非表示の重複テキストとして混入することがある
    // (例: "Unknown author" が可視テキストと隠しspanの両方に入っている)。
    // タグを消す前に中身ごと除去する。
    .replace(/<span[^>]*style="[^"]*display:\s*none[^"]*"[^>]*>.*?<\/span>/gis, "")
    .replace(/<[^>]*>/g, "")
    // タグを落としたあとの実体参照(「Rowney &amp; Co.」など)を文字に戻す。
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&")
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

  // thumburl は縮小版。原寸は数MBあることがあり一覧に載せられない。
  // 縮小版が無い(元が十分小さい)ファイルでは url にトラッキング用の
  // クエリが付いてくるので落としておく。
  const rawUrl: string = info.thumburl ?? info.url;

  return {
    url: rawUrl.split("?")[0],
    credit: creditFromMetadata(info.extmetadata),
    link: info.descriptionurl,
  };
}

/** extmetadata から「作者 / ライセンス, via Wikimedia Commons」を組む。 */
function creditFromMetadata(meta: any, via = "Wikimedia Commons"): string {
  const artist = meta?.Artist?.value ? stripHtml(meta.Artist.value) : "不明";
  const license = meta?.LicenseShortName?.value
    ? stripHtml(meta.LicenseShortName.value)
    : "Wikimedia Commons";
  return `${artist} / ${license}, via ${via}`;
}

export type CommonsCredit = {
  credit: string;
  link: string;
};

/** API の1回に載せられる titles の上限(一般ユーザーは50)。 */
const TITLES_PER_REQUEST = 50;

/**
 * 記事に入っている画像URL(upload.wikimedia.org)から、クレジットをまとめて引く。
 *
 * resolveCommonsImage がファイル名から URL まで解決し直すのに対し、こちらは
 * URL を変えずに表記だけを取る。読み物の主画像は登録時に幅を検査した
 * 1280px 版の URL が入っており(scripts/lib/article-image.ts)、それを
 * 書き換えたくないため。
 *
 * en.wikipedia などのローカルファイルは、その wiki の API に聞く。表記の
 * 「via」もその wiki の名前にする。
 *
 * 引けなかった URL(Wikimedia 以外、削除済み)は Map に入らない。
 */
export async function resolveCommonsCredits(
  urls: string[],
): Promise<Map<string, CommonsCredit>> {
  const files = await lookupWikimediaFiles(urls);
  return new Map(
    [...files].map(([url, file]) => [url, { credit: file.credit, link: file.link }]),
  );
}

export type WikimediaFile = CommonsCredit & {
  /** "commons" か、ローカルファイルを持つ wiki の言語コード("en" など)。 */
  wiki: string;
  /** 原本の寸法。 */
  width: number;
  height: number;
  /**
   * servedWidth を渡したときだけ入る、その幅で配る URL。
   *
   * 原本がその幅より狭ければ原本の URL になる(Wikimedia は原本より大きい
   * 縮小版を作らず 400 を返す)。SVG や TIFF の縮小版は .png / .jpg に
   * 変わるので、自分で組まず API の thumburl を使う。API は
   * thumb.wikimedia.org で返すが、既存のデータと lib/og.ts は
   * upload.wikimedia.org/.../thumb/ の形を前提にしているので、そちらに揃える。
   */
  servedUrl?: string;
};

/**
 * 画像URL(upload.wikimedia.org)ごとに、Commons(または各 wiki)のファイル
 * 情報をまとめて引く。表記・原本の寸法と、servedWidth を渡せばその幅の URL。
 *
 * 引けなかった URL(Wikimedia 以外、削除済み)は Map に入らない。
 */
export async function lookupWikimediaFiles(
  urls: string[],
  servedWidth?: number,
): Promise<Map<string, WikimediaFile>> {
  const result = new Map<string, WikimediaFile>();

  // wiki ごとに「ファイル名 → そのファイルを指す URL たち」をまとめる。
  const byWiki = new Map<string, Map<string, string[]>>();
  for (const url of new Set(urls)) {
    const parsed = parseWikimediaUrl(url.trim().split(/[?#]/)[0]);
    if (!parsed) continue;
    const files = byWiki.get(parsed.wiki) ?? new Map<string, string[]>();
    files.set(parsed.fileName, [...(files.get(parsed.fileName) ?? []), url]);
    byWiki.set(parsed.wiki, files);
  }

  for (const [wiki, files] of byWiki) {
    const api =
      wiki === "commons"
        ? "https://commons.wikimedia.org/w/api.php"
        : `https://${wiki}.wikipedia.org/w/api.php`;
    const via = wiki === "commons" ? "Wikimedia Commons" : `${wiki}.wikipedia`;
    const names = [...files.keys()];

    for (let i = 0; i < names.length; i += TITLES_PER_REQUEST) {
      const chunk = names.slice(i, i + TITLES_PER_REQUEST);
      const query = new URLSearchParams({
        action: "query",
        format: "json",
        prop: "imageinfo",
        iiprop: "url|size|extmetadata",
        iiextmetadatafilter: "Artist|LicenseShortName",
        titles: chunk.map((name) => `File:${name}`).join("|"),
        ...(servedWidth ? { iiurlwidth: String(servedWidth) } : {}),
      });
      const res = await fetch(`${api}?${query}`, {
        headers: { "User-Agent": UA },
      });
      if (!res.ok) {
        throw new Error(`Wikimedia API returned ${res.status} (${wiki})`);
      }
      const json = (await res.json()) as any;

      // API はタイトルを正規化して返す(空白と _ の違いなど)。元の名前に戻す。
      const original = new Map<string, string>();
      for (const name of chunk) original.set(`File:${name}`, name);
      for (const n of json?.query?.normalized ?? []) {
        const name = original.get(n.from);
        if (name) original.set(n.to, name);
      }

      for (const page of Object.values(json?.query?.pages ?? {}) as any[]) {
        const info = page?.imageinfo?.[0];
        const name = original.get(page?.title);
        if (!info || !name) continue;
        const served: string | undefined = info.thumburl ?? info.url;
        const file: WikimediaFile = {
          wiki,
          credit: creditFromMetadata(info.extmetadata, via),
          link: String(info.descriptionurl),
          width: Number(info.width),
          height: Number(info.height),
          servedUrl:
            servedWidth && served
              ? served
                  .split("?")[0]
                  .replace(
                    /^https:\/\/thumb\.wikimedia\.org\//,
                    "https://upload.wikimedia.org/",
                  )
              : undefined,
        };
        for (const url of files.get(name) ?? []) result.set(url, file);
      }
    }
  }

  return result;
}

/**
 * 1枚ぶんの画像列。作成スクリプトが主画像・節の挿絵を入れるときに使う。
 * Commons 以外の画像や、引けなかった画像は表記なし(null)で入る。
 */
export async function creditColumns(url: string | null | undefined) {
  if (!url?.trim()) {
    return { imageSource: null, imageCredit: null, imageLink: null };
  }
  const credit = (await resolveCommonsCredits([url])).get(url);
  if (!credit) {
    console.warn(`  画像のクレジットを取れなかった(表記なしで入れる): ${url}`);
    return { imageSource: null, imageCredit: null, imageLink: null };
  }
  return {
    imageSource: "commons",
    imageCredit: credit.credit,
    imageLink: credit.link,
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
