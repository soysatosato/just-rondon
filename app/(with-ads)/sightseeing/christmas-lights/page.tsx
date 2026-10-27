import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Footprints, MapPin, Route as RouteIcon } from "lucide-react";

import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import { londonDate } from "@/lib/publish-schedule";
import { hubOgImage } from "@/lib/og-hubs";
import {
  SEASON_CHECKED,
  formatDay,
  formatFullDate,
  formatRange,
  resolveItems,
  seasonYear,
  statusOn,
  type ResolvedItem,
  type SeasonSource,
} from "@/lib/christmas";
import {
  LIGHTS_ROUTES,
  googleMapsWalkingUrl,
  routeDistanceKm,
  routeWalkMinutes,
} from "@/lib/christmas/routes";
import { getDusk } from "@/lib/london-months/sun";
import { encodePlan } from "@/lib/plan";
import { SIGHTSEEING_PUBLISHER } from "@/components/sightseeing/jsonld";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import GuideSectionNav from "@/components/guides/GuideSectionNav";
import ChristmasHero from "@/components/christmas/ChristmasHero";
import ChristmasSeriesNav from "@/components/christmas/ChristmasSeriesNav";
import XmasSection from "@/components/christmas/XmasSection";
import StatusChip from "@/components/christmas/StatusChip";
import RouteMapLazy from "@/components/christmas/RouteMapLazy";

/**
 * ロンドンのクリスマスのイルミネーション(/sightseeing/christmas-lights)。
 *
 * 通りごとの点灯日(公式発表を確かめたものだけ)と、日の入りから歩く順路。
 * 点灯日は lib/christmas/lights.ts、順路は lib/christmas/routes.ts が持つ。
 * コヴェント・ガーデンとトラファルガー広場はマーケット比較のデータから
 * 「灯り」として読む(lib/christmas/markets.ts の hubKind)。
 *
 * 2026年は、オックスフォード・ストリートの中心部が10月26日から車両通行止め
 * になった最初の冬。灯りのバスツアーはこの区間を走れないので、歩く順路を
 * 主役にしている。
 */
export const revalidate = 60 * 60;

const PATH = "/sightseeing/christmas-lights";
/** 順路を旅行プランに入れるときの、立ち寄り1ヶ所あたりの滞在(分)。 */
const LIGHTS_STOP_MINUTES = 15;
const TITLE = "ロンドンのクリスマスのイルミネーション";

export async function generateMetadata(): Promise<Metadata> {
  const year = seasonYear(londonDate(new Date()));
  return buildPageMetadata({
    path: PATH,
    title: `ロンドンのイルミネーション${year}｜通りごとの点灯日と、歩いて回る順路`,
    description:
      "ロンドンのクリスマスのイルミネーションを、通りごとの点灯日(公式発表を確かめたもの)と、日の入りから歩く2つの順路でまとめました。車の入らなくなったオックスフォード・ストリート、リージェント・ストリートの天使の灯り、コヴェント・ガーデンのツリーまで。",
    keywords: [
      "ロンドン イルミネーション",
      `ロンドン イルミネーション ${year}`,
      "ロンドン イルミネーション いつまで",
      "ロンドン クリスマス イルミネーション",
      "リージェントストリート イルミネーション",
      "オックスフォードストリート イルミネーション",
      "London Christmas lights",
    ],
    images: [hubOgImage("christmas-lights")],
    type: "article",
  });
}

/** 灯りが映える時間の表に出す日付。点灯の時期から年明けまで。 */
function duskDates(year: number): string[] {
  return [
    `${year}-11-05`,
    `${year}-11-20`,
    `${year}-12-01`,
    `${year}-12-15`,
    `${year}-12-21`,
    `${year + 1}-01-01`,
  ];
}

function SourceLine({ sources, checkedAt }: { sources: SeasonSource[]; checkedAt: string }) {
  return (
    <p className="mt-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
      出典:{" "}
      {sources.map((source, i) => (
        <span key={source.url}>
          {i > 0 && "、"}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link underline underline-offset-2"
          >
            {source.label}
          </a>
        </span>
      ))}
      ({formatFullDate(checkedAt)}確認)
    </p>
  );
}

function LightCard({ item, today }: { item: ResolvedItem; today: string }) {
  const edition = item.edition;
  const fromMarkets = item.href.startsWith("/sightseeing/christmas-markets");
  return (
    <article
      id={item.slug}
      className="scroll-mt-28 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 dark:border-amber-900/50 dark:from-amber-950/20 dark:to-neutral-950"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug">{item.title}</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">{item.engTitle}</p>
        </div>
        <StatusChip status={statusOn(edition, today, item.kind)} kind={item.kind} />
      </div>
      <p className="mt-3 text-base font-semibold tabular-nums text-amber-900 dark:text-amber-200">
        {edition ? formatRange(edition) : `未発表(${item.usualTiming})`}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{item.summary}</p>
      {edition?.notes && edition.notes.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-neutral-700 marker:text-amber-500 dark:text-neutral-300">
          {edition.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      <p className="mt-3 flex items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300">
        <MapPin className="h-4 w-4 shrink-0 text-red-700 dark:text-red-400" aria-hidden="true" />
        {item.station}
      </p>
      {fromMarkets && (
        <p className="mt-2 text-sm">
          <Link href={item.href} className="text-link underline underline-offset-2">
            行き方と見どころ(マーケット比較のページ)
          </Link>
        </p>
      )}
      {edition && <SourceLine sources={edition.sources} checkedAt={edition.checkedAt} />}
    </article>
  );
}

export default function ChristmasLightsPage() {
  const today = londonDate(new Date());
  const year = seasonYear(today);
  const items = resolveItems(year);
  const lights = items.filter((i) => i.kind === "lights");
  const bySlug = new Map(items.map((i) => [i.slug, i]));

  const dusk = duskDates(year).map((date) => {
    const [y, m, d] = date.split("-").map(Number);
    return { date, ...getDusk(y, m, d) };
  });

  const sections = [
    { id: "dates", navLabel: "点灯日" },
    { id: "this-year", navLabel: "今年の見どころ" },
    { id: "dusk", navLabel: "映える時間" },
    ...LIGHTS_ROUTES.map((route, i) => ({ id: route.slug, navLabel: `順路${i + 1}` })),
    { id: "tips", navLabel: "歩くときのコツ" },
    { id: "basis", navLabel: "基準と出典" },
  ];
  const n = (id: string) => sections.findIndex((s) => s.id === id) + 1;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}${PATH}#article`,
    headline: `ロンドンのイルミネーション${year}`,
    description: "ロンドンのクリスマスのイルミネーションの点灯日と、歩いて回る順路。",
    inLanguage: "ja",
    mainEntityOfPage: `${SITE_URL}${PATH}`,
    dateModified: `${SEASON_CHECKED}T12:00:00Z`,
    author: SIGHTSEEING_PUBLISHER,
    publisher: SIGHTSEEING_PUBLISHER,
  };

  return (
    <div
      data-page-main
      className="mx-auto max-w-4xl pb-10 pt-4 text-neutral-900 dark:text-neutral-100 sm:px-4"
    >
      <JsonLd data={breadcrumbListJsonLd({ path: PATH })} />
      <JsonLd data={articleJsonLd} />

      <Breadcrumbs path={PATH} className="mb-5" />

      <ChristmasHero
        compact
        eyebrow={`CHRISTMAS LIGHTS ${year}`}
        title={TITLE}
        lead={
          <p>
            灯りは11月上旬から通りごとに点き、例年1月上旬まで毎晩ともります。点灯日の一覧と、日の入りから歩く2つの順路をまとめました。今年はオックスフォード・ストリートの中心部が車両通行止めになり、灯りの真下を車道の真ん中から歩けます。
          </p>
        }
      />

      <ChristmasSeriesNav current="lights" className="mt-4" />

      <div className="mt-10">
        <GuideSectionNav sections={sections} />

        <XmasSection
          n={n("dates")}
          id="dates"
          title="通りごとの点灯日"
          lead="終わりの日はどこも発表しませんが、例年1月上旬に外されます。"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {lights.map((item) => (
              <LightCard key={item.slug} item={item} today={today} />
            ))}
          </div>
        </XmasSection>

        <XmasSection n={n("this-year")} id="this-year" title={`${year}年の見どころ`}>
          <ul className="space-y-3">
            <li className="rounded-xl border border-neutral-200 p-4 text-sm leading-relaxed dark:border-neutral-700">
              <p className="font-bold">車の入らないオックスフォード・ストリート</p>
              <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                10月26日から、オーチャード・ストリート(セルフリッジズの角)からグレート・ポートランド・ストリートまでの約0.9kmが車両通行止めになりました。オックスフォード・サーカスの交差点も含みます。灯りのある冬に、この区間を車道ごと歩けるのは今年が初めてです。
              </p>
              <SourceLine
                sources={[{ label: "TfL – Oxford Street", url: "https://tfl.gov.uk/modes/driving/oxford-street" }]}
                checkedAt={SEASON_CHECKED}
              />
            </li>
            <li className="rounded-xl border border-neutral-200 p-4 text-sm leading-relaxed dark:border-neutral-700">
              <p className="font-bold">ハリー・ポッターの灯り</p>
              <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                オックスフォード・ストリートの今年の飾りの一部は、ハリー・ポッターにちなんだものになると、通りの公式サイトが告知しています。点灯日と飾りの中身はまだ発表されていません。スタジオツアーの冬の催し「ホグワーツ・イン・ザ・スノー」と合わせて、
                <Link href="/sightseeing/harry-potter" className="mx-1 text-link underline underline-offset-2">
                  ハリー・ポッターのロンドン
                </Link>
                を回る冬にもできます。
              </p>
              <SourceLine
                sources={[{ label: "Oxford Street(公式サイト)", url: "https://www.oxfordstreet.co.uk/" }]}
                checkedAt={SEASON_CHECKED}
              />
            </li>
            <li className="rounded-xl border border-neutral-200 p-4 text-sm leading-relaxed dark:border-neutral-700">
              <p className="font-bold">リージェント・ストリートの点灯の夜</p>
              <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                点灯の日(11月5日)は17:00〜21:00に通りが車両通行止めになり、歩いて回れます。天使の灯りは2016年から続くもので、今年は新しい趣向が加わると発表されています。
              </p>
              <SourceLine
                sources={[
                  {
                    label: "Regent Street – The Festive Spirits return for 2026",
                    url: "https://www.regentstreetonline.com/news/festive-spirits-return-for-2026",
                  },
                ]}
                checkedAt={SEASON_CHECKED}
              />
            </li>
          </ul>
        </XmasSection>

        <XmasSection
          n={n("dusk")}
          id="dusk"
          title="灯りが映える時間"
          lead="日の入りから空が暗くなるまで(市民薄明の終わりまで)は、空にまだ青さが残り、灯りと一緒に写ります。12月はこの時間が40分ほどしかありません。"
        >
          <div className="overflow-hidden rounded-2xl bg-[#0b1d33] text-white ring-1 ring-black/10">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-amber-300">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">日付</th>
                  <th scope="col" className="px-4 py-3 font-semibold">日の入り</th>
                  <th scope="col" className="px-4 py-3 font-semibold">暗くなる</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {dusk.map((row) => (
                  <tr key={row.date}>
                    <th scope="row" className="px-4 py-2.5 font-medium">{formatDay(row.date)}</th>
                    <td className="px-4 py-2.5 tabular-nums">{row.sunset}</td>
                    <td className="px-4 py-2.5 tabular-nums">{row.civilDusk}ごろ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            ロンドン中心部(トラファルガー広場)の計算値で、誤差は1〜2分。「暗くなる」は太陽が地平線の6°下に沈む時刻です。
          </p>
        </XmasSection>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        {LIGHTS_ROUTES.map((route) => {
          const km = routeDistanceKm(route);
          const minutes = routeWalkMinutes(route);
          const spots = route.stops.flatMap((s) => (s.spot ? [s.spot] : []));
          // 立ち寄りは灯りを見る時間だけ置く。掲載値(セルフリッジズ2時間など)の
          // まま入れると、夜の散歩が昼の6時間の予定になる。src は /plan の帯が
          // 「クリスマスのイルミの順路」と名乗り、足す使い方を先に出すための印。
          const planHref = `/plan?spots=${encodeURIComponent(
            encodePlan(
              spots.map((slug) => ({ slug, day: 1, minutes: LIGHTS_STOP_MINUTES })),
            ),
          )}&src=lights`;
          return (
            <XmasSection
              key={route.slug}
              n={n(route.slug)}
              id={route.slug}
              title={route.title}
              lead={route.lead}
            >
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                <span className="inline-flex items-center gap-1.5">
                  <RouteIcon className="h-4 w-4 text-red-700 dark:text-red-400" aria-hidden="true" />
                  約{km}km
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Footprints className="h-4 w-4 text-red-700 dark:text-red-400" aria-hidden="true" />
                  歩くだけなら{minutes}分ほど
                </span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                距離は立ち寄り先どうしの直線距離の合計で、実際の道のりは角を曲がるぶん少し長くなります。時間は時速4kmで歩いた目安で、見物の時間は入っていません。
              </p>
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-relaxed text-neutral-800 dark:bg-amber-950/20 dark:text-neutral-200">
                {route.when}
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-700">
                <RouteMapLazy stops={route.stops} />
              </div>

              <ol className="mt-4 space-y-3">
                {route.stops.map((stop, i) => {
                  const item = stop.item ? bySlug.get(stop.item) : undefined;
                  return (
                    <li key={stop.name} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-700 text-sm font-bold text-white ring-2 ring-amber-200 dark:ring-amber-800"
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                          {stop.spot ? (
                            <Link href={`/sightseeing/${stop.spot}`} className="underline-offset-2 hover:underline">
                              {stop.name}
                            </Link>
                          ) : (
                            stop.name
                          )}
                          {item && (
                            <StatusChip
                              status={statusOn(item.edition, today, item.kind)}
                              kind={item.kind}
                            />
                          )}
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{stop.note}</p>
                        {item?.edition?.start && (
                          <p className="mt-0.5 text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
                            {item.shortTitle}: {formatRange(item.edition)}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={googleMapsWalkingUrl(route)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800"
                >
                  Google マップで道順を開く
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                {spots.length > 0 && (
                  <Link
                    href={planHref}
                    className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-300 transition hover:bg-emerald-50 dark:text-emerald-300 dark:ring-emerald-800 dark:hover:bg-emerald-950/30"
                  >
                    立ち寄り先を旅行プランに入れる
                  </Link>
                )}
              </div>
            </XmasSection>
          );
        })}

        <XmasSection n={n("tips")} id="tips" title="歩くときのコツ">
          <ul className="space-y-3">
            {[
              {
                title: "点灯の夜より、別の日の夕方に",
                body: "点灯の日は人出が多く、身動きが取りにくくなります。灯りは点いたあと毎晩ともるので、落ち着いて見たいなら別の日に歩くほうが楽です。",
              },
              {
                title: "バスから見るツアーとの違い",
                body: "オックスフォード・ストリートの中心部は10月26日から車が通れないので、灯りを回るバスのツアーはこの区間を走れません。歩けば、灯りの真下を車道の真ん中から見られます。",
                href: "/sightseeing/christmas-lights-london-bus-tour",
                linkLabel: "灯りを回るバスツアー",
              },
              {
                title: "寒さの備え",
                body: "夜の屋外で長く立っていると、気温の数字より冷えます。手袋と帽子、底の厚い靴で出てください。",
                href: "/events/december",
                linkLabel: "12月のロンドン(服装)",
              },
              {
                title: "人込みのスリ",
                body: "灯りの通りと駅の周りは、12月の夕方がいちばん混みます。スマホと財布は体の前で持ってください。",
                href: "/trouble",
                linkLabel: "トラブル対応",
              },
            ].map((tip) => (
              <li
                key={tip.title}
                className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-bold">{tip.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{tip.body}</p>
                {tip.href && (
                  <Link href={tip.href} className="mt-1.5 inline-block text-sm text-link underline underline-offset-2">
                    {tip.linkLabel}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </XmasSection>

        <XmasSection n={n("basis")} id="basis" title="基準と出典">
          <div className="space-y-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <p>
              点灯日は各通りの公式発表によります。発表の無いものは「未発表」と書いています。出典は各通りの欄にあります。
            </p>
            <p>
              順路の立ち寄り先の位置は OpenStreetMap から取りました。編集部が歩いて測った時間ではなく、距離から出した目安です。
            </p>
            <p className="font-semibold">最終確認: {formatFullDate(SEASON_CHECKED)}</p>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {[
              { href: "/events/christmas", label: "ロンドンのクリスマス特集" },
              { href: "/sightseeing/christmas-markets", label: "クリスマスマーケットの比較" },
              { href: "/events/december", label: "12月のロンドン" },
              { href: "/events/new-years-eve-fireworks", label: "年越し花火" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex h-9 items-center rounded-full px-3.5 text-sm ring-1 ring-neutral-300 transition hover:ring-red-300 dark:ring-neutral-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </XmasSection>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-12" />
    </div>
  );
}
