import { wikimediaThumbUrl } from "./wikimedia-image";

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

// サムネイルURLの組み立ては <img> の srcset と共通にしたので lib/wikimedia-image.ts に移した。
// /ig など既存の呼び出し側のために、ここからも引けるようにしておく。
export { wikimediaThumbUrl };

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
 * 写真を箱いっぱいに敷くときの寸法と位置。objectFit:"cover" の代わり。
 *
 * satori は objectPosition を持たず、cover の切り抜きは必ず中央になる。
 * 箱より縦長の写真では上下が等しく削られ、人物写真の頭が消えるので、
 * 縦方向だけ寄せる位置(0=上端、0.5=中央)を自分で決める。横方向は中央でよい
 * (横長の写真は高さで合わせ、左右が均等に余るだけ)。
 */
export function photoCoverRect(
  photo: { width: number; height: number },
  box: { width: number; height: number },
  verticalFocus: number,
) {
  const scale = Math.max(box.width / photo.width, box.height / photo.height);
  const width = Math.ceil(photo.width * scale);
  const height = Math.ceil(photo.height * scale);

  return {
    width,
    height,
    left: Math.round((box.width - width) / 2),
    top: Math.round((box.height - height) * verticalFocus),
  };
}

/**
 * 文字を載せない、写真だけの画像の寸法。
 *
 * 共有カード(OG_SIZE)は見出しの文字が主役で、写真は左の帯にしか入らない。
 * SNS ではそれが読みやすいが、Google は Discover と検索結果の画像に
 * 「ロゴや文字の多い画像を避け、幅1200px以上・16:9の、ページを代表する画像」を
 * 求めている(developers.google.com/search/docs/appearance/google-discover)。
 * 写真のある記事では og:image と JSON-LD の image をこちらにする。
 *
 * 3つの比は Article の構造化データで Google が並べるよう勧めているもの。
 * og:image に使うのは 16x9 だけ。
 */
export const OG_PHOTO_SIZES = {
  "16x9": { width: 1200, height: 675 },
  "4x3": { width: 1200, height: 900 },
  "1x1": { width: 1200, height: 1200 },
} as const;

export type OgPhotoRatio = keyof typeof OG_PHOTO_SIZES;

export const OG_PHOTO_RATIOS = Object.keys(OG_PHOTO_SIZES) as OgPhotoRatio[];

export function isOgPhotoRatio(value: string | null): value is OgPhotoRatio {
  return value !== null && value in OG_PHOTO_SIZES;
}

/** 写真だけの画像を出す読み物。 */
export type ReadingPhotoKind =
  | "column"
  | "british-english"
  | "modern-britain"
  | "areas";

/**
 * 写真だけの画像を出すページの種類。app/og/photo/[kind]/[slug]/route.tsx と対。
 *
 *   読み物       記事の写真(Content.image)
 *   events-week  週次の号の写真(WeeklyBrief.image)
 *   changes      月次の号の写真(MonthlyChangeIssue.image)
 *   events       「◯月のロンドン」と年中行事ガイドの写真(コードの photo)
 */
export type OgPhotoKind = ReadingPhotoKind | "events-week" | "changes" | "events";

/**
 * 写真だけの画像のURL。写真のあるページにだけ使う。
 *
 * 写真は Wikimedia Commons にあるが、そのURLを直接 og:image に書かない理由は
 * loadOgPhoto に書いたとおり(Facebook 系の遮断、縦横比・大きさのばらつき)。
 * こちらのドメインから、決まった比に切り抜いた PNG を配る。
 *
 * version は ?v= に入れる値。写真を替えたときに URL が変わるものを渡す
 * (DB の行なら updatedAt、コードの写真なら photoVersion(url))。SNS も
 * Google も、同じ URL の画像は取り直さない。
 */
export function photoOgImage(
  kind: OgPhotoKind,
  page: { slug: string; alt: string; version: string },
  ratio: OgPhotoRatio = "16x9",
) {
  const size = OG_PHOTO_SIZES[ratio];
  return {
    url:
      `/og/photo/${kind}/${encodeURIComponent(page.slug)}` +
      `?r=${ratio}&v=${OG_CARD_VERSION}-${page.version}`,
    width: size.width,
    height: size.height,
    alt: page.alt,
  };
}

/** 読み物の、写真だけの画像のURL。写真(content.image)のある記事にだけ使う。 */
export function readingPhotoOgImage(
  kind: ReadingPhotoKind,
  content: { slug: string; title: string; updatedAt: Date },
  ratio: OgPhotoRatio = "16x9",
) {
  return photoOgImage(
    kind,
    {
      slug: content.slug,
      alt: content.title,
      version: String(content.updatedAt.getTime()),
    },
    ratio,
  );
}

/**
 * コードに書いた写真の ?v=。写真の URL から作るので、写真を替えたときだけ変わる。
 * (FNV-1a。衝突しても古い画像が残るだけで、壊れはしない)
 */
export function photoVersion(url: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < url.length; i++) {
    hash ^= url.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
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
 * コラム・「ロンドンの街」記事のOGカードURL。
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
  section: "column" | "areas" | "modern-britain",
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

export function areaOgImage(content: {
  slug: string;
  title: string;
  updatedAt: Date;
}) {
  return readingArticleOgImage("areas", "ロンドンの街", content);
}

/** 号の週を "10/12–10/18" の形にする。週の境界はUTC 0時で持っている。 */
export function weeklyOgRange(weekStart: Date, weekEnd: Date): string {
  const md = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `${md(weekStart)}–${md(weekEnd)}`;
}

/**
 * 見出し(つかみ)の上限。OgCard が3行に収める字数で、これを超える1文目だけ
 * 読点で割る。低くすると「〜が開幕し」のような連用形の切れ端が見出しに残る。
 */
const WEEKLY_HEAD_MAX = 44;
/** 続きの上限。OgCard の tail が3行に収まる字数。 */
const WEEKLY_TAIL_MAX = 54;

/**
 * 週次ダイジェストの headline をカードの「つかみ」と「続き」に割る。
 *
 * headline は「目玉の1文。ほかの催しの1文。」の形で書いている
 * (add-weekly-brief スキルの指示)。コラムの見出しのようなダッシュが無いので、
 * 句点で割る。1文目が長すぎるときは読点で割り、残りを続きに回す。
 *
 * 続きは文の途中で切らず、収まる文だけを並べる。1文も収まらないときは
 * 収まる範囲の最後の読点で切る。
 */
export function splitWeeklyHeadline(headline: string): {
  head: string;
  tail: string | null;
} {
  const text = headline.trim();
  const firstEnd = text.indexOf("。");
  let head = firstEnd === -1 ? text : text.slice(0, firstEnd);
  let rest = firstEnd === -1 ? "" : text.slice(firstEnd + 1);

  if (head.length > WEEKLY_HEAD_MAX) {
    const comma = head.lastIndexOf("、", WEEKLY_HEAD_MAX);
    // 読点が頭に寄りすぎていると、つかみが「〜は、」のような切れ端になる。
    if (comma >= 12) {
      rest = `${head.slice(comma + 1)}。${rest}`;
      head = head.slice(0, comma);
    }
  }

  const sentences = rest
    .split("。")
    .map((s) => s.trim())
    .filter(Boolean);
  let tail = "";
  for (const s of sentences) {
    const next = tail ? `${tail}。${s}` : s;
    if (next.length > WEEKLY_TAIL_MAX) break;
    tail = next;
  }
  if (!tail && sentences.length > 0) {
    // 語の途中で切ると「ロバート・ライマ…」のように固有名詞が欠ける。
    // 収まる範囲の最後の読点で切り、読点が無いときだけ字数で切る。
    const first = sentences[0];
    const comma = first.lastIndexOf("、", WEEKLY_TAIL_MAX);
    tail = `${comma >= 20 ? first.slice(0, comma) : first.slice(0, WEEKLY_TAIL_MAX)}…`;
  }

  return {
    head: head.length > WEEKLY_HEAD_MAX ? `${head.slice(0, WEEKLY_HEAD_MAX)}…` : head,
    tail: tail || null,
  };
}

/**
 * 「今週のロンドン」各号のOGカードURL。
 * パスは app/og/events-week/[slug]/route.tsx と対。片方だけ変えると
 * 共有カードが404になる(SNS側は静かに既定画像へ戻るだけで気付けない)。
 *
 * 号は公開後も項目を足したり headline を直したりするので、?v= に
 * updatedAt を入れる。直した号を共有し直せば新しいカードが取られる。
 */
export function weeklyOgImage(brief: {
  slug: string;
  title: string;
  updatedAt: Date;
}) {
  return {
    url:
      `/og/events-week/${encodeURIComponent(brief.slug)}` +
      `?v=${OG_CARD_VERSION}-${brief.updatedAt.getTime()}`,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt: `${brief.title} | ジャスト・ロンドン`,
  };
}

/**
 * 写真のある号の、写真だけの画像のURL(週次・月次で共通)。
 *
 * og:image と JSON-LD の image に使い、見出しを組んだ号のカード
 * (weeklyOgImage / changesOgImage)は X の twitter:image にだけ残す。
 * 理由は photoOgImage を参照。号を直すと updatedAt が変わり、画像も取り直される。
 */
export function issuePhotoOgImage(
  kind: "events-week" | "changes",
  issue: { slug: string; title: string; imageAlt: string | null; updatedAt: Date },
  ratio: OgPhotoRatio = "16x9",
) {
  return photoOgImage(
    kind,
    {
      slug: issue.slug,
      alt: issue.imageAlt ?? issue.title,
      version: String(issue.updatedAt.getTime()),
    },
    ratio,
  );
}

/**
 * 「今月変わったロンドン」各号のOGカードURL。
 * パスは app/og/changes/[slug]/route.tsx と対。週次と同じく、号を直したら
 * 新しいカードが取られるよう ?v= に updatedAt を入れる。
 */
export function changesOgImage(issue: {
  slug: string;
  title: string;
  updatedAt: Date;
}) {
  return {
    url:
      `/og/changes/${encodeURIComponent(issue.slug)}` +
      `?v=${OG_CARD_VERSION}-${issue.updatedAt.getTime()}`,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt: `${issue.title} | ジャスト・ロンドン`,
  };
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
