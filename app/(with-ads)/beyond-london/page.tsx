import BeyondHub from "@/components/beyond-london/hub/BeyondHub";
import {
  HUB_DESCRIPTION,
  HUB_KEYWORDS,
  HUB_TITLE,
} from "@/components/beyond-london/hub/content";
import { BEYOND_BASE } from "@/components/beyond-london/destinations";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: BEYOND_BASE,
  title: HUB_TITLE,
  description: HUB_DESCRIPTION,
  keywords: HUB_KEYWORDS,
});

export default function Page() {
  return <BeyondHub />;
}
