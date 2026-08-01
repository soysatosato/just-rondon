export const revalidate = 60 * 60;

import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  Landmark,
  Ticket,
  Plane,
  FileText,
  Backpack,
  Gift,
  Baby,
  Calendar,
  BriefcaseBusiness,
  Receipt,
  Scale,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import HeroContent from "@/components/home/HeroContent";
import SectionHeader from "@/components/home/SectionHeader";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/",
  title: `${SITE_NAME} | ロンドン観光・美術館・ミュージカル・イベント情報`,
  titleSuffix: false,
  description:
    "初めてのロンドン旅行でも安心。定番の観光スポット、美術館と必見作品、ウエストエンドのミュージカル、季節のイベント、ビザや現地で働く情報まで、日本語でまとめた総合ロンドンガイドです。",
});

export default function Page() {
  return (
    <div className="bg-background">
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b text-foreground">
        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-16 sm:pb-20">
          <div className="absolute inset-x-0 top-0 -z-10 h-full">
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              <Image
                src="/just-rondon.png"
                alt="ジャスト・ロンドン"
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover brightness-75 dark:brightness-60"
                priority
              />
            </div>
          </div>

          <div className="relative">
            <HeroContent />

            {/* サブテキスト */}
            <div className="mt-12 rounded-2xl bg-card text-card-foreground p-6 text-center text-sm shadow-md shadow-slate-900/5 dark:shadow-black/40 backdrop-blur sm:mt-14">
              <h2 className="mb-3 text-base font-semibold">
                ロンドン観光をもっと楽しむためのガイド
              </h2>
              <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  ジャスト・ロンドンは、ロンドンを訪れる日本人旅行者のための観光ガイドサイトです。
                  定番の観光スポットから、美術館、ミュージカル、季節ごとのイベントまで、
                  初めての方にも分かりやすく情報をまとめています。
                </p>
                <p>
                  地下鉄やバスなどの移動手段、無料で楽しめる観光地、
                  子ども連れや一人旅におすすめのスポットなど、
                  旅行計画に役立つ実用的な情報も充実しています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 初めてのロンドン */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b text-foreground bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
            <div>
              <SectionHeader
                eyebrow="初めてロンドンを訪れる方へ"
                title="ロンドン完全ガイド"
                description="レストラン、ホテル、美術館、シアター、ミュージカル、観光スポットなど、最高の体験を紹介します。初めてのロンドン旅行を安全・快適に。最新の旅行情報を参考に、地下鉄・バス・川・空から街を巡りましょう。"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoPill href="/sightseeing" title="ロンドン・観光スポット" icon={MapPin} />
              <InfoPill href="/museums" title="ロンドン・美術館" icon={Landmark} />
              <InfoPill href="/musicals" title="ロンドン・ミュージカル" icon={Ticket} />
              <InfoPill
                href="/sightseeing/eta-uk-visa-guide"
                title="ロンドン・ETA（電子渡航認証）"
                icon={Plane}
              />
              <InfoPill
                href="/visa/uk-visa-guide-2025"
                title="ロンドン・ビザ情報"
                icon={FileText}
              />
              <InfoPill
                href="/visa/uk-youth-mobility-visa"
                title="ロンドン・ワーホリ"
                icon={Backpack}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-2">
        <AdSenseUnit slot={AD_SLOTS.listing} reservedHeight={120} />
      </div>

      {/* ロンドンで働く・暮らす */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b text-foreground bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <SectionHeader
            eyebrow="働く・暮らす"
            title="ロンドンで働く人のための労働問題ガイド"
            description="観光だけでなく、ロンドンで暮らし・働く日本人のための実用情報も。最低賃金からビザ、サービスチャージの未払いトラブルまで、英国の労働法を分かりやすくまとめました。"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <ExploreCard
              href="/jobs"
              title="労働問題ガイド トップ"
              description="最低賃金・労働契約・ビザと就労・職場ハラスメントまで、働き始める前後に知っておきたい基本をテーマ別に整理。"
              icon={BriefcaseBusiness}
            />
            <ExploreCard
              href="/jobs/service-charges"
              title="サービスチャージ完全ガイド"
              description="Tipping Act 2023の内容、Tronc制度、強制・任意の違いまで、飲食・ホテル業界で働く人が知るべき制度を網羅。"
              icon={Receipt}
            />
            <ExploreCard
              href="/jobs/service-charges/case-story"
              title="審判所に申立てた実体験の記録"
              description="サービスチャージ未払いをめぐり、Acas調停からEmployment Tribunalの判決・強制執行まで実際に歩んだ記録を公開。"
              icon={Scale}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/jobs">労働問題ガイドをすべて見る →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ロンドン探索 */}
      <section className="border-b text-foreground bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <SectionHeader
            title="ロンドンをもっと探索"
            description="世界的ミュージカルから一流観光地、ユニークツアーやファミリー向けスポットまで盛りだくさん。"
          />

          <div className="grid gap-4 lg:grid-cols-4">
            <ExploreCard
              href="/sightseeing/must-see"
              title="見逃せないロンドン観光名所"
              description="ビッグベンからバッキンガム宮殿まで、初めての旅行者が押さえておきたい定番スポットを厳選。"
              icon={MapPin}
            />
            <ExploreCard
              href="/musicals"
              title="現在上演中のおすすめミュージカル"
              description="ウエストエンドで今上演中の人気ミュージカルとチケット情報をまとめてチェック。"
              icon={Ticket}
            />
            <ExploreCard
              href="/museums/best-10-museums"
              title="ロンドンのおすすめの美術館"
              description="大英博物館やテート・モダンなど、無料で入れる名門美術館10選を紹介。"
              icon={Landmark}
            />
            {/* <ExploreCard href="/chatboard" title="ロンドンなんでも掲示板" description="旅行者同士で情報交換できる掲示板です。" /> */}
          </div>
        </div>
      </section>

      <section className="border-b text-foreground bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <SectionHeader
            title="ロンドンの催し物"
            description="年中行われるフェスティバル、祝日、スポーツイベントをチェック。"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <InfoPill
              href="/sightseeing/christmas-markets"
              title="ロンドンのクリスマス"
              icon={Gift}
            />
            <InfoPill
              href="/sightseeing/kids-free-activities"
              title="子どもと楽しむ"
              icon={Baby}
            />
            <InfoPill href="/events" title="ロンドン年間イベントカレンダー" icon={Calendar} />
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoPill({
  title,
  href,
  icon: Icon,
}: {
  title: string;
  href: string;
  icon?: LucideIcon;
}) {
  return (
    <Link href={href}>
      <button className="flex w-full items-center gap-2 rounded-xl border bg-card text-card-foreground px-4 py-3 text-left text-xs font-medium shadow-sm transition hover:border-red-300 dark:hover:border-red-800 hover:shadow-md">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-red-600" />}
        <span>{title}</span>
      </button>
    </Link>
  );
}

function ExploreCard({
  title,
  href,
  description,
  icon: Icon,
}: {
  title: string;
  href: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <Link href={href}>
      <Card className="h-full bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex h-full flex-col justify-between p-4">
          <div>
            {Icon && (
              <div className="mb-2 inline-flex rounded-lg bg-red-50 dark:bg-red-950/40 p-2">
                <Icon className="h-4 w-4 text-red-600" />
              </div>
            )}
            <p className="text-sm font-semibold">{title}</p>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
