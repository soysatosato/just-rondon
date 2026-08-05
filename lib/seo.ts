import type { Metadata } from "next";

/**
 * サイトのオリジン。環境変数にはしない。
 *
 * 本番オリジンは1つしかなく(next.config.mjs の apex→www リダイレクトで強制済み)、
 * 環境変数にすると Vercel 側で未設定・スペルミスがあった場合に
 * 全ページの canonical が「ビルドエラー無しで」壊れる。
 * これは実際に過去 /attractions/ の取り違えで起きた失敗と同じクラスの事故なので、
 * git 管理・型チェック・grep 可能なリテラルで持つ。
 */
export const SITE_URL = "https://www.just-rondon.com";
export const SITE_NAME = "ジャスト・ロンドン";
export const TWITTER_HANDLE = "@just_rondon";

/**
 * OG画像のデフォルト。1200x630 の og/default.png を用意したら差し替える。
 * SVG は Facebook / X / LINE / Slack のいずれもレンダリングできないため、
 * og:image / twitter:image に logo.svg を使ってはいけない(favicon 用途では可)。
 */
export const DEFAULT_OG_IMAGE = "/logo.png";

/** サイト内パス(先頭スラッシュ)を絶対URLにする。 */
export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) return `${SITE_URL}/${path}`;
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/** 画像URLを絶対化する。Supabase等の外部URLはそのまま通す。 */
export function absoluteImage(url: string): string {
  return /^https?:\/\//.test(url) ? url : absoluteUrl(url);
}

/**
 * 検索結果に出したくないユーティリティページ用の metadata。
 *
 * robots.txt の Disallow だけでは足りない。クロールを止めると Google は
 * ページ内の noindex を読めず、外部リンクがあれば URL だけがインデックスされる
 * (「robots.txt によりブロックされましたが登録されました」)。
 * noindex を効かせたいページは robots.txt 側の Disallow から外し、
 * こちらで宣言すること。
 *
 * canonical と OG は意図的に付けない。インデックスさせないページに
 * 正規URLを宣言する意味がなく、SNS カードも不要なため。
 */
export function noindexMetadata(title: string): Metadata {
  return {
    title: `${title} | ${SITE_NAME}`,
    robots: { index: false, follow: true },
  };
}

export type OgImageInput =
  | string
  | { url: string; width?: number; height?: number; alt?: string };

export type PageMetadataInput = {
  /**
   * 実ルートのパス(先頭スラッシュ)。canonical / og:url をここから導出する。
   * canonical を直接受け取らないのは、実URLと別の値を書ける余地を無くすため。
   */
  path: string;
  title: string;
  description: string;
  keywords?: string | string[];
  images?: OgImageInput[];
  type?: "website" | "article";
  /** true で noindex。follow は残すのでリンク先のクロールは続く。 */
  noindex?: boolean;
  siteName?: string;
  /** false でタイトルにサイト名サフィックスを付けない(トップページ用)。 */
  titleSuffix?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  /** ページ本文の言語。og:locale と html の lang 相当。既定は日本語。 */
  locale?: "ja" | "en";
  /**
   * hreflang 用の対訳ページ。{ ja: "/foo", en: "/en/foo" } の形で渡す。
   * 相互に指し合っていないと Google は代替として扱わないので、
   * 対訳を持つページでは「自分自身を含めて」全言語分を渡すこと。
   */
  languages?: Partial<Record<"ja" | "en", string>>;
};

const OG_LOCALES: Record<"ja" | "en", string> = {
  ja: "ja_JP",
  en: "en_GB",
};

function normaliseImage(image: OgImageInput) {
  if (typeof image === "string") {
    return { url: absoluteImage(image) };
  }
  return {
    url: absoluteImage(image.url),
    ...(image.width ? { width: image.width } : {}),
    ...(image.height ? { height: image.height } : {}),
    ...(image.alt ? { alt: image.alt } : {}),
  };
}

/**
 * ページ metadata の単一の組み立て口。
 * canonical・og:url・OG画像・Twitterカードを path から一貫して導出する。
 */
export function buildPageMetadata({
  path,
  title,
  description,
  keywords,
  images,
  type = "website",
  noindex = false,
  siteName = SITE_NAME,
  titleSuffix = true,
  publishedTime,
  modifiedTime,
  locale = "ja",
  languages,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  // x-default は日本語版を指す。サイトの既定言語であり、全ページ揃っているのはこちらだけ。
  const hreflang = languages
    ? Object.fromEntries([
        ...Object.entries(languages).map(([lang, p]) => [lang, absoluteUrl(p)]),
        ...(languages.ja ? [["x-default", absoluteUrl(languages.ja)]] : []),
      ])
    : undefined;
  const ogImages = (
    images?.length
      ? images
      : [
          {
            url: DEFAULT_OG_IMAGE,
            width: 1200,
            height: 630,
            alt: SITE_NAME,
          },
        ]
  ).map(normaliseImage);

  return {
    title: titleSuffix ? `${title} | ${SITE_NAME}` : title,
    description,
    ...(keywords ? { keywords } : {}),
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    alternates: {
      canonical: url,
      ...(hreflang ? { languages: hreflang } : {}),
    },
    openGraph: {
      type,
      title,
      description,
      url,
      siteName,
      locale: OG_LOCALES[locale],
      images: ogImages,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((i) => i.url),
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
  };
}
