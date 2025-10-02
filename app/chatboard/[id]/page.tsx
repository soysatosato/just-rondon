import PostDetailClient from "@/components/chatboard/PostDetailClient";
import { fetchPostDetails, fetchPostTitle } from "@/utils/actions/chatboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await fetchPostTitle(params.id);

  // if (!post) {
  //   return {
  //     title: "ポストが見つかりません",
  //     description: "指定された投稿の情報が見つかりませんでした。",
  //   };
  // }

  return {
    title: `掲示板・雑談・コミュニティ・サークル・出会い | ${post?.title} | ロンドん！`,
    description: `${post?.title} に関する話題・雑談を共有できる掲示板です。旅行・趣味・雑談など、${post?.title} に関連する情報を自由に投稿・閲覧でき、コメントして他のユーザーと交流することも可能です。`,
    openGraph: {
      type: "article",
      url: `https://www.just-rondon.com/chatboard/${params.id}`,
      title: `掲示板・雑談・コミュニティ | ${post?.title} | ロンドん！`,
      description: `${post?.title} に関する話題・雑談を共有できる掲示板です。旅行・趣味・雑談など、${post?.title} に関連する情報を自由に投稿・閲覧でき、コメントして他のユーザーと交流することも可能です。`,
      siteName: "ロンドん！",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/chatboard/${params.id}`,
    },
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await fetchPostDetails(params.id);
  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
        <Card className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              投稿が見つかりません
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              お探しの投稿は削除されたか、存在しない可能性があります。
            </p>
            <Link href="/chatboard">
              <Button className="mt-4 w-full">掲示板一覧へ戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <BreadCrumbs
          name="掲示板一覧"
          link="chatboard"
          name2={
            post.title.length > 5 ? post.title.slice(0, 5) + "..." : post.title
          }
        />
      </div>
      <PostDetailClient post={post} />
    </>
  );
}
