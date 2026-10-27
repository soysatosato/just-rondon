import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import { londonDate } from "@/lib/publish-schedule";
import { hubOgImage } from "@/lib/og-hubs";
import {
  SEASON_CHECKED,
  formatDay,
  formatFullDate,
  seasonYear,
  type SeasonSource,
} from "@/lib/christmas";
import { isClosedOn, venueClosures } from "@/lib/christmas/closures";
import { SPECIAL_DAYS } from "@/lib/christmas/days";
import { getMonthDays } from "@/lib/london-months/holidays";
import { getDusk } from "@/lib/london-months/sun";
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
import HolidayTable from "@/components/christmas/HolidayTable";

/**
 * 12月25日と年末年始のロンドン(/events/christmas/christmas-day)。
 *
 * クリスマス特集の子ページ。ハブの日めくり(12/24〜1/1)が「その日に何が
 * 起きるか」を1日ずつ書くのに対して、ここは館ごとの営業の早見表と、
 * 25日の動き方・過ごし方を詳しく書く。「ロンドン 12月25日」「年末年始 営業」で
 * 探して来る人の答えになるページ。
 *
 * 営業は lib/christmas/closures.ts、交通の事実は lib/christmas/days.ts が持つ。
 * TfL のその年の年末年始の運行は例年11月下旬に出るので、それまでは前の年の
 * 案内をもとに「例年」と書いている。
 */
export const revalidate = 60 * 60;

const PATH = "/events/christmas/christmas-day";
const TITLE = "12月25日と年末年始のロンドン";

const SOURCES = {
  tfl2025: {
    label: "TfL – 2025年の年末年始の運行",
    url: "https://tfl-newsroom.prgloo.com/news/majority-of-tfl-services-running-over-christmas-and-new-year-to-help-customers-make-the-most-of-london-this-festive-season",
  },
  travelWatch: {
    label: "London TravelWatch – Christmas and New Year travel(2025年)",
    url: "https://www.londontravelwatch.org.uk/news/christmas-and-new-year-travel-disruption/",
  },
  nationalRail: {
    label: "National Rail – Bank Holiday Information(Elizabeth line)",
    url: "https://www.nationalrail.co.uk/travel-information/bank-holiday-information-elizabeth-line/",
  },
  taxiCard: {
    label: "TfL – Taxi fares from 25 April 2026(料金表)",
    url: "https://tfl.gov.uk/cdn/static/cms/documents/taxi-fare-card-2026.pdf",
  },
  taxiTariffs: {
    label: "TfL – Taxi tariffs",
    url: "https://tfl.gov.uk/modes/taxis-and-minicabs/taxi-fares/tariffs",
  },
  heathrow: {
    label: "Heathrow – Christmas 2025(2025年の案内)",
    url: "https://www.heathrow.com/at-the-airport/christmas-2025",
  },
  nationalExpress: {
    label: "National Express – Christmas",
    url: "https://www.nationalexpress.com/en/christmas",
  },
  stPauls: {
    label: "St Paul's Cathedral – Advent and Christmas",
    url: "https://www.stpauls.co.uk/christmas",
  },
  broadcast: {
    label: "The Royal Family – The Christmas Broadcast",
    url: "https://www.royal.uk/the-christmas-broadcast",
  },
  peterPan: {
    label: "Londonist – The Peter Pan Cup",
    url: "https://londonist.com/london/sport/peter-pan-cup",
  },
  royalMail: {
    label: "Royal Mail – Christmas last posting dates",
    url: "https://www.royalmail.com/christmas/last-posting-dates",
  },
  nhs111: { label: "NHS – NHS 111", url: "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/" },
} satisfies Record<string, SeasonSource>;

export async function generateMetadata(): Promise<Metadata> {
  const year = seasonYear(londonDate(new Date()));
  return buildPageMetadata({
    path: PATH,
    title: `ロンドンの12月25日と年末年始${year}｜交通・美術館と店の営業・過ごし方`,
    description: `12月25日のロンドンは地下鉄もバスも鉄道も止まり、大型店は法律で休業します。美術館・名所・市場など${venueClosures.length}か所の12/24〜1/1の営業を公式の案内で確かめた早見表、25日の動き方と空港との行き来、この日にできることをまとめました。`,
    keywords: [
      "ロンドン 12月25日",
      "ロンドン クリスマス 当日",
      "ロンドン 年末年始",
      "ロンドン 年末年始 営業",
      "ロンドン 美術館 年末年始",
      "ロンドン 12月26日",
      "ロンドン 1月1日",
    ],
    images: [hubOgImage("christmas-day")],
    type: "article",
  });
}

function Fact({
  title,
  children,
  sources,
}: {
  title: string;
  children: React.ReactNode;
  sources?: SeasonSource[];
}) {
  return (
    <li className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{title}</p>
      <div className="mt-1 space-y-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {children}
      </div>
      {sources && sources.length > 0 && (
        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
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
        </p>
      )}
    </li>
  );
}

export default async function ChristmasDayPage() {
  const today = londonDate(new Date());
  const year = seasonYear(today);
  const christmas = `${year}-12-25`;
  const dates = [`${year}-12-24`, christmas, `${year}-12-26`, `${year}-12-31`, `${year + 1}-01-01`];

  const [{ days: december }, { days: january }] = await Promise.all([
    getMonthDays(year, 12),
    getMonthDays(year + 1, 1),
  ]);
  const bankHolidays = [...december, ...january].filter((d) => d.kind === "bank");

  const dusk = getDusk(year, 12, 25);
  const museumsClosed = venueClosures.filter(
    (c) => c.group === "museum" && isClosedOn(c, christmas),
  ).length;

  const sections = [
    { id: "hours", navLabel: "年末年始の営業" },
    { id: "transport", navLabel: "25日の動き方" },
    { id: "airport", navLabel: "空港との行き来" },
    { id: "things", navLabel: "25日にできること" },
    { id: "around", navLabel: "24・26・31・1日" },
    { id: "residents", navLabel: "在住者の年末" },
    { id: "basis", navLabel: "基準と出典" },
  ];
  const n = (id: string) => sections.findIndex((s) => s.id === id) + 1;

  const glance = [
    { label: "25日の交通", value: "ほぼすべて運休", sub: "地下鉄・バス・鉄道(例年)" },
    { label: "大型店", value: "25日は休業", sub: "法律で280㎡超の店は開けない" },
    { label: "美術館・博物館", value: `${museumsClosed}館が休館`, sub: "この表に載せた館のうち、25日" },
    { label: "タクシー", value: "£4の割増", sub: "24日20時〜27日6時の乗車" },
    { label: "25日の日の入り", value: dusk.sunset, sub: `暗くなるのは${dusk.civilDusk}ごろ` },
    { label: "国王のメッセージ", value: "15:00", sub: "テレビとラジオ、オンラインで" },
  ];

  const sources = new Map<string, SeasonSource>();
  for (const closure of venueClosures) sources.set(closure.source.url, closure.source);
  for (const source of Object.values(SOURCES)) sources.set(source.url, source);
  for (const day of SPECIAL_DAYS) {
    for (const note of [...day.transport, ...day.life]) {
      if (note.source) sources.set(note.source.url, note.source);
    }
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}${PATH}#article`,
    headline: `ロンドンの12月25日と年末年始${year}`,
    description:
      "12月25日のロンドンの交通・営業・過ごし方と、美術館・名所・市場の年末年始の営業の早見表。",
    inLanguage: "ja",
    mainEntityOfPage: `${SITE_URL}${PATH}`,
    dateModified: `${SEASON_CHECKED}T12:00:00Z`,
    author: SIGHTSEEING_PUBLISHER,
    publisher: SIGHTSEEING_PUBLISHER,
  };

  const around = SPECIAL_DAYS.filter((d) => d.monthDay !== "12-25");

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
        eyebrow={`CHRISTMAS DAY IN LONDON ${year}`}
        title={TITLE}
        lead={
          <p>
            12月25日は、ロンドンが1年でただ1日、ほぼ止まる日です。地下鉄もバスも鉄道も走らず、デパートは法律で開けず、美術館もほとんどが休みます。年末年始の営業の早見表と、この日の動き方・過ごし方をまとめました。
          </p>
        }
      >
        <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {glance.map((item) => (
            <div key={item.label} className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
              <dt className="text-xs font-semibold text-amber-300">{item.label}</dt>
              <dd className="mt-1 text-base font-bold leading-snug tabular-nums text-white">{item.value}</dd>
              <dd className="mt-0.5 text-xs leading-snug text-white/75">{item.sub}</dd>
            </div>
          ))}
        </dl>
      </ChristmasHero>

      <ChristmasSeriesNav current="days" className="mt-4" />

      <div className="mt-10">
        <GuideSectionNav sections={sections} />

        <XmasSection
          n={n("hours")}
          id="hours"
          title="年末年始の営業の早見表"
          lead={`美術館・名所・市場など${venueClosures.length}か所の、12月24日〜1月1日の営業です。休みでない日を「開」にしたのは、公式サイトが「この日以外は毎日開く」と書いている館だけです。見たい館は23日までか27日以降に入れてください。`}
        >
          <HolidayTable closures={venueClosures} dates={dates} />
        </XmasSection>

        <XmasSection
          n={n("transport")}
          id="transport"
          title="25日の動き方"
          lead="この日に使えるのは、歩くことと、タクシーと、貸自転車くらいです。宿は歩いて見どころに出られる場所にしておくと、この日の過ごし方がぐっと広がります。"
        >
          <ul className="space-y-3">
            <Fact title="地下鉄・バス・鉄道は止まる" sources={[SOURCES.tfl2025, SOURCES.travelWatch, SOURCES.nationalRail]}>
              <p>
                TfL の地下鉄・バス・エリザベス線・DLR・オーバーグラウンド・トラム・川のボートは、例年25日はすべて運休します。ナショナル・レールの鉄道も走りません。26日も鉄道はほとんどの路線が運休し、地下鉄とバスは本数を減らして動きます。
              </p>
              <p>
                {year}年の運行は例年11月下旬に TfL が発表します。それまでは前の年の案内をもとにした書き方です。
              </p>
            </Fact>
            <Fact title="タクシーは割増になる" sources={[SOURCES.taxiCard, SOURCES.taxiTariffs]}>
              <p>
                ブラックキャブ(黒いタクシー)は、祝日の料金(タリフ3)に加えて、24日20:00〜27日6:00と、31日20:00〜1月2日6:00に乗ると£4の割増がかかります。配車アプリ(プライベート・ハイヤー)はこの割増の対象外で、各社が独自の料金をかけます。
              </p>
            </Fact>
            <Fact title="動いているもの" sources={[SOURCES.tfl2025]}>
              <p>
                貸自転車のサンタンデール・サイクルは、年末年始のあいだも使えます。中心部の見どころどうしは歩いて回れる距離に集まっているので、灯りを見て歩く順路は25日もそのまま使えます。
              </p>
              <p>
                <Link href="/sightseeing/christmas-lights" className="text-link underline underline-offset-2">
                  イルミネーションと歩く順路
                </Link>
              </p>
            </Fact>
          </ul>
        </XmasSection>

        <XmasSection
          n={n("airport")}
          id="airport"
          title="空港との行き来"
          lead="25日に着く便は、空港から宿までの足を先に決めてから取ってください。鉄道が止まるので、空港の案内に並んでも乗れる列車はありません。"
        >
          <ul className="space-y-3">
            <Fact title="ヒースローは鉄道が止まる" sources={[SOURCES.heathrow]}>
              <p>
                例年、25日はヒースロー・エクスプレス、エリザベス線、地下鉄ピカデリー線のどれも中心部との間を走りません。26日はピカデリー線だけが本数を減らして走ります。空港の中のターミナルどうしは、無料の列車でつながっています。
              </p>
            </Fact>
            <Fact title="代わりの足" sources={[SOURCES.nationalExpress, SOURCES.taxiCard]}>
              <p>
                タクシーか、事前に予約する送迎になります。長距離バスのナショナル・エクスプレスは、例年クリスマス当日も一部の便を走らせるので、空港を通る便があるかを日付を入れて調べてください。ほかの空港(ガトウィック、スタンステッドなど)も、鉄道は同じように止まります。
              </p>
            </Fact>
          </ul>
        </XmasSection>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        <XmasSection
          n={n("things")}
          id="things"
          title="25日にできること"
          lead="店も美術館も閉まる日ですが、この日にしか見られないものもあります。"
        >
          <ol className="space-y-3">
            <Fact title="9:00 サーペンタインの寒中水泳を見る" sources={[SOURCES.peterPan]}>
              <p>
                ハイド・パークのサーペンタイン池では、例年25日の朝9時から、1864年から続く水泳クラブのレース「ピーター・パン・カップ」が開かれます。泳げるのはクラブの会員だけですが、岸から見るのは無料です。カップは『ピーター・パン』の作者J・M・バリーが1904年に贈ったものです。
              </p>
            </Fact>
            <Fact title="11:00 大聖堂の礼拝に加わる" sources={[SOURCES.stPauls]}>
              <p>
                セント・ポール大聖堂では、{year}年は25日の11:00から聖餐式、15:00から夕べの祈りがあり、どちらも無料・予約なしで加われます。観光の見学ではなく礼拝なので、終わるまで静かに過ごし、礼拝中の写真は控えてください。ウェストミンスター寺院もこの日は礼拝のためだけに開きます。
              </p>
            </Fact>
            <Fact title="15:00 国王のクリスマス・メッセージ" sources={[SOURCES.broadcast]}>
              <p>
                1932年に国王ジョージ5世が始めたクリスマスの放送は、例年25日の15:00に流れます。英国の家庭では、昼のごちそうのあとにテレビの前に集まる時間です。テレビとラジオのほか、王室のYouTubeでも見られます。
              </p>
            </Fact>
            <Fact title="夕方 灯りの街を歩く">
              <p>
                通りの灯りは25日もともっています。車の少ない中心部を歩けるのはこの日くらいです。日の入りは{dusk.sunset}ごろ、空が暗くなるのは{dusk.civilDusk}ごろです。
              </p>
            </Fact>
            <Fact title="食事は早めに予約する">
              <p>
                開いている店は少なく、ホテルやレストランは特別のコースを予約制で出すところが多くなります。日程が決まったら、25日の食事の場所から先に押さえてください。
              </p>
            </Fact>
          </ol>
        </XmasSection>

        <XmasSection
          n={n("around")}
          id="around"
          title="24日・26日・31日・1日"
          lead={
            <>
              25日の前後も、予定が崩れやすい日です。1日ずつの案内は
              <Link href="/events/christmas#days" className="mx-1 text-link underline underline-offset-2">
                特集の日めくり
              </Link>
              にあります。
            </>
          }
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {around.map((day) => {
              const date = day.monthDay.startsWith("01") ? `${year + 1}-${day.monthDay}` : `${year}-${day.monthDay}`;
              const closed = venueClosures.filter((c) => isClosedOn(c, date) && !c.closedFrom).length;
              return (
                <li key={day.monthDay} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                  <p className="text-sm font-bold">
                    {formatDay(date)} {day.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {day.headline}。
                    {[...day.transport, ...day.life].map((note) => note.text).join("")}
                  </p>
                  {closed > 0 && (
                    <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                      早見表のうち{closed}か所が休み。
                    </p>
                  )}
                  {day.links && (
                    <p className="mt-1.5 flex flex-wrap gap-x-3 text-sm">
                      {day.links.map((link) => (
                        <Link key={link.href} href={link.href} className="text-link underline underline-offset-2">
                          {link.label}
                        </Link>
                      ))}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </XmasSection>

        <XmasSection
          n={n("residents")}
          id="residents"
          title="在住者の年末"
          lead="ロンドンで暮らしている人向けに、年末に済ませておくことです。"
        >
          <ul className="space-y-3">
            <Fact title="日本への郵便は早めに" sources={[SOURCES.royalMail]}>
              <p>
                クリスマスに届けるための最終投函日は、Royal Mail が国とサービスごとに出しています。国際便は国内より何日も早く締め切られるので、日本へのカードや荷物は12月の初めに確かめてください。
              </p>
            </Fact>
            <Fact title="体調を崩したら" sources={[SOURCES.nhs111]}>
              <p>
                祝日はGPの診療所が閉まります。急ぎの相談は NHS 111(電話の111か、オンライン)が24時間受け付けています。命に関わるときは999です。
              </p>
            </Fact>
            <Fact title="祝日の日付">
              <ul className="list-disc space-y-1 pl-5 marker:text-red-500">
                {bankHolidays.map((day) => (
                  <li key={day.date}>
                    {formatDay(day.date)} {day.title}
                    {day.substitute ? "(振替休日)" : ""}
                  </li>
                ))}
              </ul>
              <p>銀行と役所は休みです。祝日の日付は gov.uk のデータから出しています。</p>
            </Fact>
          </ul>
        </XmasSection>

        <XmasSection n={n("basis")} id="basis" title="基準と出典">
          <div className="space-y-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <p>
              営業は各館の公式サイトに書かれていることだけを載せています。年末年始の扱いを公式に確かめられなかった館(ケンジントン宮殿、スタジオツアー、ザ・シャードなど)は、表から外しました。年末の営業は10〜11月に出そろうので、11月にもう一度見直します。
            </p>
            <p>
              交通は TfL・National Rail・ヒースロー空港の案内からです。{year}年の運行が発表されるまでは、前の年の案内をもとに「例年」と書いています。
            </p>
            <p className="font-semibold">最終確認: {formatFullDate(SEASON_CHECKED)}</p>
          </div>
          <details className="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <summary className="cursor-pointer text-sm font-semibold">出典の一覧({sources.size}件)</summary>
            <ul className="mt-3 space-y-1.5 text-sm">
              {[...sources.values()].map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-link underline underline-offset-2"
                  >
                    {source.label}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </XmasSection>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-12" />
    </div>
  );
}
