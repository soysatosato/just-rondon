// app/page.tsx
import { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Link from "next/link";
import TitleLogo from "@/components/home/TitleLogo";

export const metadata: Metadata = {
  title: "ロンドンを発見 | 公式観光ガイド（モック）",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative border-b border-slate-200">
        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-16 sm:pb-20">
          <div className="absolute inset-x-0 top-0 -z-10 h-full">
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              <Image
                src="/just-rondon.png"
                alt="ロンドん！"
                fill
                className="object-cover brightness-75"
                priority
              />
            </div>
          </div>

          <div className="relative">
            <TitleLogo />
            <h1 className="mb-6 text-center text-3xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-4xl">
              ロンドンを発見しよう
            </h1>

            {/* 検索バー */}
            <div className="mx-auto flex max-w-xl items-center rounded-full bg-white/95 p-1.5 shadow-lg shadow-slate-900/20 backdrop-blur">
              <Select>
                <SelectTrigger className="border-none bg-transparent text-sm focus-visible:ring-0 w-full px-2 py-1 [&>svg]:hidden">
                  <SelectValue placeholder="選択してください…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spot">観光スポットを探す</SelectItem>
                  <SelectItem value="tour">ツアーを見る</SelectItem>
                  <SelectItem value="ticket">チケットを探す</SelectItem>
                  <SelectItem value="food">レストランを探す</SelectItem>
                </SelectContent>
              </Select>
              <Button className="ml-1 rounded-full px-5 text-xs font-semibold">
                Go
              </Button>
            </div>

            {/* サブテキスト */}
            <div className="mt-12 rounded-2xl bg-white/90 p-6 text-center text-sm shadow-md shadow-slate-900/5 backdrop-blur sm:mt-14">
              <h2 className="mb-3 text-base font-semibold text-slate-900">
                ロンドン観光をもっと楽しむためのガイド
              </h2>
              <div className="space-y-1 text-xs text-slate-600">
                <p>ロンドンの名所から美術館、ミュージカルなど</p>
                <p>毎年多くの旅行者が訪れる街の魅力を紹介</p>
                <p>旅行計画に役立つ情報をわかりやすく掲載</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*       
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <h2 className="mb-2 text-xl font-semibold text-slate-900">
            見逃せないスポット
          </h2>
          <p className="mb-6 max-w-2xl text-sm text-slate-600">
            ロンドン旅行に欠かせない名所、人気のショー、魅力的なツアーを体験しましょう。
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MustSeeCard
              title="ホップオン・ホップオフ バスツアー"
              image="https://images.pexels.com/photos/1796706/pexels-photo-1796706.jpeg?auto=compress&cs=tinysrgb&w=1200"
            />
            <MustSeeCard
              title="ワーナー・ブラザーズ スタジオツアー"
              image="https://images.pexels.com/photos/1156684/pexels-photo-1156684.jpeg?auto=compress&cs=tinysrgb&w=1200"
              badge="人気"
            />
            <MustSeeCard
              title="クリスマス・ライトツアー"
              image="https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=1200"
            />
            <MustSeeCard
              title="ロンドンパス"
              image="https://images.pexels.com/photos/3800079/pexels-photo-3800079.jpeg?auto=compress&cs=tinysrgb&w=1200"
              badge="最大 30% お得"
            />
          </div>
        </div>
      </section> */}

      {/* 初めてのロンドン */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
            <div>
              <Badge className="mb-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                初めてロンドンを訪れる方へ
              </Badge>
              <h2 className="mb-3 text-2xl font-semibold text-slate-900">
                ロンドン完全ガイド
              </h2>
              <p className="mb-3 text-sm text-slate-700">
                レストラン、ホテル、美術館、シアター、ミュージカル、観光スポットなど、最高の体験を紹介します。
              </p>
              <p className="mb-4 text-sm text-slate-700">
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
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                ロンドンをもっと探索
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
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
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 grid gap-8 lg:grid-cols-[1.2fr,1fr]">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                ロンドンの催し物
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
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
    <Card className="overflow-hidden border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-32 w-full">
        <Image src={image} alt={title} fill className="object-cover" />
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-red-600 shadow">
            {badge}
          </span>
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-xs font-medium text-slate-900">{title}</p>
      </CardContent>
    </Card>
  );
}

function InfoPill({ title, href }: { title: string; href: string }) {
  return (
    <Link href={href}>
      <button className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-xs font-medium text-slate-800 shadow-sm hover:border-slate-300">
        {title}
      </button>
    </Link>
  );
}

function ExploreCard({ title, href }: { title: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="h-full border-slate-200 shadow-sm">
        <CardContent className="flex h-full flex-col justify-between p-4">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-3 text-[11px] text-slate-500">
            厳選されたヒント、地図、知っておくべき情報を紹介します。
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

type AttractionProps = {
  title: string;
  description: string;
  price: string;
};

function AttractionCard({ title, description, price }: AttractionProps) {
  return (
    <Card className="h-full border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col justify-between p-4">
        <div>
          <h3 className="mb-1 text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600">{description}</p>
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-900">{price}</p>
      </CardContent>
    </Card>
  );
}

function PillButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:border-slate-300">
      {children}
    </button>
  );
}

function FooterLink({ children }: { children: React.ReactNode }) {
  return (
    <button className="text-[11px] text-slate-500 underline-offset-2 hover:underline">
      {children}
    </button>
  );
}
