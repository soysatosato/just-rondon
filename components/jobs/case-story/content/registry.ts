import "server-only";

import * as ja from "./index";
import * as en from "./en/index";
import type { CaseStoryArticle, Locale } from "../types";

/**
 * slug から章の本文を引く。/api/case-story が会員に続きを渡すときに使う。
 * 本文はここからサーバーの外へ、ログインを確かめたあとでだけ出る。
 */
export function findArticle(
  slug: string,
  locale: Locale,
): CaseStoryArticle | undefined {
  const list: CaseStoryArticle[] = Object.values(locale === "en" ? en : ja);
  return list.find((a) => a.slug === slug);
}
