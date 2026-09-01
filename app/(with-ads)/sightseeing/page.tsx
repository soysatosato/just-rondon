export const revalidate = 60 * 60;

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { CalendarRange } from "lucide-react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import PhotoRail from "@/components/home/PhotoRail";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  faqPageJsonLd,
  sightseeingBreadcrumbJsonLd,
  sightseeingHubCollectionJsonLd,
} from "@/components/sightseeing/jsonld";
import { sightseeingFaqItems } from "@/components/sightseeing/faq";
import {
  travelGuidePath,
  travelGuides,
} from "@/components/sightseeing/guides/guides";
import {
  AREAS_BASE,
  areaGuidePath,
  areaGuides,
} from "@/components/sightseeing/areas/areas";
import { fetchSightseeingHub } from "@/utils/sightseeing";

const PAGE_TITLE =
  "ロンドン観光ガイド | 定番スポット・宿泊・移動手段・モデルコース";
const PAGE_DESCRIPTION =
  "初めてのロンドン旅行に。ロンドン塔や大英博物館などの定番スポットに加え、どのエリアに泊まるか、地下鉄とタッチ決済の使い方、1〜5日のモデルコース、両替・治安・eSIMまで、旅の準備から現地の歩き方までまとめたロンドン観光ガイドです。";

export const metadata = buildPageMetadata({
  path: "/sightseeing",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ロンドン観光",
    "ロンドン 観光スポット",
    "ロンドン 旅行",
    "ロンドン モデルコース",
    "ロンドン ホテル エリア",
    "ロンドン 地下鉄",
    "オイスターカード",
    "ロンドン 旅行 準備",
    "ロンドン 定番",
    "ロンドン 子連れ",
    "ロンドン 無料",
    "ロンドン 見どころ",
  ],
});

/*
 * /sightseeing ハブの構成。
 *
 * 旧版は「写真 + 見出し + 2行」の同型カードを12ブロック積んでいて、
 * 約11画面あった。トップページを組み替えたときと同じ問題を抱えていた。
 *
 *   - ロケ地・ブループラーク・王室・ツアー・家族・無料が、全部
 *     同じ見た目のカルーセルだった。6本で約5画面を使いながら、
 *     区別がつかないので実質1本ぶんの情報量しか渡せていなかった。
 *   - royal-london / kids-free-activities / must-see が複数の
 *     ブロックに重複して出ていた。同じ導線を二度三度置いていた。
 *   - Today's Picks は slug のアルファベット順から日替わりで3件
 *     拾っているだけで、選定の意図が無く、他の棚と中身が被った。
 *
 * そこで、上から順に「実物 → 場所 → テーマ → 実務」に組み替えた。
 *
 *   1. 見出し    このセクションが何を渡すかを3段落で
 *   2. 名所の棚  DBの写真と固有名詞を横スクロールで3列(旧カード群の置換)
 *   3. エリア    街区ごとの半日ルート6本。表紙写真はDBから借りる
 *   4. テーマ    旧6カルーセルを、文字だけのタイル1グリッドに集約
 *   5. 旅の準備  8本のガイドを意思決定順の番号付きリストに
 *   6. FAQ       JSON-LD と対で残す
 *
 * 色は観光=赤を基調にし、テーマのタイルだけ区分ごとに振り分ける。
 * 棚の見出しと索引の細い罫にしか色を載せないのはトップと同じ方針。
 */

/**
 * テーマ特集への導線。
 *
 * 旧版はこれを6つのカルーセル(ロケ地・ブループラーク・王室・ツアー・
 * 家族・無料)に展開し、各特集の中身まで並べていた。写真を出しても
 * 特集そのものの写真ではなく代表スポットの写真になるため、
 * 上の「名所の棚」と同じ絵が二度出るだけだった。
 *
 * ここでは中身を見せるのをやめ、文字のタイルに畳んでいる。導線の
 * 一覧は網羅性が仕事で、6本ぶんの面積を使う理由が無い。無料と
 * 子ども向けは上で棚として出しているので、ここには入れない。
 *
 * blurb は各特集ページの description から起こしている。ハブ側で
 * 独自の売り文句を書くと、実際のページと食い違ったときに気づけない。
 */
const THEMES = [
  {
    href: "/sightseeing/harry-potter",
    eyebrow: "Harry Potter",
    label: "ハリー・ポッターの世界",
    blurb:
      "キングスクロス駅9¾番線、レドンホール・マーケット、ミレニアム橋。映画のロケ地と、スタジオツアーへの行き方を。",
    stripe: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-500",
  },
  {
    href: "/sightseeing/film-locations",
    eyebrow: "Film & TV",
    label: "映画・ドラマのロケ地",
    blurb:
      "221Bはベーカー街になく、王妃の宮殿は政府の迎賓館。作品ごとに、実際に訪ねられる場所だけを見学の可否つきで。",
    stripe: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-400",
  },
  {
    href: "/sightseeing/blue-plaques",
    eyebrow: "Blue Plaques",
    label: "ブループラーク巡り",
    blurb:
      "壁の青いプレートが記すのは、そこに住んだ作家や音楽家の住所。English Heritage の公式スキームだけをエリア別に。",
    stripe: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-400",
  },
  {
    href: "/sightseeing/royal-london",
    eyebrow: "Royal London",
    label: "王室ゆかりのロンドン",
    blurb:
      "バッキンガム宮殿のステート・アパートメント公開と衛兵交代式、王冠宝器のあるロンドン塔、ケンジントン宮殿のめぐり方。",
    stripe: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
  },
  {
    href: "/sightseeing/football",
    eyebrow: "Football",
    label: "プレミアリーグを観る",
    blurb:
      "一般販売は存在せず、転売チケットでは入場できません。会員制度の仕組みと6クラブの取りやすさを12本で。",
    stripe: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  {
    href: "/sightseeing/stadium-tours",
    eyebrow: "Stadium Tours",
    label: "スタジアムツアー",
    blurb:
      "試合が取れなくてもピッチには立てます。エミレーツ、スタンフォード・ブリッジ、トッテナム、ウェンブリーを比較。",
    stripe: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  {
    href: "/sightseeing/thames-cruise",
    eyebrow: "River Thames",
    label: "テムズ川クルーズ",
    blurb:
      "ビッグ・ベンからタワーブリッジまでを水上から。観光クルーズ、ナイト、ディナー、アフタヌーンティーの料金とルート。",
    stripe: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-400",
  },
  {
    href: "/sightseeing/christmas-markets",
    eyebrow: "Christmas",
    label: "クリスマスマーケット",
    blurb:
      "サウスバンク、ウィンターワンダーランド、ロンドンブリッジ。開催期間とアクセスを市ごとに。",
    stripe: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
  },
] as const;

export default async function Page() {
  const { rails, areas, totalSpots } = await fetchSightseeingHub();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <JsonLd data={sightseeingBreadcrumbJsonLd()} />
      <JsonLd
        data={sightseeingHubCollectionJsonLd(travelGuides, {
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
        })}
      />
      <JsonLd
        data={faqPageJsonLd(sightseeingFaqItems, `${SITE_URL}/sightseeing`)}
      />

      <Breadcrumbs path="/sightseeing" />

      {/*
        見出し。旧版は「世界的に有名な観光スポットがぎゅっと詰まって
        います」から始まっていて、どのガイドブックにも書いてあることを
        3段落使って繰り返していた。ここでは、実際に旅程を組むときに
        最初に破綻する点を先に出す。
      */}
      <header className="mt-6 max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          ロンドン観光ガイド
        </h1>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          ロンドン観光でつまずくのは「何を見るか」ではありません。
          <strong className="font-semibold">1日に何箇所入るか</strong>
          です。ロンドン塔は所要3時間〜、ウェストミンスター寺院は2〜3時間。
          この2つを同じ日に入れた時点で、その日はもう終わりです。
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          そこでこのガイドは、名所を並べるだけで終わらせません。各スポットのページに
          <strong className="font-semibold">料金・所要時間・最寄駅</strong>
          と、着いてからどの順に見るかを書いています。
          何を削るかを決められる材料を先に渡すのが目的です。
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          掲載は{totalSpots}件。宿・地下鉄・予算といった出発前の実務は、
          ページ下の「旅の準備」に分けてあります。
          <strong className="font-semibold">
            ETA（電子渡航認証）だけは無いと搭乗できない
          </strong>
          ので、そこから先に片付けてください。
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/sightseeing/itinerary">1〜5日のモデルコース →</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/sightseeing/all">スポット一覧（{totalSpots}件）→</Link>
        </Button>
      </div>

      <AdSenseUnit
        slot={AD_SLOTS.listing}
        className="mt-8"
        reservedHeight={120}
      />

      {/*
        1. 名所の棚。
        旧版の「メイン4カード」「必見スポット5カード」「王室」「ツアー」
        「家族」「無料」「Today's Picks」の置き換え。カード7ブロック
        (約6画面)が3列(約1.5画面)になり、見せられる件数は増えている。
      */}
      <section className="mt-14">
        {/* 棚の見出しは PhotoRail 側が h3 を出すので、束ねる h2 をここに置く。
            無いと h1 の次がいきなり h3 になり、見出しの階層が飛ぶ。 */}
        <div className="max-w-3xl border-b border-foreground/15 pb-5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-red-500" />
            Spots
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            名所を探す
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            行き先そのものから決めるなら、ここから。定番・入場無料・子ども連れの3つの並べ方で、
            同じスポットが重ならないように出しています。
          </p>
        </div>

        <div className="mt-10 space-y-12 sm:space-y-14">
          <PhotoRail
            eyebrow="Must-See"
            title="見逃せない名所"
            description="初めてのロンドンで外さない定番。料金と所要時間、着いてから何をどの順に見るかまで書いています。"
            href="/sightseeing/must-see"
            moreLabel="名所をすべて見る"
            items={rails.mustSee}
            accentClassName="bg-red-500"
          />
          <PhotoRail
            eyebrow="Free Entry"
            title="無料で入れる"
            description="国立の博物館・美術館は常設展が無料です。公園や街歩きを含めて、入場料のかからないスポット。"
            href="/sightseeing/free"
            moreLabel="無料スポットをすべて見る"
            items={rails.free}
            accentClassName="bg-red-500"
          />
          <PhotoRail
            eyebrow="With Kids"
            title="子どもと楽しむ"
            description="自然史博物館やサイエンス・ミュージアムなど、子どもと1日いられる場所。多くは入場無料です。"
            href="/sightseeing/kids-free-activities"
            moreLabel="子ども向けをすべて見る"
            items={rails.kids}
            accentClassName="bg-red-500"
          />
        </div>
      </section>

      {/*
        2. エリア。
        表紙写真はエリアガイド側が持っていないので、そのエリアで最も
        推しているスポットの写真を借りている(fetchSightseeingHub)。
        エリアに写真用のカラムを足さないのは、スポットが入れ替われば
        表紙も自動で追随したほうが、手で貼り替えるより古びないため。
      */}
      <section className="mt-16">
        <div className="max-w-3xl border-b border-foreground/15 pb-5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-red-500" />
            Neighbourhoods
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            エリアで歩く
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            地下鉄で点から点へ飛ぶより、街区ごとにまとめて歩いたほうが速く回れます。
            6つのエリアについて、半日の回遊ルートと最寄駅、歩く時間の目安をまとめました。
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {areaGuides.map((area) => {
            const summary = areas[area.slug];
            return (
              <Link
                key={area.slug}
                href={areaGuidePath(area.slug)}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {summary?.image && (
                    <img
                      src={summary.image}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  {summary?.count ? (
                    <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                      {summary.count}スポット
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {area.eyebrow}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-snug decoration-1 underline-offset-2 group-hover:underline">
                    {area.label}
                  </p>
                  <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {area.blurb}
                  </p>
                  <p className="mt-3 border-t pt-2.5 text-[11px] leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      歩く目安 {area.walkTime}
                    </span>
                    <span className="mt-0.5 block truncate">
                      {area.station}
                    </span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-5 text-sm">
          <Link
            href={AREAS_BASE}
            className="font-semibold text-red-700 underline-offset-4 hover:underline dark:text-red-400"
          >
            エリアガイドのトップへ →
          </Link>
        </p>
      </section>

      {/* 3. テーマ。旧版の6カルーセル(約5画面)をここ1グリッドに畳んでいる。 */}
      <section className="mt-16">
        <div className="max-w-3xl border-b border-foreground/15 pb-5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-red-500" />
            Themes
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            テーマで巡る
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            ひとつの興味を軸に、市内を横断して回る特集です。
            エリアをまたぐので、上の街区別ガイドとは別に組んでいます。
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {THEMES.map((theme) => (
            <Link key={theme.href} href={theme.href} className="group block">
              <div className="flex h-full gap-3.5 rounded-lg border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                <span
                  className={`w-1 shrink-0 rounded-full ${theme.stripe}`}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span
                    className={`block text-[10px] font-bold uppercase tracking-[0.15em] ${theme.text}`}
                  >
                    {theme.eyebrow}
                  </span>
                  <span className="mt-1 block text-sm font-bold leading-snug decoration-1 underline-offset-2 group-hover:underline">
                    {theme.label}
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
                    {theme.blurb}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/*
        4. 旅の準備。
        旧版は同型カード8枚のグリッドだった。travelGuides の並びは
        guides.ts のコメントどおり「旅行者の意思決定順」なので、
        番号を振って順番そのものを見せる形にした。カードを縦に積むより、
        「上から片付ける」という読み方が伝わる。
      */}
      <section className="mt-16">
        <div className="max-w-3xl border-b border-foreground/15 pb-5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-sky-500" />
            Travel Essentials
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            旅の準備
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            上から順に片付けると手戻りがありません。ETAが無いと搭乗できず、
            宿と移動が決まらないと予算が積めないためです。
          </p>
        </div>

        <ol className="mt-8 divide-y overflow-hidden rounded-xl border bg-card">
          {travelGuides.map((guide, idx) => (
            <li key={guide.slug}>
              <Link
                href={travelGuidePath(guide.slug)}
                className="group flex gap-4 p-4 transition-colors hover:bg-muted/50"
              >
                <span className="w-7 shrink-0 pt-0.5 text-sm font-bold tabular-nums text-sky-600 dark:text-sky-400">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    {guide.eyebrow}
                  </span>
                  <span className="mt-0.5 block text-sm font-bold leading-snug decoration-1 underline-offset-2 group-hover:underline">
                    {guide.label}
                  </span>
                  <span className="mt-1.5 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {guide.blurb}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {/*
          ガイドを読んで行き先が決まった人の受け皿。travelGuides には
          入れていない——あちらは読み物の並びで、関連ガイドの一覧や
          CollectionPage の JSON-LD にも流れる。道具を記事として
          数えると、どちらの一覧も意味がぼやける。
        */}
        <Link
          href="/plan"
          className="group mt-4 flex items-center gap-4 rounded-xl border border-indigo-300 bg-indigo-50/60 p-4 transition hover:border-indigo-500 dark:border-indigo-900 dark:bg-indigo-950/30"
        >
          <CalendarRange
            className="h-6 w-6 shrink-0 text-indigo-600 dark:text-indigo-400"
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
              Trip Planner
            </span>
            <span className="mt-0.5 block text-sm font-bold leading-snug decoration-1 underline-offset-2 group-hover:underline">
              行き先が決まったら、旅行プランを組む
            </span>
            <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
              選んだスポットを日別に並べて、入場料の合計・滞在時間・スポット間の
              徒歩距離を出します。順路は地図に出て、1日に詰め込みすぎているときは
              警告します。決めかねているなら、ひな形を読み込んで削っていくのが早いです。
            </span>
          </span>
        </Link>
      </section>

      {/* 5. FAQ。FAQPage の JSON-LD と対で残す。 */}
      <section className="mt-16">
        <div className="max-w-3xl border-b border-foreground/15 pb-5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-red-500" />
            FAQ
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            よくある質問
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className="mt-6 divide-y rounded-xl border bg-card"
        >
          {sightseeingFaqItems.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="border-none"
            >
              <AccordionTrigger className="px-5 py-4 text-left">
                <span className="text-sm font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                <div className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                  {faq.answer.map((line, i) => (
                    <div key={i} className="flex gap-1.5">
                      <span className="shrink-0">・</span>
                      <div className="prose prose-sm prose-slate max-w-none dark:prose-invert prose-p:my-0">
                        <ReactMarkdown>{line}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
