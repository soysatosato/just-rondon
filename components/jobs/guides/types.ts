export type JobGuideSection = {
  title: string;
  subtitle?: string;
  body: string;
};

export type JobGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  sections: JobGuideSection[];
};
