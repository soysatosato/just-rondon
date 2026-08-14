import type { SocialGuideArticle } from "../types";
import howBritsMakeFriends from "./how-brits-make-friends";

/**
 * slug → 記事。
 *
 * guides.ts の socialGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 *
 * 執筆中: 全9本のうち1本。残り8本は guides.ts のリストに
 * メタ情報だけある状態なので、ハブのカードから未執筆ページへの
 * リンクが出ないよう、ハブ側は socialGuideArticles の有無で絞ること。
 */
export const socialGuideArticles: Record<string, SocialGuideArticle> = {
  "how-brits-make-friends": howBritsMakeFriends,
};

export { howBritsMakeFriends };
