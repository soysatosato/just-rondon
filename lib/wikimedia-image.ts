/**
 * Wikimedia の画像を表示サイズに合わせて配るための部品。
 *
 * サイトの写真の大半は upload.wikimedia.org への直リンクで、1280px の
 * サムネイル(377枚)か原本(62枚、最大で数千px)が入っている。
 * next.config.mjs の images.unoptimized(2026-08 に Vercel の画像最適化の
 * 枠を使い切った一時措置)のせいで、80px のサムネイル枠にも 230KB の
 * 1280px 画像を、スポットのヒーローには 611KB の原本をそのまま配っていた。
 * 低速回線(Slow 4G・CPU4倍)でトップの最大要素の表示に14.6秒かかっていた。
 *
 * Wikimedia は自前で各幅のサムネイルを配っているので、それを使う。
 * こちらの課金は発生しない。
 *
 *   - <img> には responsiveImage() の src / srcSet / sizes を渡す。
 *   - next/image は lib/image-loader.ts がこのファイルを使って幅ごとのURLを作る。
 */

/**
 * Wikimedia が配るサムネイルの許可幅。
 *
 * 2025年に任意幅の生成が止められ、リストに無い幅を要求すると
 * HTTP 400「Use thumbnail sizes listed on https://w.wiki/GHai」が返る。
 * 640 も 800 も 1024 も通らないので、ここから選ぶこと。
 * 原本より大きい幅を要求したときは 400 にならず、拡大した画像が返る
 * (2026-10-18 に 250px の原本で 500px を要求して確認)。
 */
export const WIKIMEDIA_THUMB_WIDTHS = [120, 250, 330, 500, 960, 1280, 1920] as const;

/** srcset に並べる幅。1920 は 1280 を超える画面がほぼ無いので並べない。 */
const SRCSET_WIDTHS = [120, 250, 330, 500, 960, 1280] as const;

/**
 * 原本URLから作るサムネイルの上限。原本の実寸はURLから分からないので、
 * 小さい原本(62枚中28枚が960px未満)を大きく拡大しすぎないよう抑える。
 */
const ORIGINAL_MAX_WIDTH = 1280;

const HOST = "https://upload.wikimedia.org/";

type ParsedWikimedia = {
  /** 幅を差し込めばサムネイルURLになる関数。 */
  at: (width: number) => string;
  /** 元のURLが表す最大の幅。サムネイルならその幅、原本なら上限。 */
  maxWidth: number;
  /** 元のURL自体がその幅のサムネイルか。 */
  isThumb: boolean;
};

function parse(url: string): ParsedWikimedia | null {
  if (!url.startsWith(HOST)) return null;

  // 既に /thumb/.../<n>px-<name> の形。幅の数字だけ差し替える。末尾の名前は
  // そのまま使う(長いファイル名では Wikimedia が別名を付けるため組み立て直さない)。
  const thumb = url.match(/^(.*\/thumb\/.*\/)(\d+)px-([^/]+)$/);
  if (thumb) {
    return {
      at: (width) => `${thumb[1]}${width}px-${thumb[3]}`,
      maxWidth: Number(thumb[2]),
      isThumb: true,
    };
  }

  // 原本 /commons/a/ab/<name>。/thumb/ を挟んで幅つきの子を足す。
  // サムネイル名が素直に作れるのは写真の形式だけ(SVG や TIFF は拡張子が変わる)。
  const original = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+\/)([0-9a-f]\/[0-9a-f]{2}\/)([^/]+\.(?:jpe?g|png|webp))$/i,
  );
  if (original) {
    return {
      at: (width) =>
        `${original[1]}thumb/${original[2]}${original[3]}/${width}px-${original[3]}`,
      maxWidth: ORIGINAL_MAX_WIDTH,
      isThumb: false,
    };
  }

  return null;
}

/** 幅を変えられる Wikimedia の画像か。next/image の unoptimized の判定に使う。 */
export function isResizableImage(url: string | null | undefined): boolean {
  return !!url && parse(url) !== null;
}

/**
 * upload.wikimedia.org の画像URLを、指定幅以上で最も小さい許可幅の
 * サムネイルURLに書き換える。Wikimedia 以外のURLはそのまま返す。
 *
 * OGカードの描画(lib/og.ts)もこれを使う。
 */
export function wikimediaThumbUrl(url: string, width: number): string {
  const parsed = parse(url);
  if (!parsed) return url;

  const target =
    WIKIMEDIA_THUMB_WIDTHS.find((w) => w >= width) ??
    WIKIMEDIA_THUMB_WIDTHS[WIKIMEDIA_THUMB_WIDTHS.length - 1];
  return parsed.at(target);
}

/**
 * next/image のローダー用。要求された幅以上で最も小さい候補を返すが、
 * 元のURLが表す幅(1280px のサムネイルなら 1280)を上限にする。
 *
 * wikimediaThumbUrl と違って 1920 まで上げない。next/image は高解像度の
 * PC 画面で 2048〜3840 を要求するので、上限を設けないと、これまで 1280px で
 * 配っていたヒーローがかえって重くなる。
 */
export function resizedImageUrl(url: string, width: number): string {
  const parsed = parse(url);
  if (!parsed) return url;

  const target = SRCSET_WIDTHS.find((w) => w >= width);
  if (target === undefined || target >= parsed.maxWidth) {
    return parsed.isThumb ? url : parsed.at(parsed.maxWidth);
  }
  return parsed.at(target);
}

/**
 * <img> に渡す属性。
 *
 *   <img {...responsiveImage(spot.image, "80px")} alt="" />
 *
 * sizes は「画面上でその画像が何px幅で出るか」。これを渡さないと
 * ブラウザは画面幅いっぱいとみなし、小さな枠にも大きな画像を選ぶ。
 * 繰り返し出る組み方は IMAGE_SIZES に置いてある。
 *
 * Wikimedia 以外(Supabase のポスターなど)は src だけを返す。
 */
export function responsiveImage(
  url: string,
  sizes: string,
): { src: string; srcSet?: string; sizes?: string } {
  const parsed = parse(url);
  if (!parsed) return { src: url };

  const widths: number[] = SRCSET_WIDTHS.filter((w) => w < parsed.maxWidth);
  // 元のURLの幅(既に配られて実在が分かっているサムネイル)を最大の候補にする。
  // 原本は上限の幅で作る。
  const top = parsed.isThumb ? url : parsed.at(parsed.maxWidth);
  const srcSet = [
    ...widths.map((w) => `${parsed.at(w)} ${w}w`),
    `${top} ${parsed.maxWidth}w`,
  ].join(", ");

  // src を最後に置く。React は属性を並び順に付けるので、src が先に付くと
  // ブラウザによっては srcset を見る前に src を取りに行き、二重に読む。
  return { srcSet, sizes, src: top };
}

/**
 * よく出る組み方の sizes。入れ物の最大幅に合わせてある。
 * 固定幅の枠(サムネイル)は "80px" のように直接書く。
 */
export const IMAGE_SIZES = {
  /** 1列 → 2列(sm) → 3列(lg)のカード。入れ物は max-w-6xl 前後。 */
  grid3: "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw",
  /** 1列 → 2列(sm か md)のカード。 */
  grid2: "(min-width: 1200px) 580px, (min-width: 640px) 50vw, 100vw",
  /** 本文の列(max-w-3xl)いっぱいの写真。 */
  article: "(min-width: 800px) 768px, 100vw",
  /** ページの入れ物(max-w-5xl〜6xl)いっぱいの写真。 */
  wide: "(min-width: 1200px) 1152px, 100vw",
} as const;
