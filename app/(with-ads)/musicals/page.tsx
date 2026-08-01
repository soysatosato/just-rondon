import LoadingCards from "@/components/card/LoadingCards";
import MusicalHomePage from "@/components/musicals/MusicalHomePage";
import { fetchAllMusicals } from "@/utils/actions/musicals";
import { collectionPageJsonLd } from "@/components/musicals/jsonld";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title:
    "ロンドン観光・ミュージカル・劇場・シアターガイド | ジャスト・ロンドン",
  description:
    "初めてのロンドン観光でも安心！主要ミュージカルの見どころや必見作品、あらすじやストーリー、便利なアクセス方法をわかりやすく紹介する、観光客向けガイドサイトです。",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/musicals",
  },
  openGraph: {
    type: "website",
    url: "https://www.just-rondon.com/musicals",
    title:
      "ロンドン観光・ミュージカル・劇場・シアターガイド | ジャスト・ロンドン",
    description:
      "初めてのロンドン観光でも安心！主要ミュージカルの見どころや必見作品、あらすじやストーリー、便利なアクセス方法をわかりやすく紹介する、観光客向けガイドサイトです。",
    siteName: "ジャスト・ロンドン",
  },
};
export default async function HomePage() {
  const musicals = await fetchAllMusicals();
  if (musicals.length === 0) redirect("/");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd(musicals)),
        }}
      />
      <section>
        <Suspense fallback={<LoadingCards />}>
          <MusicalHomePage musicals={musicals} />
        </Suspense>
      </section>
    </>
  );
}
