import type { GuideRelatedLink } from "@/components/guides/types";

export type JobGuideSection = {
  title: string;
  subtitle?: string;
  body: string;
};

export type JobGuideRelatedLink = GuideRelatedLink;

export type JobGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  sections: JobGuideSection[];
  /** 情報の基準時点。lib/jobs/rates.ts の JOBS_AS_OF を使う。 */
  dataAsOf: string;
  /** ISO日付。lib/jobs/rates.ts の JOBS_UPDATED_AT を使う。 */
  updatedAt: string;
  /**
   * 記事末尾の「関連ページ」。区分をまたぐ導線はここに置く。
   * /jobs 内の他ガイドは relatedGuides が自動で全件並べるので、
   * ここに書くのは他セクション(/visa /housing /money など)と
   * /jobs 配下の子ページに限る。
   */
  relatedLinks?: JobGuideRelatedLink[];
};
