import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { fetchPosts } from "@/utils/actions/chatboard";
import { BiComment } from "react-icons/bi";
import { AiOutlineLike } from "react-icons/ai";
import { Metadata } from "next";
import Pagination from "@/components/home/Pagination";
import { MatomeList } from "@/components/chatboard/MatomeList";

export const metadata: Metadata = {
  title: "掲示板・雑談・コミュニティ・出会い・サークル | ロンドん！話題まとめ",
  description:
    "旅行、映画、趣味、雑談、サークル、出会いなど全ジャンルに対応した匿名掲示板。気軽に投稿・閲覧できるコミュニティサイトです。",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `https://www.just-rondon.com/chatboard`,
  },
  openGraph: {
    type: "website",
    url: "https://www.just-rondon.com/chatboard",
    title: "掲示板・雑談・コミュニティ・出会い・サークル | ロンドん！",
    description:
      "旅行、ミュージカル、美術館、映画、趣味、雑談など全ジャンルに対応した匿名掲示板。気軽に投稿・閲覧できるコミュニティサイトです。",
    siteName: "ロンドん！",
  },
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 10;

  const { posts, total } = await fetchPosts({
    page: currentPage,
    limit: itemsPerPage,
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 text-center">
        <section className="mb-10">
          <Card className="border border-gray-200 dark:border-gray-700 rounded-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg md:text-xl font-extrabold">
                ロンドンの現地の声まとめ
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                現地の空気感、価格感、治安感、混雑感を体感する。
                雑談や書き込みは、この下の掲示板でどうぞ。
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <MatomeList take={3} />
              <div className="pt-2 mt-4">
                <Button asChild size="sm">
                  <Link href="/matome">まとめ一覧へ（観光に出発）</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
        <div className="flex-1">
          <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">
            ロンドンライフ掲示板
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base leading-relaxed text-left">
            さあ、ロンドンでの毎日をここで全部ぶちまけよう！
            街で見つけた面白いカフェやバーの話、仕事の裏話やチャンス、思わぬ出会い、趣味やイベントの情報――
            <br />
            何でも構わない、ざっくばらんに書き出してシェアしよう。
            ここに書き込む一言が、誰かの新しい発見や人生のきっかけになるかもしれない。
            <br />
            遠慮は不要、思いのままに、あなたのロンドンライフを解放してみて！
          </p>
        </div>
        <Link href="/chatboard/create">
          <Button className="mt-4 md:mt-0 px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            今すぐスレッドを作る
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-center">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/chatboard/${post.id}`}
              className="block"
            >
              <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 rounded-xl bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-1">
                    {post.content}
                  </p>
                  <div className="flex items-center mt-8 gap-6 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <BiComment className="w-5 h-5" />
                      <span className="text-sm">{post._count.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AiOutlineLike className="w-5 h-5" />
                      <span className="text-sm">{post.votes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <div className="flex justify-center my-8">
        <Pagination
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          baseUrl="/chatboard"
        />
      </div>
    </div>
  );
}
