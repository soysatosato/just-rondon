import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { fetchMonthlyEvents2025 } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { getMonthNumber, getSeasonMeta } from "@/lib/events";
import SeasonBadge from "@/components/events/SeasonBadge";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const content = await fetchMonthlyEvents2025(params.slug);

  if (!content) {
    return {
      title: "ロンドンイベントカレンダー | ジャスト・ロンドン",
      description: "ロンドンで開催されるイベントを月別に紹介します。",
      robots: { index: false, follow: true },
    };
  }

  const text = content.summary || content.mainText || "";
  const trimmed = text.replace(/[#>*_\-`]/g, "").slice(0, 110);

  return buildPageMetadata({
    path: `/events/archive/2025/${params.slug}`,
    title: `${content.title}（アーカイブ） | ロンドンのイベント`,
    description: trimmed
      ? `${trimmed}… 開催時期と見どころを紹介します。`
      : `${content.title}の開催時期や見どころを紹介します。`,
    type: "article",
    images: content.image ? [content.image] : undefined,
  });
}

export default async function EventDetailArchivePage({
  params,
}: {
  params: { slug: string };
}) {
  const content = await fetchMonthlyEvents2025(params.slug);

  if (!content) return notFound();

  const monthNumber = getMonthNumber(content.slug);
  const meta = getSeasonMeta(monthNumber);
  const Icon = meta.icon;

  return (
    <main className="container mx-auto px-4 py-10">
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/events",
          trail: [{ label: "2025年アーカイブ", href: "/events/archive/2025" }],
          current: content.title,
          currentHref: `/events/archive/2025/${content.slug}`,
        })}
      />

      <Breadcrumbs
        path="/events"
        trail={[{ label: "2025年アーカイブ", href: "/events/archive/2025" }]}
        current={content.title}
        className="mb-6"
      />

      <div className="mb-6">
        <Link href="/events/archive/2025">
          <Button variant="outline" className="dark:border-neutral-600">
            ← 月一覧へ戻る
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-col items-center gap-3 text-center">
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full",
            meta.iconWrapClass
          )}
        >
          <Icon className="h-7 w-7" />
        </span>
        <SeasonBadge monthNumber={monthNumber} />
        <h1 className="text-xl md:text-3xl font-bold dark:text-white">
          {content.title}
        </h1>
      </div>

      {content.mainText && <ReactMarkdown>{content.mainText}</ReactMarkdown>}

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-6" />

      <Separator className="my-6 dark:bg-neutral-700" />

      <h2 className="mb-4 flex items-center justify-center gap-2 text-2xl font-semibold dark:text-white">
        <Sparkles className="h-5 w-5 text-primary" />
        主なイベント一覧
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        {content.sections.map((section, idx) => (
          <Card
            key={section.id}
            className="rounded-2xl transition-shadow hover:shadow-md dark:bg-neutral-900 dark:border-neutral-700"
          >
            <CardContent className="flex gap-4 p-5">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  meta.iconWrapClass
                )}
              >
                {idx + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold dark:text-white">
                  {section.title}
                </h3>
                {section.description && (
                  <div className="prose prose-sm mt-2 max-w-none text-muted-foreground dark:prose-invert dark:text-gray-300">
                    <ReactMarkdown>{section.description}</ReactMarkdown>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link href="/events/archive/2025">
          <Button className="mx-auto">イベント一覧へ戻る</Button>
        </Link>
      </div>
    </main>
  );
}
