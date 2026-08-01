import GuideLayout from "@/components/musicals/guides/GuideLayout";
import { buildMetadata } from "@/components/musicals/guides/guides";
import westEndTickets from "@/components/musicals/guides/content/west-end-tickets";

export const metadata = buildMetadata(westEndTickets);

export default function Page() {
  return <GuideLayout article={westEndTickets} />;
}
