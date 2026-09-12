// app/(with-ads)/jobs/service-charges/dashboard/[id]/page.tsx
//
// 旧・店舗詳細のURL(placeId 直打ち)。中身は
// /jobs/service-charges/stores/<slug> に移した。
//
// 消さずに転送にしてあるのは、回答が届いたときの管理者宛メールが
// このURLで送られており、過去のメールからも開けるようにするため。
// 新しいメールの本文も store のURLを載せている。
export const dynamic = "force-dynamic";

import { notFound, permanentRedirect } from "next/navigation";
import { fetchServiceChargesByPlaceId } from "@/utils/actions/jobs";
import { storePath, storeSlug } from "@/lib/jobs/store-slug";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("サービスチャージ実態調査 店舗詳細");

type Props = {
  params: {
    id: string; // placeId
  };
};

export default async function DashboardDetailRedirect({ params }: Props) {
  const records = await fetchServiceChargesByPlaceId(params.id);
  if (records.length === 0) notFound();

  permanentRedirect(storePath(storeSlug(records[0])));
}
