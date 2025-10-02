import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";
import MuseumListClient from "@/components/museums/MuseumListClient";
import { fetchMuseumsStep10 } from "@/utils/actions/museums";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ロンドン美術館一覧 | 観光・美術館・展覧会ガイド",
  description:
    "初めてのロンドン観光でも安心！主要美術館の見どころや必見作品、展覧会情報、便利なアクセス方法をわかりやすく紹介する、観光客向けアートガイドサイトです。",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/museums/all-museums",
  },
};

export default async function AllMuseumsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || "1", 10);
  const limit = 10;
  const { museums, total } = await fetchMuseumsStep10({ page, limit });

  return (
    <div className="px-6">
      <div className="mb-6">
        <MuseumBreadCrumbs
          name="美術館ナビ"
          link2="/museums"
          name2="ミュージアム一覧"
        />
      </div>
      <h1 className="text-lg md:text-2xl font-bold mb-4">
        ロンドンのミュージアム一覧
      </h1>
      <MuseumListClient
        initialMuseums={museums}
        total={total}
        currentPage={page}
        itemsPerPage={limit}
      />
    </div>
  );
}
