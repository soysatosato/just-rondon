import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";
import { buildPageMetadata } from "@/lib/seo";
import MuseumBanksy from "@/components/museums/MuseumBanksy";

export const metadata = buildPageMetadata({
  path: "/museums/banksy-artworks",
  title: "ロンドンのバンクシー作品まとめ | ジャスト・ロンドン",
  titleSuffix: false,
  description: "ロンドンで見られるバンクシーの代表的な作品を一覧形式(場所・マップ)でまとめました。作品の背景解説付きでストリートアート巡りや観光に役立つ情報を掲載。",
});

export default function BanksyLondonPage() {
  return (
    <>
      <div className="mb-6">
        <MuseumBreadCrumbs name="美術館ナビ" link2="" name2="バンクシー作品" />
      </div>
      <MuseumBanksy />;
    </>
  );
}
