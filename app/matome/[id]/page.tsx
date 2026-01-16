// app/matome/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/utils/format";
import { fetchMatome } from "@/utils/actions/chatboard";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const matome: any = await fetchMatome(params.id);

  if (!matome) {
    return {
      title: "記事が見つかりません | ジャスト・ロンドン",
      robots: { index: false, follow: false },
    };
  }

  const title = `${matome.titleJa} | 現地の声 | ジャスト・ロンドン`;
  const description =
    matome.titleJa ||
    matome.bodyJa?.slice(0, 120) ||
    "ロンドンの現地の声・話題を、日本語付きでわかりやすく紹介します。";

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/matome/${params.id}`,
    },
    openGraph: {
      type: "article",
      url: `https://www.just-rondon.com/matome/${params.id}`,
      title,
      description,
      siteName: "ジャスト・ロンドン",
    },
  };
}

export default async function MatomeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const reddit: any = await fetchMatome(params.id);

  if (!reddit) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 space-y-6">
      <Link
        href="/matome"
        className="text-sm text-muted-foreground hover:underline underline-offset-4"
      >
        ← 一覧へ
      </Link>

      {/* ===== Thread ===== */}
      <Card>
        <CardHeader className="space-y-3">
          <h1 className="text-2xl font-semibold leading-snug">
            {reddit.title}
          </h1>

          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {reddit.titleJa}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              投稿日 {formatDate(reddit.postedAt)}
            </Badge>
            {reddit.authorId ? (
              <Badge variant="outline">by {reddit.authorId}</Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {reddit.imageUrl ? (
            <div className="relative h-48 md:h-56 overflow-hidden rounded-xl border">
              <Image
                src={reddit.imageUrl}
                alt={reddit.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          ) : null}

          <div className="space-y-4">
            <p className="whitespace-pre-wrap text-[15px] leading-7">
              {reddit.body}
            </p>

            <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground italic">
              {reddit.bodyJa}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ===== Comments ===== */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Comments{" "}
          <span className="text-muted-foreground">
            ({reddit.posts?.length ?? 0})
          </span>
        </h2>

        <Separator />

        <div className="space-y-4">
          {(reddit.posts ?? []).map((p: any) => (
            <Card key={p.id}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">#{p.displayOrder}</Badge>
                  {p.authorId ? <span>by {p.authorId}</span> : null}
                  <span>{formatDate(p.createdAt)}</span>
                </div>

                {/* English */}
                <p className="whitespace-pre-wrap text-[15px] leading-7">
                  {p.title}
                </p>

                {/* Japanese */}
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground italic">
                  {p.titleJa}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="pt-8 text-center text-xs text-muted-foreground">
        <p className="text-xs text-muted-foreground leading-relaxed">
          ここまで読んだあなた、完全にジャスト・ロンドンの住民です。
          <br />
          せっかくなので今度は この街（サイト）を観光していきませんか。
        </p>

        <div className="flex flex-raw items-center justify-center gap-2 mt-4">
          <Button asChild size="sm">
            <Link href="/">ジャスト・ロンドンを観光する</Link>
          </Button>

          <Button asChild variant="secondary" size="sm">
            <Link href="/matome">まとめ一覧へ戻る</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
