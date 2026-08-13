import TravelGuideLayout from "@/components/sightseeing/guides/TravelGuideLayout";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import tippingAndPayment from "@/components/sightseeing/guides/content/tipping-and-payment";

export const metadata = buildTravelGuideMetadata(tippingAndPayment);

export default function Page() {
  return <TravelGuideLayout article={tippingAndPayment} />;
}
