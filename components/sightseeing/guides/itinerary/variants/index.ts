import type { VariantSection } from "../blocks";
import type { VariantMeta } from "../VariantLayout";
import type { GuideFaqItem, GuideRelatedLink, GuideSourceLink } from "@/components/guides/types";
import * as rainyDay from "./rainy-day";
import * as withKids from "./with-kids";
import * as layover from "./layover";

export type Variant = {
  meta: VariantMeta;
  lead: string;
  sections: VariantSection[];
  faq: GuideFaqItem[];
  sources: GuideSourceLink[];
  relatedLinks: GuideRelatedLink[];
  attractionSlugs?: string[];
};

/**
 * 親からの相対 slug → 分岐版。
 * /sightseeing/itinerary/[slug] が引く。
 * itinerary-variants.ts の itineraryVariants と件数・slug を一致させること。
 */
export const variants: Record<string, Variant> = {
  "rainy-day": {
    meta: rainyDay.rainyDayMeta,
    lead: rainyDay.rainyDayLead,
    sections: rainyDay.rainyDaySections,
    faq: rainyDay.rainyDayFaq,
    sources: rainyDay.rainyDaySources,
    relatedLinks: rainyDay.rainyDayRelatedLinks,
    attractionSlugs: rainyDay.rainyDayAttractionSlugs,
  },
  "with-kids": {
    meta: withKids.withKidsMeta,
    lead: withKids.withKidsLead,
    sections: withKids.withKidsSections,
    faq: withKids.withKidsFaq,
    sources: withKids.withKidsSources,
    relatedLinks: withKids.withKidsRelatedLinks,
    attractionSlugs: withKids.withKidsAttractionSlugs,
  },
  layover: {
    meta: layover.layoverMeta,
    lead: layover.layoverLead,
    sections: layover.layoverSections,
    faq: layover.layoverFaq,
    sources: layover.layoverSources,
    relatedLinks: layover.layoverRelatedLinks,
    attractionSlugs: layover.layoverAttractionSlugs,
  },
};
