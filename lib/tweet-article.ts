import { SITE_URL } from "@/lib/seo";

/**
 * ツイート下書きと、本文に貼った自サイトの記事のつながり。
 *
 * 記事を書くスキル(/add-column など)は、記事を下書きに入れるのと同時に、
 * その記事の URL を貼った「王道の要約」のツイートを /tweets に登録する。
 * 記事が公開される前に投稿するとリンク先が404になるので、/tweets は本文の
 * URL から記事を引いて公開待ちを分けて出し、管理ページでボツにした記事の
 * ツイートは一緒に不採用にする。
 *
 * つながりを列で持たず本文の URL から引くのは、404になるかどうかを決めるのが
 * まさにその URL だから。列を足す前に登録した下書きにもそのまま効く。
 */

/** 承認してから公開する記事。読み物の3セクションと「今月変わったロンドン」。 */
export type ArticleRef =
  | { kind: "content"; category: string; slug: string }
  | { kind: "changes"; slug: string };

const ARTICLE_URL = new RegExp(
  `${SITE_URL.replace(/[.]/g, "\\.")}/(column|british-english|modern-britain|changes)/([a-z0-9-]+)(?![a-z0-9-])`,
  "g",
);

export function articleUrl(category: string, slug: string): string {
  return `${SITE_URL}/${category}/${slug}`;
}

/** 本文に貼られた、承認待ちになり得る記事。 */
export function articleRefsIn(body: string): ArticleRef[] {
  return Array.from(body.matchAll(ARTICLE_URL), ([, section, slug]) =>
    section === "changes"
      ? { kind: "changes", slug }
      : { kind: "content", category: section, slug },
  );
}

/** 本文がその記事を指しているか。`/easy-peelers` で `/easy-peelers-2` を拾わない。 */
export function mentionsArticle(body: string, category: string, slug: string): boolean {
  return articleRefsIn(body).some(
    (ref) =>
      (ref.kind === "content" ? ref.category : "changes") === category &&
      ref.slug === slug,
  );
}
