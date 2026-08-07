export const revalidate = 60 * 60;

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
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
  GraduationCap,
  Users,
  Award,
  Home as HomeIcon,
  Briefcase,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import HeroContent from "@/components/home/HeroContent";
import SectionHeader from "@/components/home/SectionHeader";
import ColumnCard from "@/components/column/ColumnCard";
import { fetchColumns, fetchUpcomingEvents } from "@/utils/actions/contents";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/",
  title: `${SITE_NAME} | ロンドン観光・美術館・ミュージカル・イベント情報`,
  titleSuffix: false,
  description:
    "初めてのロンドン旅行でも安心。定番の観光スポット、美術館と必見作品、ウエストエンドのミュージカル、季節のイベント、ビザや現地で働く情報まで、日本語でまとめた総合ロンドンガイドです。",
});

// セクションごとにアクセントカラーを分け、スクロール時に今どのセクションかを判別しやすくする。
// ブランドカラーの赤はロゴ・主要CTA・トップ直下の総合案内セクションのみで使う。
const ACCENTS = {
  red: {
    badge: "bg-red-600 hover:bg-red-600",
    iconBg: "bg-red-50 dark:bg-red-950/40",
    iconText: "text-red-600",
    hoverBorder: "hover:border-red-300 dark:hover:border-red-800",
  },
  blue: {
    badge: "bg-sky-600 hover:bg-sky-600",
    iconBg: "bg-sky-50 dark:bg-sky-950/40",
    iconText: "text-sky-600",
    hoverBorder: "hover:border-sky-300 dark:hover:border-sky-800",
  },
  amber: {
    badge: "bg-amber-600 hover:bg-amber-600",
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconText: "text-amber-600",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-800",
  },
  emerald: {
    badge: "bg-emerald-600 hover:bg-emerald-600",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconText: "text-emerald-600",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-800",
  },
} as const;

export default async function Page() {
  const now = new Date();
  const [latestColumns, upcomingEvents] = await Promise.all([
    fetchColumns(),
    fetchUpcomingEvents(3, now),
  ]);
  const columnPicks = latestColumns.slice(0, 3);

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
                href="/visa"
                title="英国ビザガイド"
                icon={FileText}
              />
              <InfoPill
                href="/visa/youth-mobility-scheme"
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

      {/* ロンドン探索 */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b text-foreground bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <SectionHeader
            title="ロンドンをもっと探索"
            description="世界的ミュージカルから一流観光地、ユニークツアーやファミリー向けスポットまで盛りだくさん。"
            accentClassName={ACCENTS.blue.badge}
          />

          <div className="grid gap-4 lg:grid-cols-4">
            <ExploreCard
              href="/sightseeing/must-see"
              title="見逃せないロンドン観光名所"
              description="ビッグベンからバッキンガム宮殿まで、初めての旅行者が押さえておきたい定番スポットを厳選。"
              icon={MapPin}
              accent={ACCENTS.blue}
            />
            <ExploreCard
              href="/musicals"
              title="現在上演中のおすすめミュージカル"
              description="ウエストエンドで今上演中の人気ミュージカルとチケット情報をまとめてチェック。"
              icon={Ticket}
              accent={ACCENTS.blue}
            />
            <ExploreCard
              href="/museums/best-10-museums"
              title="ロンドンのおすすめの美術館"
              description="大英博物館やテート・モダンなど、無料で入れる名門美術館10選を紹介。"
              icon={Landmark}
              accent={ACCENTS.blue}
            />
            {/* <ExploreCard href="/chatboard" title="ロンドンなんでも掲示板" description="旅行者同士で情報交換できる掲示板です。" /> */}
          </div>
        </div>
      </section>

      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b text-foreground bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <SectionHeader
            title="ロンドンの催し物"
            description="年中行われるフェスティバル、祝日、スポーツイベントをチェック。"
            accentClassName={ACCENTS.blue.badge}
          />

          {upcomingEvents.length > 0 && (
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {upcomingEvents.map((event) => {
                const sameDay =
                  event.startDate.getTime() === event.endDate.getTime();
                const dateLabel = sameDay
                  ? format(event.startDate, "M月d日")
                  : `${format(event.startDate, "M月d日")}〜${format(event.endDate, "M月d日")}`;

                return (
                  <Link key={event.id} href="/events">
                    <Card className="h-full bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-semibold text-sky-600">
                            {dateLabel}
                          </span>
                          {event.isFree && (
                            <Badge
                              variant="outline"
                              className="border-emerald-600/40 bg-emerald-600/10 text-[10px] text-emerald-700 dark:text-emerald-400"
                            >
                              無料
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium leading-snug">
                          {event.title}
                        </p>
                        {event.venue && (
                          <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
                            {event.venue}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoPill
              href="/restaurants"
              title="ロンドンで食べるイギリス料理"
              icon={UtensilsCrossed}
              accent={ACCENTS.blue}
            />
            <InfoPill
              href="/souvenirs"
              title="ロンドンのお土産"
              icon={ShoppingBag}
              accent={ACCENTS.blue}
            />
            <InfoPill
              href="/sightseeing/christmas-markets"
              title="ロンドンのクリスマス"
              icon={Gift}
              accent={ACCENTS.blue}
            />
            <InfoPill
              href="/sightseeing/kids-free-activities"
              title="子どもと楽しむ"
              icon={Baby}
              accent={ACCENTS.blue}
            />
            <InfoPill
              href="/events"
              title="ロンドン年間イベントカレンダー"
              icon={Calendar}
              accent={ACCENTS.blue}
            />
          </div>
        </div>
      </section>

      {/* 英国ビザ情報 */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b text-foreground bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <SectionHeader
            eyebrow="英国ビザ情報"
            title="目的別・英国ビザガイド"
            description="観光のETAはもちろん、ワーホリ・就労・留学・家族ビザ・渡英後の手続きまで。日本国籍の人が実際に使うルートを、目的と期間から探せます。"
            accentClassName={ACCENTS.amber.badge}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <ExploreCard
              href="/visa/youth-mobility-scheme"
              title="YMS（ワーホリ）申請ガイド"
              description="18〜30歳ならスポンサーなしで最長2年働ける唯一のルート。日本枠は年6,000人・抽選なし。"
              icon={Backpack}
              accent={ACCENTS.amber}
            />
            <ExploreCard
              href="/visa/skilled-worker"
              title="Skilled Worker（就労ビザ）ガイド"
              description="スポンサー企業を得て働くための就労ビザ。対象職種や年収要件、企業の探し方まで解説。"
              icon={Briefcase}
              accent={ACCENTS.amber}
            />
            <ExploreCard
              href="/visa/global-talent"
              title="Global Talent（卓越人材ビザ）ガイド"
              description="研究者・アーティスト・技術者向け。雇用主のスポンサーが不要で、最短3年で永住権に届きます。"
              icon={Award}
              accent={ACCENTS.amber}
            />
            <ExploreCard
              href="/visa/student"
              title="Student／Graduate ビザガイド"
              description="CASの取り方、維持費の証明額、就労できる時間まで。卒業後のGraduateビザについても解説。"
              icon={GraduationCap}
              accent={ACCENTS.amber}
            />
            <ExploreCard
              href="/visa/family"
              title="家族・配偶者ビザガイド"
              description="英国人・定住者の配偶者として暮らすためのルート。所得要件や関係の真実性の立証方法。"
              icon={Users}
              accent={ACCENTS.amber}
            />
            <ExploreCard
              href="/visa/after-arrival"
              title="渡英後の手続きガイド"
              description="UKVIアカウント、share code、NINo、GP登録、銀行口座。ビザが下りてからやるべきことまとめ。"
              icon={HomeIcon}
              accent={ACCENTS.amber}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/visa">英国ビザガイドをすべて見る →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ロンドンで働く・暮らす */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b text-foreground bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <SectionHeader
            eyebrow="働く・暮らす"
            title="ロンドンで働く人のための労働問題ガイド"
            description="観光だけでなく、ロンドンで暮らし・働く日本人のための実用情報も。最低賃金からビザ、サービスチャージの未払いトラブルまで、英国の労働法を分かりやすくまとめました。"
            accentClassName={ACCENTS.emerald.badge}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <ExploreCard
              href="/jobs"
              title="労働問題ガイド トップ"
              description="最低賃金・労働契約・ビザと就労・職場ハラスメントまで、働き始める前後に知っておきたい基本をテーマ別に整理。"
              icon={BriefcaseBusiness}
              accent={ACCENTS.emerald}
            />
            <ExploreCard
              href="/jobs/service-charges"
              title="サービスチャージ完全ガイド"
              description="Tipping Act 2023の内容、Tronc制度、強制・任意の違いまで、飲食・ホテル業界で働く人が知るべき制度を網羅。"
              icon={Receipt}
              accent={ACCENTS.emerald}
            />
            <ExploreCard
              href="/jobs/service-charges/case-story"
              title="審判所に申立てた実体験の記録"
              description="サービスチャージ未払いをめぐり、Acas調停からEmployment Tribunalの判決・強制執行まで実際に歩んだ記録を公開。"
              icon={Scale}
              accent={ACCENTS.emerald}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/jobs">労働問題ガイドをすべて見る →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* コラム */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b text-foreground bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <SectionHeader
            eyebrow="コラム"
            title="イギリスの歴史・文化・伝統を深掘りする読み物"
            description="旅行ガイドだけでは伝えきれない、イギリスの奥深さをじっくり読み解くコラムを毎日更新でお届けします。"
          />

          {columnPicks.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
              {columnPicks.map((item) => (
                <ColumnCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">近日公開予定です。</p>
          )}

          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/column">コラムをすべて見る →</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

type Accent = (typeof ACCENTS)[keyof typeof ACCENTS];

function InfoPill({
  title,
  href,
  icon: Icon,
  accent = ACCENTS.red,
}: {
  title: string;
  href: string;
  icon?: LucideIcon;
  accent?: Accent;
}) {
  return (
    <Link href={href}>
      <button
        className={`flex w-full items-center gap-2 rounded-xl border bg-card text-card-foreground px-4 py-3 text-left text-xs font-medium shadow-sm transition hover:shadow-md ${accent.hoverBorder}`}
      >
        {Icon && <Icon className={`h-4 w-4 shrink-0 ${accent.iconText}`} />}
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
  accent = ACCENTS.red,
}: {
  title: string;
  href: string;
  description: string;
  icon?: LucideIcon;
  accent?: Accent;
}) {
  return (
    <Link href={href}>
      <Card className="h-full bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex h-full flex-col justify-between p-4">
          <div>
            {Icon && (
              <div className={`mb-2 inline-flex rounded-lg p-2 ${accent.iconBg}`}>
                <Icon className={`h-4 w-4 ${accent.iconText}`} />
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
