import BudgetGuide from "@/components/sightseeing/guides/budget/BudgetGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { budgetMeta } from "@/components/sightseeing/guides/budget/content";

export const metadata = buildTravelGuideMetadata(budgetMeta);

export default function Page() {
  return <BudgetGuide />;
}
