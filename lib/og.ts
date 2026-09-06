/**
 * SNS共有カード(OG画像)を動的に作るための共通部品。
 *
 * 画像そのものは各セクションの /api/og/... ルートが next/og の ImageResponse で
 * 描く。ここに置くのはサイズ・キャッシュ・フォントといった、どのセクションでも
 * 同じでなければ困る部分だけ。
 */

/**
 * OGカードの寸法。X・Facebook・LINE・Slack がいずれも 1.91:1 を前提にしており、
 * 1200x630 はそのすべてで切り取られずに出る唯一の実質標準。
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = "image/png";

/**
 * OG画像のキャッシュ指定。
 *
 * 画像URLには記事の updatedAt を ?v= として付ける前提なので、同じURLの中身は
 * 二度と変わらない。immutable にしてよく、またそうしないと各SNSが自前で持つ
 * カードキャッシュとVercel側のキャッシュが二重にずれる。
 * 記事を書き換えたときは ?v= が変わり、別URLとして取り直される。
 */
export const OG_CACHE_CONTROL =
  "public, max-age=31536000, s-maxage=31536000, immutable, no-transform";

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
};

const FONT_FAMILY = "Noto Sans JP";

/**
 * Google Fonts に woff2 ではなく truetype を返させるための古い User-Agent。
 *
 * satori(next/og の描画エンジン)は woff2 を読めない。現代のUAで取りに行くと
 * 必ず woff2 が返ってきて、フォント読み込みだけが無言で失敗し、日本語が
 * すべて豆腐になったカードが配信される。ここは意図的に古いUAを送っている。
 */
const TRUETYPE_UA =
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.116 Safari/537.36";

/** フォントのサブセットは1ヶ月キャッシュする。文字の組み合わせごとに別URL。 */
const FONT_REVALIDATE = 60 * 60 * 24 * 30;

async function loadSubset(
  characters: string,
  weight: 400 | 700
): Promise<OgFont | null> {
  try {
    const cssUrl =
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FONT_FAMILY)}` +
      `:wght@${weight}&text=${encodeURIComponent(characters)}`;

    const css = await fetch(cssUrl, {
      headers: { "User-Agent": TRUETYPE_UA },
      next: { revalidate: FONT_REVALIDATE },
    }).then((res) => (res.ok ? res.text() : ""));

    const fontUrl = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1];
    if (!fontUrl) return null;

    const data = await fetch(fontUrl, {
      next: { revalidate: FONT_REVALIDATE },
    }).then((res) => (res.ok ? res.arrayBuffer() : null));
    if (!data) return null;

    return { name: FONT_FAMILY, data, weight, style: "normal" };
  } catch {
    // フォントが取れなくてもカード自体は返す。文字は崩れるが、
    // OG画像が500を返して共有時にカードごと消えるほうが損失が大きい。
    return null;
  }
}

/**
 * カードに実際に描く文字だけを含む日本語フォントを取ってくる。
 *
 * next/og が同梱しているのはラテン文字のみの Noto Sans なので、日本語は
 * 何も指定しないと全部豆腐になる。かといって日本語フォントのファイルを
 * リポジトリに置くと数MBあり関数バンドルに載せるには重い。
 * Google Fonts の text= サブセット(数KB)で必要な字だけ取るのが唯一現実的。
 *
 * @param text カードに出す文字すべてを連結したもの。重複と空白は落として送る。
 */
export async function loadOgFonts(
  text: string,
  weights: (400 | 700)[] = [700]
): Promise<OgFont[]> {
  const characters = Array.from(new Set(Array.from(text.replace(/\s/g, ""))))
    .join("")
    .slice(0, 400);
  if (!characters) return [];

  const fonts = await Promise.all(
    weights.map((weight) => loadSubset(characters, weight))
  );
  return fonts.filter((font): font is OgFont => font !== null);
}

/**
 * ImageResponse に渡すフォント指定。
 *
 * 空配列を渡してはいけない。@vercel/og の `options.fonts || defaultFonts` は
 * 空配列を真値として通すため、フォントが1つも無い状態で satori が落ちる。
 * 取得に失敗したときはキー自体を消して同梱フォントに任せる。
 */
export function ogFontOption(fonts: OgFont[]) {
  return fonts.length ? { fonts } : {};
}

/**
 * マークダウン本文をカードに置ける1行のテキストにする。
 * 記号は読めるノイズにしかならないので落とし、長ければ文字数で切る。
 */
export function ogPlainText(markdown: string, maxLength: number): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

/**
 * カードの意匠のバージョン。?v= に混ぜる。
 *
 * SNSは一度取ったカードを長期間持ち続けるので、記事を直していない限り
 * URLが変わらず、意匠を作り直しても古い絵が出続ける。デザインを変えたら
 * ここを上げる。
 */
export const OG_CARD_VERSION = 1;

/**
 * Wikimedia が配るサムネイルの許可幅。
 *
 * 2025年に任意幅の生成が止められ、リストに無い幅を要求すると
 * HTTP 400「Use thumbnail sizes listed on https://w.wiki/GHai」が返る。
 * 800 も 1024 も 1200 も通らないので、ここから選ぶこと。
 */
const WIKIMEDIA_THUMB_WIDTHS = [250, 330, 500, 960, 1280, 1920] as const;

/**
 * upload.wikimedia.org の画像URLを、指定幅のサムネイルURLに書き換える。
 *
 * 原本をそのまま読むと 8133x5422 / 6.8MB といった写真が混ざり、カードを
 * 描くだけで数秒かかる。幅を決めて取れば数十KBで済む。
 *
 * 既に /thumb/ 形式のURL(幅つき)で入っている記事もあるので、その場合は
 * 末尾の幅だけを差し替える。Wikimedia 以外のURLはそのまま返す。
 */
export function wikimediaThumbUrl(url: string, width: number): string {
  if (!/^https:\/\/upload\.wikimedia\.org\//.test(url)) return url;

  const target =
    WIKIMEDIA_THUMB_WIDTHS.find((w) => w >= width) ??
    WIKIMEDIA_THUMB_WIDTHS[WIKIMEDIA_THUMB_WIDTHS.length - 1];

  // 既に /thumb/.../<n>px-<name> の形。幅の数字だけ差し替える。
  const thumb = url.match(/^(.*\/thumb\/.*\/)(\d+)px-([^/]+)$/);
  if (thumb) return `${thumb[1]}${target}px-${thumb[3]}`;

  // 原本 /commons/a/ab/<name>。/thumb/ を挟んで幅つきの子を足す。
  const original = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+\/)([0-9a-f]\/[0-9a-f]{2}\/)([^/]+)$/,
  );
  if (original) {
    return `${original[1]}thumb/${original[2]}${original[3]}/${target}px-${original[3]}`;
  }

  return url;
}

/**
 * カードに貼る写真を、こちらのサーバーから取ってきて data URI にする。
 *
 * satori に外部URLを渡して任せない理由が2つある。
 *
 * 1. 失敗したときに描画ごと落ちる。写真が取れなくてもカードは返したい。
 * 2. User-Agent を選べない。upload.wikimedia.org は facebookexternalhit を
 *    403 で拒否しており(「Unauthorized request. Please contact
 *    bot-traffic@wikimedia.org」)、記事の画像を og:image に直接書くと
 *    Facebook系では画像なしのカードになる。こちらのサーバーから
 *    自分の名前で取りに行けばこの遮断に当たらない——それがこのカードを
 *    自前で描いている最大の理由。
 *
 * Wikimedia は素性の分かる User-Agent を求めているので連絡先つきで名乗る。
 */
export type OgPhoto = {
  /** data URI。satori にはこの形でしか渡さない。 */
  src: string;
  /** 実寸。版面側が切り抜き位置を自分で計算するために要る。 */
  width: number;
  height: number;
};

/**
 * JPEG / PNG / GIF のバイト列から縦横を読む。読めなければ null。
 *
 * 縦横が分からないと objectFit:"cover" に任せるしかなく、satori は
 * objectPosition を持たないので切り抜きが必ず中央になる。人物の縦長写真では
 * それで頭が切れる(実際にウィリアム・ウィレットの回で切れていた)。
 * 版面側で位置を決められるように、ここで実寸を取る。
 *
 * WebP や AVIF は読まない。該当する記事が無く、読めなかったときは
 * 中央切り抜きに落ちるだけなので、対応形式を増やす価値が薄い。
 */
function imageSize(
  buffer: Buffer,
): { width: number; height: number } | null {
  // PNG: IHDR が固定位置にある。
  if (buffer.length > 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  // GIF: 論理画面記述子。リトルエンディアン。
  if (buffer.length > 10 && buffer.toString("ascii", 0, 3) === "GIF") {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  // JPEG: SOF マーカーまでセグメントを飛ばして読む。
  if (buffer.length > 4 && buffer.readUInt16BE(0) === 0xffd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      // SOF0〜SOF15。ただし DHT(C4) / JPG(C8) / DAC(CC) は寸法を持たない。
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }

  return null;
}

/**
 * カードに貼る写真を、こちらのサーバーから取ってきて data URI にする。
 *
 * satori に外部URLを渡して任せない理由が2つある。
 *
 * 1. 失敗したときに描画ごと落ちる。写真が取れなくてもカードは返したい。
 * 2. User-Agent を選べない。upload.wikimedia.org は facebookexternalhit を
 *    403 で拒否しており(「Unauthorized request. Please contact
 *    bot-traffic@wikimedia.org」)、記事の画像を og:image に直接書くと
 *    Facebook系では画像なしのカードになる。こちらのサーバーから
 *    自分の名前で取りに行けばこの遮断に当たらない——それがこのカードを
 *    自前で描いている最大の理由。
 *
 * Wikimedia は素性の分かる User-Agent を求めているので連絡先つきで名乗る。
 */
export async function loadOgPhoto(
  url: string | null | undefined,
  width: number,
): Promise<OgPhoto | null> {
  if (!url) return null;

  try {
    const res = await fetch(wikimediaThumbUrl(url, width), {
      headers: {
        "User-Agent":
          "just-rondon-og/1.0 (https://www.just-rondon.com; card renderer)",
      },
      // 画像が変わらない前提のURLなので長めに持つ。取得に数秒かかる日が
      // あってもカードの生成を待たせないための実質的な保険でもある。
      next: { revalidate: 60 * 60 * 24 * 30 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const type = res.headers.get("content-type") ?? "image/jpeg";
    if (!type.startsWith("image/")) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const size = imageSize(buffer);
    if (!size) return null;

    return {
      src: `data:${type};base64,${buffer.toString("base64")}`,
      ...size,
    };
  } catch {
    // 写真なしのカードに落とす。SNSカードが消えるより、絵柄が
    // グラデーションになるほうがはるかに軽い損失。
    return null;
  }
}

/**
 * 「見出し——副題」を2つに割る。
 *
 * このサイトの読み物の見出しは中央値52字あり、そのまま1つの塊で置くと
 * カードが3行の文字壁になる。ダッシュの前が「つかみ」、後ろが「何の話か」に
 * なっているので、前を大きく後ろを小さく組むと、同じ字数でも読める。
 *
 * ダッシュを持たない見出しは分けずに返す。
 */
export function splitOgHeadline(title: string): {
  head: string;
  tail: string | null;
} {
  const match = title.match(/^(.+?)\s*(?:——|―――|――|—|--)\s*(.+)$/);
  if (!match) return { head: title.trim(), tail: null };
  return { head: match[1].trim(), tail: match[2].trim() };
}

/**
 * コラム・「英国のいまを論じる」記事のOGカードURL。
 *
 * パスは app/og/<section>/[slug]/route.tsx と対で、片方だけ変えると
 * 共有カードが404になる(SNS側は失敗しても静かに既定画像へ戻るだけで
 * 気付けない)。
 *
 * ?v= には意匠のバージョンと記事の updatedAt を両方入れる。前者は
 * カードを作り直したとき、後者は本文を直したときに、SNSが持っている
 * 古いカードを外すためのもの。
 */
function readingArticleOgImage(
  section: "column" | "modern-britain",
  label: string,
  content: { slug: string; title: string; updatedAt: Date },
) {
  return {
    url:
      `/og/${section}/${encodeURIComponent(content.slug)}` +
      `?v=${OG_CARD_VERSION}-${content.updatedAt.getTime()}`,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt: `${content.title} | ${label}`,
  };
}

export function columnOgImage(content: {
  slug: string;
  title: string;
  updatedAt: Date;
}) {
  return readingArticleOgImage("column", "コラム", content);
}

export function modernBritainOgImage(content: {
  slug: string;
  title: string;
  updatedAt: Date;
}) {
  return readingArticleOgImage("modern-britain", "英国のいまを論じる", content);
}

/**
 * 「イギリス英語」記事のOGカードURL。
 * パスは app/og/british-english/[slug]/route.tsx と対で、片方だけ変えると
 * 共有カードが404になる(SNS側は失敗しても静かにロゴへ戻るだけで気付けない)。
 *
 * ?v= は本文を直したときにSNSのカードキャッシュを外すためのもの。
 * URLが同じままだと、X も Facebook も一度取ったカードを長期間持ち続ける。
 */
export function britishEnglishOgImage(content: {
  slug: string;
  title: string;
  engTitle: string | null;
  updatedAt: Date;
}) {
  return {
    url:
      `/og/british-english/${encodeURIComponent(content.slug)}` +
      `?v=${OG_CARD_VERSION}-${content.updatedAt.getTime()}`,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt: content.engTitle
      ? `${content.engTitle}（${content.title}）| イギリス英語`
      : `${content.title} | イギリス英語`,
  };
}
