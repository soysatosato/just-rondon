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
      `?v=${content.updatedAt.getTime()}`,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt: content.engTitle
      ? `${content.engTitle}（${content.title}）| イギリス英語`
      : `${content.title} | イギリス英語`,
  };
}
