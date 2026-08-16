import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  ExternalLink,
  MapPin,
  Theater,
  Train,
  Users,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchTheatreDetails,
  fetchTheatrePerformances,
  fetchTheatreSlugs,
} from "@/utils/actions/theatres";
import {
  buildTheatreMetadata,
  operatorSite,
  theatreBreadcrumbJsonLd,
  theatreJsonLd,
  THEATRES_BASE,
} from "@/components/musicals/theatres/theatres";
import TheatrePerformances from "@/components/musicals/theatres/TheatrePerformances";
import { formatRuntime } from "@/components/musicals/facts";

const DynamicMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

export async function generateStaticParams() {
  const theatres = await fetchTheatreSlugs();
  return theatres.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const theatre = await fetchTheatreDetails(params.slug);

  if (!theatre) {
    return {
      title: "劇場情報が見つかりません | ジャスト・ロンドン",
      description: "指定された劇場の情報が見つかりませんでした。",
      robots: { index: false, follow: false },
    };
  }

  const onShow = theatre.musicals.filter((m) => m.isOnShow).map((m) => m.name);
  return buildTheatreMetadata(theatre, onShow);
}

export default async function TheatreDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const theatre = await fetchTheatreDetails(params.slug);
  // 劇場は人が THEATRE_SLUGS で決めた slug しか無い。存在しないものは
  // リダイレクトで隠さず 404 を返す(誤ったURLがインデックスされたときに
  // トップの複製として扱われないため)。
  if (!theatre) notFound();

  const performances = await fetchTheatrePerformances(theatre.id);
  const onShow = theatre.musicals.filter((m) => m.isOnShow);
  const pastShows = theatre.musicals.filter((m) => !m.isOnShow);
  const operatorUrl = theatre.operator ? operatorSite(theatre.operator) : null;

  return (
    <>
      <JsonLd data={theatreBreadcrumbJsonLd(theatre)} />
      <JsonLd data={theatreJsonLd(theatre)} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-10">
        <nav className="text-xs text-muted-foreground">
          <Link href="/musicals" className="hover:text-foreground">
            ミュージカル
          </Link>
          <span className="mx-1.5">/</span>
          <Link href={THEATRES_BASE} className="hover:text-foreground">
            劇場ガイド
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{theatre.nameJa}</span>
        </nav>

        <header>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Theater className="h-3.5 w-3.5" />
            ウエストエンドの劇場
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {theatre.name}
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            {theatre.nameJa}
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <HeaderFact icon={MapPin} label="住所" value={theatre.address} />
            {theatre.nearestStation && (
              <HeaderFact
                icon={Train}
                label="最寄り駅"
                value={theatre.nearestStation}
              />
            )}
            {theatre.capacity && (
              <HeaderFact
                icon={Users}
                label="客席数"
                value={`約${theatre.capacity.toLocaleString("ja-JP")}席`}
              />
            )}
            {theatre.operator && (
              <HeaderFact
                icon={Building2}
                label="運営"
                value={
                  operatorUrl ? (
                    <>
                      <a
                        href={operatorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {theatre.operator}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        このグループの公式サイトで購入できます
                      </span>
                    </>
                  ) : (
                    theatre.operator
                  )
                }
              />
            )}
          </dl>
        </header>

        <AdSenseUnit slot={AD_SLOTS.inArticle} />

        {onShow.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold sm:text-2xl">
              この劇場で上演中の作品
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {onShow.map((m) => {
                const runtime = formatRuntime(
                  m.runtimeMinutes,
                  m.intervalMinutes,
                );
                return (
                  <Link
                    key={m.slug}
                    href={`/musicals/${m.slug}`}
                    className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-md"
                  >
                    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      {m.mustSee && (
                        <Badge className="mb-1.5 border-transparent bg-rose-600 text-white">
                          Must See
                        </Badge>
                      )}
                      <h3 className="font-bold leading-snug">{m.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {m.engName}
                      </p>
                      {runtime && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          上演時間 {runtime}
                        </p>
                      )}
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        作品の詳細
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <TheatrePerformances
          performances={performances}
          fetchedAt={performances[0]?.updatedAt ?? null}
          multipleShows={onShow.length > 1}
        />

        {theatre.notes && (
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
              この劇場で知っておきたいこと
            </h2>
            <div className="space-y-3">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ ...props }) => (
                    <p
                      className="text-sm leading-relaxed text-foreground sm:text-base"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => (
                    <li
                      className="ml-5 list-disc text-sm text-foreground sm:text-base"
                      {...props}
                    />
                  ),
                  strong: ({ ...props }) => (
                    <strong className="font-semibold" {...props} />
                  ),
                }}
              >
                {theatre.notes}
              </Markdown>
            </div>
          </section>
        )}

        <section className="space-y-2">
          <h2 className="text-xl font-semibold sm:text-2xl">場所</h2>
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4">
              <DynamicMap lat={theatre.lat} lng={theatre.lng} />
            </CardContent>
          </Card>
        </section>

        {pastShows.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold sm:text-2xl">
              この劇場で扱っている作品
            </h2>
            <p className="text-sm text-muted-foreground">
              上演状況の確認が取れていない作品です。観に行く前に公式サイトで
              ご確認ください。
            </p>
            <ul className="flex flex-wrap gap-2">
              {pastShows.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/musicals/${m.slug}`}
                    className="inline-flex rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary"
                  >
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-muted/40 p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            劇場へ向かう前に、
            <Link
              href="/musicals/west-end-tickets"
              className="mx-1 text-primary underline hover:opacity-80"
            >
              チケットの買い方・お得な料金ガイド
            </Link>
            と
            <Link
              href="/musicals/west-end-etiquette"
              className="mx-1 text-primary underline hover:opacity-80"
            >
              劇場の楽しみ方・マナーガイド
            </Link>
            もあわせてどうぞ。地下鉄やバスでの行き方は
            <Link
              href="/sightseeing/transport"
              className="mx-1 text-primary underline hover:opacity-80"
            >
              ロンドンの交通ガイド
            </Link>
            にまとめています。
          </p>
        </section>
      </div>
    </>
  );
}

function HeaderFact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
