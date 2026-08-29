import EtaGuide from "@/components/sightseeing/guides/eta/EtaGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { etaMeta } from "@/components/sightseeing/guides/eta/content";

export const metadata = buildTravelGuideMetadata(etaMeta);

export default function Page() {
  return <EtaGuide />;
}
