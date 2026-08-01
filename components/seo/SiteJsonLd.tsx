import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import JsonLd from "./JsonLd";

/**
 * サイト全体の Organization / WebSite スキーマ。ルートレイアウトで1回だけ描画する。
 *
 * potentialAction: SearchAction は入れていない。サイト内検索は /museums?search= の
 * 美術館限定しか無く、存在しないサイト全体検索をGoogleに申告することになるため。
 * 本物の /search を作ったら追加する。
 */
export default function SiteJsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "Just Rondon",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      // ラスタ画像である必要がある(SVGは不可)
      url: absoluteUrl("/logo.png"),
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "ja",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return <JsonLd data={[organization, website]} />;
}
