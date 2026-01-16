import LoadingCards from "@/components/card/LoadingCards";
import MuseumsContainer from "@/components/home/MuseumsContainer";
import RainCanvas from "@/components/home/RainParticles";
import { Metadata } from "next";
import { Suspense } from "react";

type HomePageProps = {
  searchParams?: {
    search?: string;
  };
};
export const metadata: Metadata = {
  title: "ジャスト・ロンドン | ロンドン観光・美術館・展覧会ガイド",
  description:
    "初めてのロンドン観光でも安心！主要美術館の見どころや必見作品、展覧会情報、便利なアクセス方法をわかりやすく紹介する、観光客向けアートガイドサイトです。",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/museums",
  },
};
export default function HomePage({ searchParams }: HomePageProps) {
  const { search } = searchParams ?? {};
  if (search === "asdasdasdaaaaaaaaaaaaaaa") return null;
  return (
    <>
      <section>
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <RainCanvas />
        </div>
        <Suspense fallback={<LoadingCards />}>
          <MuseumsContainer />
        </Suspense>
      </section>
    </>
  );
}
