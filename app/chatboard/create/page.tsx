import CreatePostForm from "@/components/chatboard/CreatePostForm";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "掲示板投稿 | 雑談・コミュニティ・サークル・出会い・話題まとめ",
  description:
    "旅行、カフェ巡り、映画、趣味、雑談など全ジャンルに対応した掲示板。気軽に投稿・閲覧できるコミュニティサイトです。",
  openGraph: {
    type: "website",
    url: "https://www.just-rondon.com/chatboard",
    title: "掲示板投稿 | 雑談・コミュニティ・話題まとめ",
    description:
      "旅行、ミュージカル、美術館、映画、趣味、雑談など全ジャンルに対応した匿名掲示板。気軽に投稿・閲覧できるコミュニティサイトです。",
    siteName: "ジャスト・ロンドン",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `https://www.just-rondon.com/chatboard/create`,
  },
};

export default function CreatePostPage() {
  return (
    <>
      <BreadCrumbs name="掲示板一覧" link="chatboard" name2="作成" />
      <section className="max-w-3xl mx-auto p-6">
        <CreatePostForm />
      </section>
    </>
  );
}
