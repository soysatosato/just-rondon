export type MusicalGuideSection = {
  title: string;
  subtitle?: string;
  body: string;
};

export type MusicalGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  sections: MusicalGuideSection[];
};
