import Link from "next/link";
import {
  Baby,
  Banknote,
  CalendarClock,
  Clock,
  Compass,
  Frame,
  Landmark,
  Luggage,
  MapPin,
  Palette,
  SprayCan,
  Ticket,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { museumsFaqItems } from "@/components/museums/faq";

type HubMuseum = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  price: number;
  address: string;
  image: string;
};

type MuseumsHubProps = {
  topMuseums: HubMuseum[];
  totalCount: number;
  freeCount: number;
  kidsCount: number;
};

/** テーマ別の入口。ハブの役割は「どのページへ行けばいいか」を決めさせること。 */
const THEME_LINKS = [
  {
    href: "/museums/best-10-museums",
    icon: Landmark,
    title: "絶対に行くべき10館",
    description:
      "初めてのロンドンならまずここから。大英博物館やナショナル・ギャラリーなど、外さない10館を見どころ付きで。",
    eyebrow: "Best 10",
  },
  {
    href: "/museums/all-museums",
    icon: Compass,
    title: "全館から探す",
    description:
      "無料かどうか、子ども連れ向きか、おすすめ度で絞り込み。地図からも探せます。",
    eyebrow: "All",
  },
  {
    href: "/museums/best-museums-for-kids",
    icon: Baby,
    title: "子どもと行く",
    description:
      "触れる展示やワークショップが充実した館。恐竜、宇宙、体験型の展示が揃います。",
    eyebrow: "For Kids",
  },
  {
    href: "/museums/banksy-artworks",
    icon: SprayCan,
    title: "街で見つけるバンクシー",
    description:
      "美術館の外にもアートはあります。ロンドン市内に残るバンクシー作品を地図で。",
    eyebrow: "Street Art",
  },
];

/** 現地で効く実用情報。抽象的な心構えではなく、行動が変わる事実だけを置く。 */
const PRACTICAL_TIPS = [
  {
    icon: Banknote,
    title: "常設展は無料、特別展は有料",
    body: "国立館の常設展は無料で予約も不要。お金がかかるのは特別展だけで、相場は£15〜25です。入口の寄付は任意で、断っても入れます。",
  },
  {
    icon: Clock,
    title: "朝いちか、金曜の夜",
    body: "開館直後の1時間は目当ての展示室が空いています。金曜は夜間開館する館が多く、20時や22時まで開いている日は日中よりずっと静かです。",
  },
  {
    icon: Luggage,
    title: "スーツケースは持ち込めない",
    body: "大型荷物は預かってもらえないことが多く、クロークも有料(£5〜7)。到着日に寄るなら、駅の荷物預かりを先に使ってください。",
  },
  {
    icon: Ticket,
    title: "特別展は日時指定で先に売り切れる",
    body: "話題の展覧会は数週間先まで満席になります。日程が決まった時点で公式サイトから押さえるのが確実です。",
  },
  {
    icon: MapPin,
    title: "サウス・ケンジントンは3館が徒歩圏",
    body: "自然史博物館・V&A・科学博物館が隣接。駅から地下通路でつながっており、雨の日でも濡れずに移動できます。",
  },
  {
    icon: Frame,
    title: "全部見ようとしない",
    body: "大英博物館もV&Aも1日で回りきれる規模ではありません。見たい部屋を3つ決めて2時間で切り上げるほうが、記憶に残ります。",
  },
];

export default function MuseumsHub({
  topMuseums,
  totalCount,
  freeCount,
  kidsCount,
}: MuseumsHubProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-14 md:py-10">
      {/* Hero */}
      <section className="space-y-5">
        <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Museums &amp; Galleries
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          ロンドンの美術館・博物館
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          世界有数のコレクションが、その大半を無料で公開している。
          これがロンドンという街の、少しおかしなところです。
          ロゼッタ・ストーンも、ゴッホの《ひまわり》も、ダイナソーの全身骨格も、
          チケット売り場を通らずに見られます。
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          問題はむしろ、多すぎることです。このページでは
          {totalCount}館の中からどこを選ぶか、いつ行けば空いているか、
          何を見て帰るかを決められるように情報を整理しました。
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild>
            <Link href="/museums/best-10-museums">
              まず10館から見る
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/museums/all-museums">全{totalCount}館を探す</Link>
          </Button>
        </div>

        {/* 数字で概況を掴ませる */}
        <dl className="grid grid-cols-3 gap-3 pt-2 sm:max-w-lg">
          {[
            { label: "掲載館数", value: totalCount, unit: "館" },
            { label: "常設展が無料", value: freeCount, unit: "館" },
            { label: "子ども向き", value: kidsCount, unit: "館" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-bold tracking-tight">
                {stat.value}
                <span className="ml-0.5 text-sm font-medium text-muted-foreground">
                  {stat.unit}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* テーマ別の入口 */}
      <section className="space-y-5">
        <div>
          <span className="inline-block rounded-full bg-sky-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Browse
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            目的から選ぶ
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {THEME_LINKS.map(({ href, icon: Icon, title, description, eyebrow }) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full border border-border transition hover:border-indigo-400 hover:shadow-md">
                <CardContent className="flex gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {eyebrow}
                    </p>
                    <h3 className="font-bold tracking-tight transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 代表的な館 */}
      {topMuseums.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                Highlights
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                まずこの館へ
              </h2>
            </div>
            <Link
              href="/museums/best-10-museums"
              className="shrink-0 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              10館すべて見る →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topMuseums.map((m) => (
              <Link key={m.id} href={`/museums/${m.slug}`} className="group block">
                <Card className="h-full overflow-hidden border border-border transition hover:shadow-lg">
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    <img
                      src={m.image}
                      alt={m.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    {m.price === 0 && (
                      <Badge className="absolute right-2 top-2 bg-emerald-600 text-white hover:bg-emerald-600">
                        常設展 無料
                      </Badge>
                    )}
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <h3 className="font-bold tracking-tight transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {m.name}
                    </h3>
                    {m.tagline && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {m.tagline}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{m.address}</span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 実用Tips */}
      <section className="space-y-5">
        <div>
          <span className="inline-block rounded-full bg-amber-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Before You Go
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            行く前に知っておくこと
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRACTICAL_TIPS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                <h3 className="font-semibold tracking-tight">{title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 一日の組み立て方 */}
      <section className="space-y-5">
        <div>
          <span className="inline-block rounded-full bg-rose-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Itinerary
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            美術館の一日の組み立て方
          </h2>
        </div>

        <ol className="space-y-4">
          {[
            {
              time: "10:00",
              title: "開館と同時に、大きい館へ",
              body: "大英博物館やV&Aのような巨大な館は、最初の1時間が勝負です。目当ての展示室に直行してください。エジプトのミイラもロゼッタ・ストーンも、11時を過ぎると人だかりの後ろから覗くことになります。",
            },
            {
              time: "12:30",
              title: "館内のカフェで休む",
              body: "V&Aのカフェは世界最古の美術館レストランで、内装そのものが展示品です。館内の食事は割高ですが、外に出て並び直す時間を考えれば悪くない選択。クリームティー(紅茶+スコーン+クロテッドクリームとジャム)が定番です。",
            },
            {
              time: "14:00",
              title: "2館目は小さめの館を",
              body: "午後は集中力が落ちます。コートールド・ギャラリーやウォレス・コレクションのような、1〜2時間で見きれる規模の館がちょうどいい。同じ密度で2館続けると、何を見たか思い出せなくなります。",
            },
            {
              time: "16:30",
              title: "ショップは閉館30分前までに",
              body: "ミュージアムショップは閉館と同時に閉まります。図録や限定グッズが目当てなら、展示を切り上げてでも先に寄ってください。大英博物館のロゼッタ・ストーングッズは定番のお土産です。",
            },
          ].map((step) => (
            <li
              key={step.time}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 sm:flex-row sm:gap-5"
            >
              <div className="flex shrink-0 items-start gap-2 sm:w-24">
                <CalendarClock className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 sm:mt-0.5" />
                <span className="font-mono text-sm font-bold tracking-tight">
                  {step.time}
                </span>
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="font-semibold tracking-tight">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 見方のヒント */}
      <section className="space-y-5">
        <div>
          <span className="inline-block rounded-full bg-violet-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            How to Look
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            展示の「並び方」を見る
          </h2>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            多くの人は作品そのものを見るために美術館へ行きます。ただ、
            <span className="font-medium text-foreground">
              何がどの順で並べられているか
            </span>
            に目を向けると、同じ展示室がまったく違って見えてきます。
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            大英博物館は「分類」と「網羅」が軸です。ロゼッタ・ストーン、アッシリアのレリーフ、
            アフリカの仮面が、文明ごと・時代ごとに整列している。19世紀の百科事典の中を
            歩いているような構成で、これは大英帝国が世界をどう理解しようとしたかの記録でもあります。
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            対してテート・モダンは、時代順を捨てて「テーマ」で並べます。1950年代の絵と
            2010年代の映像作品が同じ部屋にある。作品同士を衝突させて意味を立ち上げる構成です。
            どちらが正しいという話ではなく、
            <span className="font-medium text-foreground">
              並べ方そのものが主張
            </span>
            だと気づくと、キャプションを読む楽しみが増えます。
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Palette className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
            <p className="text-sm text-muted-foreground">
              各館の見どころは
              <Link
                href="/museums/all-museums"
                className="mx-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                個別ページ
              </Link>
              で作品ごとに解説しています。
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-5">
        <div>
          <span className="inline-block rounded-full bg-slate-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            FAQ
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">よくある質問</h2>
        </div>
        <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-5">
          {museumsFaqItems.map((item, i) => (
            <AccordionItem
              key={item.question}
              value={`faq-${i}`}
              className={i === museumsFaqItems.length - 1 ? "border-b-0" : ""}
            >
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 締め */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-indigo-50 via-background to-sky-50 p-8 text-center dark:from-indigo-950/30 dark:via-background dark:to-sky-950/20">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          どこから始めますか
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          全{totalCount}館を、無料かどうか・子ども連れ向きか・おすすめ度で絞り込めます。
          地図表示から、泊まる場所の近くを探すこともできます。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/museums/all-museums">全{totalCount}館を探す</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sightseeing">ロンドン観光ガイドへ</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
