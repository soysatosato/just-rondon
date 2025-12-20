"use client";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Link from "next/link";
import TitleLogo from "@/components/home/TitleLogo";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const [value, setValue] = useState("");
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <section className="relative border-b border-slate-200 dark:border-slate-800">
        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-16 sm:pb-20">
          <div className="absolute inset-x-0 top-0 -z-10 h-full">
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              <Image
                src="/just-rondon.png"
                alt="ロンドん！"
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover brightness-75 dark:brightness-60"
              />
            </div>
          </div>

          <div className="relative">
            <TitleLogo />
            <h1 className="mt-6 text-center text-xl font-semibold tracking-tight drop-shadow-sm sm:text-4xl text-slate-900 dark:text-slate-100">
              ロンドン観光最強ガイド
            </h1>
            <h1 className="mt-3 mb-8 text-center text-lg  tracking-tight drop-shadow-sm sm:text-4xl text-slate-900 dark:text-slate-100">
              観光スポット・美術館・ミュージカル情報
            </h1>

            {/* 検索バー */}
            <div className="mx-auto flex max-w-xl items-center rounded-full bg-white/95 dark:bg-slate-900/90 p-1.5 shadow-lg shadow-slate-900/20 dark:shadow-black/40 backdrop-blur">
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger className="border-none bg-transparent text-sm text-slate-900 dark:text-slate-100 focus-visible:ring-0 w-full px-2 py-1 [&>svg]:hidden">
                  <SelectValue placeholder="選択してください…" />
                </SelectTrigger>

                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectItem value="sightseeing">
                    観光スポットを探す
                  </SelectItem>
                  <SelectItem value="sightseeing/all?category=tour">
                    ツアーを見る
                  </SelectItem>
                  <SelectItem value="museums">美術館を探す</SelectItem>
                  <SelectItem value="musicals">ミュージカルを探す</SelectItem>
                  <SelectItem value="chatboard">掲示板を見る</SelectItem>
                  <SelectItem value="news">ニュースを見る</SelectItem>
                  <SelectItem value="jobs/service-charges">
                    サービスチャージについて調べる
                  </SelectItem>
                </SelectContent>
              </Select>

              {value ? (
                <Button
                  asChild
                  className="ml-1 rounded-full px-5 text-xs font-semibold"
                >
                  <Link href={`/${value}`}>Go</Link>
                </Button>
              ) : (
                <Button
                  disabled
                  className="ml-1 rounded-full px-5 text-xs font-semibold opacity-40 dark:opacity-30"
                >
                  Go
                </Button>
              )}
            </div>

            {/* サブテキスト */}
            <div className="mt-12 rounded-2xl bg-white/90 dark:bg-slate-900/80 p-6 text-center text-sm shadow-md shadow-slate-900/5 dark:shadow-black/40 backdrop-blur sm:mt-14">
              <h2 className="mb-3 text-base font-semibold">
                ロンドン観光をもっと楽しむためのガイド
              </h2>
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  ロンドん！は、ロンドンを訪れる日本人旅行者のための観光ガイドサイトです。
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
      <section className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
            <div>
              <Badge className="mb-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                初めてロンドンを訪れる方へ
              </Badge>
              <h2 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                ロンドン完全ガイド
              </h2>
              <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
                レストラン、ホテル、美術館、シアター、ミュージカル、観光スポットなど、最高の体験を紹介します。
              </p>
              <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">
                初めてのロンドン旅行を安全・快適に。最新の旅行情報を参考に、地下鉄・バス・川・空から街を巡りましょう。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoPill href="/sightseeing" title="ロンドン・観光スポット" />
              <InfoPill href="/museums" title="ロンドン・美術館" />
              <InfoPill href="/musicals" title="ロンドン・ミュージカル" />
              <InfoPill
                href="/sightseeing/eta-uk-visa-guide"
                title="ロンドン・ETA（電子渡航認証）"
              />
              <InfoPill
                href="/visa//visa/uk-visa-guide-2025"
                title="ロンドン・ビザ情報"
              />
              <InfoPill
                href="/visa/uk-youth-mobility-visa"
                title="ロンドン・ワーホリ"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ロンドン探索 */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                ロンドンをもっと探索
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">
                世界的ミュージカルから一流観光地、ユニークツアーやファミリー向けスポットまで盛りだくさん。
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <ExploreCard
              href="/sightseeing/must-see"
              title="見逃せないロンドン観光名所"
            />
            <ExploreCard
              href="/musicals"
              title="現在上演中のおすすめミュージカル"
            />
            <ExploreCard
              href="/museums/best-10-museums"
              title="ロンドンのおすすめの美術館"
            />
            <ExploreCard href="/chatboard" title="ロンドンなんでも掲示板" />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 grid gap-8 lg:grid-cols-[1.2fr,1fr]">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                ロンドンの催し物
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">
                年中行われるフェスティバル、祝日、スポーツイベントをチェック。
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <InfoPill
              href="/sightseeing/christmas-markets"
              title="ロンドンのクリスマス"
            />
            <InfoPill
              href="/sightseeing/kids-free-activities"
              title="子どもと楽しむ"
            />
            <InfoPill href="/events" title="ロンドン年間イベントカレンダー" />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ===== コンポーネント（同ファイル内） ===== */

type SimpleCardProps = {
  title: string;
  image: string;
  badge?: string;
};

function MustSeeCard({ title, image, badge }: SimpleCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-32 w-full">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold text-red-600 shadow">
            {badge}
          </span>
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
          {title}
        </p>
      </CardContent>
    </Card>
  );
}

function InfoPill({ title, href }: { title: string; href: string }) {
  return (
    <Link href={href}>
      <button className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-left text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm hover:border-slate-300 dark:hover:border-slate-600">
        {title}
      </button>
    </Link>
  );
}

function ExploreCard({ title, href }: { title: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="flex h-full flex-col justify-between p-4">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </p>
          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            厳選されたヒント、地図、知っておくべき情報を紹介します。
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
