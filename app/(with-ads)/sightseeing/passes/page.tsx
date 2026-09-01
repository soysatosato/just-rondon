// 対象施設の一覧を Attraction から引くので、静的のままだと
// 印を付け替えても再デプロイまで反映されない。DBを読む他の
// 観光ページ(/sightseeing、/sightseeing/all)と同じ1時間にそろえる。
export const revalidate = 60 * 60;

import PassesGuide from "@/components/sightseeing/guides/passes/PassesGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { passesMeta } from "@/components/sightseeing/guides/passes/content";

export const metadata = buildTravelGuideMetadata(passesMeta);

export default function Page() {
  return <PassesGuide />;
}
