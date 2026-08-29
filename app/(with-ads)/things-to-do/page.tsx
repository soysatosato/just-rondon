import Link from "next/link";

import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import ExperienceBlock, {
  type Experience,
} from "@/components/things-to-do/ExperienceBlock";
import PhotoTile from "@/components/things-to-do/PhotoTile";
import { fetchThingsToDoPhotos } from "@/utils/actions/things-to-do";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

/*
 * 「体験する」区分のハブ。
 *
 * かつては /living と同じ SectionHub(罫線で区切った文字だけの索引)で
 * 描いていた。索引という選択そのものは、区分ハブに来る読者がまだ
 * 「どれを読むか」を決めていない以上、間違いではない。ただしこの区分では
 * 次の3点で機能していなかった。
 *
 *   - 配下5セクションの実体はすべて写真つきで DB にあるのに、ハブには
 *     1枚も出ていなかった。サイトで最も絵になる区分が、最も文字だけの
 *     ページになっていた。
 *   - 索引の一覧性が効くのは10〜40本のときで、5本だと連番と余白だけが残る。
 *   - 5枚が同じ形(英字+見出し+一文+ピル)なので、数週間前に予約しないと
 *     成立しない観劇と、当日ぶらっと見るお土産が同じ重さで並んでいた。
 *     「予約が要る順」という並びの根拠が、見た目に一切出ていなかった。
 *
 * そこで、区分名の索引をやめて「何をするか」で組み直した。見出しは動詞に、
 * 並びの根拠(予約が要る順)はヒーローの段取りとして明示し、各ブロックには
 * 実物の写真を出す。/living は索引のままにしている。ビザ・住まい・口座に
 * 写真は要らず、読者もタスク駆動で来るので、あちらは索引が正しい。
 *
 * 写真は6区分ぶんまとめて1日キャッシュする(utils/actions/things-to-do.ts)。
 * ページ側の revalidate も同じ長さにして、演目やお土産の入れ替えが
 * 遅くとも1日で反映されるようにしている。
 */
export const revalidate = 60 * 60 * 24;

const PATH = "/things-to-do";
const TITLE = "体験する";
const LEAD =
  "見るだけでは終わらない過ごし方。劇場に座り、パブで注文し、市場で値段を聞く。この街でしかできないことを、作法と段取りから。";

export const metadata = buildPageMetadata({
  path: PATH,
  title: "ロンドンで体験する｜観劇・食事・買い物のガイド",
  description:
    "ウエストエンドの観劇、パブとイギリス料理、マーケットとデパートの買い物、イギリスのブランドとお土産。ロンドンで「する」ことを、チケットの取り方や店での振る舞いといった段取りから解説します。",
  keywords: [
    "ロンドン 体験",
    "ロンドン ミュージカル",
    "ロンドン パブ",
    "ロンドン 買い物",
    "ロンドン お土産",
  ],
});

/**
 * ヒーローに置く段取り。
 *
 * 並び順の根拠を文章で書くのではなく、いつ手を打つ話なのかを先に見せる。
 * ここを読めば、下のブロックを上から読む理由(予約が要る順)が分かる。
 */
const PLAN = [
  {
    when: "数週間前",
    what: "観劇のチケットを取る",
    why: "人気演目と土曜の夜から埋まる。現地に着いてからでは決まらない、唯一の項目。",
  },
  {
    when: "前日〜当日",
    what: "食事の店を決める",
    why: "予約が要るのはアフタヌーンティーと日曜のロースト。パブは飛び込みでいい。",
  },
  {
    when: "現地で",
    what: "買い物に出る",
    why: "市場は曜日で中身が変わり、日曜は営業時間が法律で制限されている。確認はそこだけ。",
  },
];

/** 並びは「予約が要る順」。上の PLAN と同じ順序で、根拠もそちらに書いている。 */
const EXPERIENCES: Experience[] = [
  {
    href: "/musicals",
    eyebrow: "West End",
    verb: "劇場に座る",
    label: "ミュージカル",
    blurb:
      "上演中の演目と、チケットを実際に取るまでの手順。当日券の並び方、劇場ごとの見え方の癖、英語が分からなくても楽しめる演目の選び方まで。",
    links: [
      { href: "/musicals/west-end-tickets", label: "チケットの取り方" },
      { href: "/musicals/west-end-etiquette", label: "観劇のマナー" },
      { href: "/musicals/theatres", label: "劇場ガイド" },
      { href: "/musicals/shows-without-english", label: "英語が不安なら" },
    ],
  },
  {
    href: "/restaurants",
    eyebrow: "Eat & Drink",
    verb: "パブで注文する",
    label: "レストランとお店",
    blurb:
      "料理から店を選ぶための一覧と、店に入ってからの話。パブはカウンターで先に払う、予約が取れない店にも入り方がある——知らないと必ずつまずく前提をまとめています。",
    links: [
      { href: "/restaurants/pub-etiquette", label: "パブの作法" },
      { href: "/restaurants/must-visit", label: "絶対行くべき超人気店" },
    ],
  },
  {
    href: "/shopping",
    eyebrow: "Shopping",
    verb: "市場で値段を聞く",
    label: "ロンドンの買い物",
    blurb:
      "どこで買うかと、買い方の前提。市場は曜日で中身が変わり、日曜は営業時間が法律で制限されます。免税制度の現状もここに。",
    links: [
      { href: "/shopping/markets", label: "マーケット（曜日別）" },
      { href: "/shopping/department-stores", label: "デパート" },
      { href: "/shopping/vat-refund", label: "免税は使えるのか" },
    ],
  },
  {
    href: "/brands",
    eyebrow: "British Brands",
    verb: "現地でしか買えないものを買う",
    label: "イギリスのブランド",
    blurb:
      "創業の背景と、ロンドンで実際に買える店舗を品目ごとに。日本より安いブランドは多いのですが、理由は免税ではなく元の定価差です。",
  },
  {
    href: "/souvenirs",
    eyebrow: "Souvenirs",
    verb: "持ち帰るものを選ぶ",
    label: "ロンドンのお土産",
    blurb:
      "定番の紅茶やビスケットから配りやすい小物まで、値段と買える場所を品目ごとに。渡す相手ごとの向き不向きも書いています。",
  },
];

export default async function ThingsToDoPage() {
  const photos = await fetchThingsToDoPhotos();

  /*
   * ヒーローのモザイクは3枚。主役に演目、脇に料理とマーケットを置いて、
   * 「観る・食べる・買う」がひと目で揃うようにしている。同じ大きさの箱を
   * 並べるとサムネイル一覧に見えるので、主役だけ2列2行で取る。
   * 写真が足りないときは、あるぶんだけ詰める。
   */
  const heroTiles = [
    photos.musicals[0],
    photos.dishes[0],
    photos.shopping[0],
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <JsonLd data={breadcrumbListJsonLd({ path: PATH })} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${absoluteUrl(PATH)}#collection`,
          name: TITLE,
          description: LEAD,
          inLanguage: "ja",
          url: absoluteUrl(PATH),
          hasPart: EXPERIENCES.map((experience) => ({
            "@type": "WebPage",
            name: experience.label,
            description: experience.blurb,
            url: absoluteUrl(experience.href),
          })),
        }}
      />

      <Breadcrumbs path={PATH} />

      {/* 1. ヒーロー。左に文言と段取り、右に実物の写真。 */}
      <section className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-500">
            Things to Do
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-none tracking-tight md:text-5xl">
            {TITLE}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {LEAD}
          </p>

          <ol className="mt-7 space-y-4 border-l-2 border-amber-500/40 pl-4">
            {PLAN.map((step) => (
              <li key={step.what}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-500">
                  {step.when}
                </p>
                <p className="mt-0.5 text-sm font-bold">{step.what}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {step.why}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {heroTiles.length > 0 && (
          <div className="grid h-[300px] grid-cols-3 grid-rows-2 gap-2 sm:h-[400px] lg:col-span-7 lg:h-[460px]">
            <PhotoTile
              item={heroTiles[0]}
              size="lg"
              priority
              className="col-span-2 row-span-2"
            />
            {heroTiles.slice(1).map((item) => (
              <PhotoTile key={item.href} item={item} size="md" />
            ))}
          </div>
        )}
      </section>

      {/* 2. 何をするか。ブロックの並びはヒーローの段取りと同じ順序。 */}
      <div className="mt-12 space-y-9">
        <ExperienceBlock
          index={1}
          experience={EXPERIENCES[0]}
          items={photos.musicals}
        />
        <ExperienceBlock
          index={2}
          experience={EXPERIENCES[1]}
          items={photos.dishes}
        />
        <ExperienceBlock
          index={3}
          experience={EXPERIENCES[2]}
          items={photos.shopping}
        />

        {/* ブランドとお土産はどちらも「買って帰る」話なので横に並べる。
            単独で1ブロック取ると、観劇と同じ重さに見えてしまう。 */}
        <div className="grid gap-9 md:grid-cols-2 md:gap-7">
          <ExperienceBlock
            index={4}
            experience={EXPERIENCES[3]}
            items={photos.brands}
            variant="compact"
          />
          <ExperienceBlock
            index={5}
            experience={EXPERIENCES[4]}
            items={photos.souvenirs}
            variant="compact"
          />
        </div>
      </div>

      <AdSenseUnit slot={AD_SLOTS.listing} className="mt-12" />

      {/*
        3. テーマ巡り。
        以前は最下部の灰色の箱に、灰色のピルを5つ並べていた。ハリー・ポッターも
        フットボールも、この区分では最も強く探されている入口なので、写真の帯に
        昇格させている。解説の本体は観光ガイドの側にある。
      */}
      {photos.themes.length > 0 && (
        <section className="mt-12 border-t pt-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            By Theme
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            テーマで街を巡る
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            特定の作品や競技を目当てに歩くなら、場所の側から入る方が早い。以下は観光ガイドの中にあります。
          </p>

          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {photos.themes.map((item) => (
              <li key={item.href} className="aspect-[4/3]">
                <PhotoTile item={item} size="md" className="h-full w-full" />
              </li>
            ))}
          </ul>

          <ul className="mt-4 flex flex-wrap gap-2">
            {[
              { href: "/sightseeing/stadium-tours", label: "スタジアムツアー" },
              {
                href: "/sightseeing/kids-free-activities",
                label: "子どもと無料で楽しむ",
              },
              { href: "/events/calendar", label: "年間イベントカレンダー" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
