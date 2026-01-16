// app/matome/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { MatomeList } from "@/components/chatboard/MatomeList";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic"; // DB一覧は基本これでOK（キャッシュ事故防止）

const SITE_NAME = "観光サイト"; // ←必要ならあなたのサイト名に
const PAGE_TITLE = "みんなの声まとめ | 観光サイト";
const PAGE_DESC =
  "海外(ロンドン)の声・口コミ・体験談を、日本語つきで読みやすく編集。気になる話題をサクッと拾って、次の旅や週末プランのネタに。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/matome",
  },
  openGraph: {
    type: "website",
    url: "https://www.just-rondon.com/matome",
    title:
      "ロンドンの話題・現地の声まとめ | 観光のヒントが見つかる | ジャスト・ロンドン",
    description:
      "ロンドン観光の合間にチェックしたい、現地の声・話題・体験談のまとめ一覧。観光や滞在のヒントになるトピックを、日本語付きで読みやすくまとめています。",
    siteName: "ジャスト・ロンドン",
  },
};

export default async function MatomePage({
  searchParams,
}: {
  searchParams?: {
    page?: string;
  };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESC,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: "/",
    },
    url: "/matome",
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-8">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb-ish */}
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline underline-offset-4">
          トップ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">まとめ</span>
      </nav>

      {/* Hero */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">読める</Badge>
          <Badge variant="secondary">日本語つき</Badge>
          <Badge variant="secondary">旅のネタ帳</Badge>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">
              ロンドンの口コミ・体験談まとめ
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              ロンドンの声・口コミ・体験談を、英語＆日本語訳つきで読みやすく。
              <br />
              「行く」「食べる」「迷う」——観光の意思決定を、ちょっと賢くします。
            </p>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              現地の空気感、価格感、治安感、混雑感。
              ガイドブックにない“温度”を拾います。
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <Separator />

      {/* List */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">最新のまとめ</h2>
          <p className="text-sm text-muted-foreground">
            まずは気になるタイトルだけ拾ってOK。深掘りは詳細ページで。
          </p>
        </div>

        <MatomeList page={page} pagination />
      </section>
    </main>
  );
}
