import { SITE_NAME, SITE_URL } from "@/lib/seo";
import {
  ancestorCrumbs,
  crumbFor,
  crumbsJsonLd,
} from "@/components/navigation/tree";

/**
 * セクションを問わず使う構造化データのユーティリティ。
 *
 * 観光・ビザなど各セクション固有のスキーマ(TouristAttraction など)は
 * それぞれの jsonld.ts に置く。ここに入れてよいのは
 * 「どのセクションでも同じ形になるもの」だけ。
 */

export const SITE_PUBLISHER = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

/**
 * JSON-LD に markdown の記法をそのまま入れないための整形。
 *
 * Google のリッチリザルトは answer をプレーンテキストとして扱うため、
 * `**強調**` や `[label](url)` が残っていると記号がそのまま表示される。
 */
export function stripInlineMarkdown(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [label](url) → label
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold** → bold
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1") // *italic* → italic
    .replace(/`([^`]+)`/g, "$1") // `code` → code
    .replace(/^[\s・\-*]+/, "") // 行頭の箇条書き記号
    .replace(/\s+/g, " ")
    .trim();
}

export function faqPageJsonLd(
  items: { question: string; answer: string | string[] }[],
  pageUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: stripInlineMarkdown(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: (Array.isArray(item.answer) ? item.answer : [item.answer])
          .map(stripInlineMarkdown)
          .filter(Boolean)
          .join(" "),
      },
    })),
  };
}

/**
 * Home → (大区分) → セクション → 任意の下層、のパンくず。
 * trail にはセクションのトップより下の階層だけを渡す。
 *
 * 大区分は section.path から components/navigation/tree.ts が補う。
 * 呼び出し側が「英国を読む」のような上位階層を意識しなくてよく、
 * 画面のパンくず(<Breadcrumbs />)と同じ並びが構造化データにも出る。
 */
export function breadcrumbJsonLd(
  section: { name: string; path: string },
  trail: { name: string; path: string }[] = []
) {
  return crumbsJsonLd([
    { label: "Home", href: "/" },
    ...ancestorCrumbs(section.path),
    crumbFor(section),
    ...trail.map(crumbFor),
  ]);
}
