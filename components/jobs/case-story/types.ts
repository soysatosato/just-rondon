/** この記録は日英2言語で公開している。既定は日本語。 */
export type Locale = "ja" | "en";

export const LOCALES: Locale[] = ["ja", "en"];

export type CaseStorySection = {
  title: string;
  subtitle?: string;
  body: string;
};

export type CaseStoryArticle = {
  slug: string;
  title: string;
  /**
   * 日本語版では見出し下に添える英語タイトル。
   * 英語版では原題(日本語)が入る。どちらも「もう一方の言語での題」を指す。
   */
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  sections: CaseStorySection[];
};
