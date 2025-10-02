import LoadingCards from "@/components/card/LoadingCards";
import Pagination from "@/components/home/Pagination";
import RainCanvas from "@/components/home/RainParticles";
import MusicalHomePage from "@/components/musicals/MusicalHomePage";
import { fetchMusicals } from "@/utils/actions/musicals";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "ロンドン観光・ミュージカル・劇場・シアターガイド | ロンドん!",
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
    title: "ロンドン観光・ミュージカル・劇場・シアターガイド | ロンドん!",
    description:
      "初めてのロンドン観光でも安心！主要ミュージカルの見どころや必見作品、あらすじやストーリー、便利なアクセス方法をわかりやすく紹介する、観光客向けガイドサイトです。",
    siteName: "ロンドん!",
  },
};
export default async function HomePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 10;

  const { musicals, total } = await fetchMusicals({
    page: currentPage,
    limit: itemsPerPage,
  });
  if (!musicals) redirect("/");
  return (
    <>
      <section>
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <RainCanvas />
        </div>
        <Suspense fallback={<LoadingCards />}>
          <MusicalHomePage
            musicals={musicals}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
          <div className="flex justify-center my-6">
            <Pagination
              currentPage={currentPage}
              totalItems={total}
              itemsPerPage={itemsPerPage}
              baseUrl="/musicals"
            />
          </div>
        </Suspense>
      </section>
    </>
  );
}
