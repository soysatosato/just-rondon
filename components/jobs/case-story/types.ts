export type CaseStorySection = {
  title: string;
  subtitle?: string;
  body: string;
};

export type CaseStoryArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  sections: CaseStorySection[];
};
