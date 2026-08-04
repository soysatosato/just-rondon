import { SITE_NAME, SITE_URL } from "@/lib/seo";

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
 * ホーム → セクション → (任意の下層) のパンくず。
 * trail にはセクションのトップより下の階層だけを渡す。
 */
export function breadcrumbJsonLd(
  section: { name: string; path: string },
  trail: { name: string; path: string }[] = []
) {
  const base = [
    { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: section.name,
      item: `${SITE_URL}${section.path}`,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      ...base,
      ...trail.map((t, i) => ({
        "@type": "ListItem",
        position: base.length + i + 1,
        name: t.name,
        item: `${SITE_URL}${t.path}`,
      })),
    ],
  };
}
