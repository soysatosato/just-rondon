import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import GuideFreshness from "@/components/guides/GuideFreshness";
import FixtureFinder from "@/components/sightseeing/football/FixtureFinder";
import { sightseeingBreadcrumbJsonLd } from "@/components/sightseeing/jsonld";
import {
  FOOTBALL_BASE,
  FOOTBALL_SECTION_NAME,
} from "@/components/sightseeing/football/guides";
import { buildPageMetadata } from "@/lib/seo";
import { londonDate } from "@/lib/publish-schedule";
import { LONDON_CLUBS, SEASON, jpDate } from "@/lib/football/clubs";
import {
  ANNOUNCEMENTS,
  CONFIRMED_THROUGH,
  FIXTURES,
  FIXTURES_CHECKED_ON,
  FIXTURES_PATH,
  FIXTURE_SOURCES,
  FINAL_MATCHWEEK,
  formatAnnouncement,
  formatDayRange,
  formatMatchDay,
  nextAnnouncement,
  upcomingFixtures,
  weekendsWithoutMatches,
} from "@/lib/football/fixtures";

/**
 * ロンドンのプレミアリーグの試合日程。旅行の日付から、その日程で観られる
 * ホーム試合を探す。データと更新の手順は lib/football/fixtures.ts。
 *
 * 終わった試合を1日1回の再生成で外す。発表予定日を過ぎた「未反映」の
 * 知らせも、この再生成で出る。
 */
export const revalidate = 60 * 60 * 24;

/** "2026-10-19" → "10月19日" */
function monthDay(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}月${d}日`;
}

/** 日時が確定している試合のうち最後の日(最終節を除く)。 */
const CONFIRMED_LAST = FIXTURES.filter(
  (f) => f.matchweek <= CONFIRMED_THROUGH.matchweek,
)
  .map((f) => f.date)
  .sort()
  .pop()!;

/** その発表で決まる、ロンドンのホーム試合の日付の範囲。 */
function matchDatesOf(a: { from: number; to: number }): string {
  const dates = FIXTURES.filter(
    (f) => f.matchweek >= a.from && f.matchweek <= a.to,
  )
    .map((f) => f.date)
    .sort();
  return formatDayRange(dates[0], dates[dates.length - 1]);
}

const FINAL_DAY = FIXTURES.find((f) => f.matchweek === FINAL_MATCHWEEK)!;

const TITLE = `ロンドンのプレミアリーグ日程(${SEASON})｜旅行の日付で試合を探す`;
const DESCRIPTION = `アーセナル、チェルシー、トッテナムなどロンドン${LONDON_CLUBS.length}クラブのホーム試合の日程です。キックオフが確定した試合と、テレビ放映の都合で動く可能性がある試合を分けて、旅行の日付から探せます。${monthDay(CONFIRMED_LAST)}の試合まで日時が確定(${monthDay(CONFIRMED_THROUGH.announcedOn)}の公式発表)。`;

export const metadata = buildPageMetadata({
  path: FIXTURES_PATH,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "プレミアリーグ 日程",
    "ロンドン サッカー 日程",
    "プレミアリーグ 観戦 日程",
    "アーセナル ホーム 日程",
    "チェルシー 日程",
    "トッテナム 日程",
    "プレミアリーグ キックオフ 確定",
  ],
});

const linkClass = "text-link underline underline-offset-2 dark:text-blue-400";

export default function FootballFixturesPage() {
  const today = londonDate(new Date());
  const fixtures = upcomingFixtures(today);
  const emptyWeekends = weekendsWithoutMatches(fixtures);
  const next = nextAnnouncement(today);
  const remaining = ANNOUNCEMENTS.filter(
    (a) => a.from > CONFIRMED_THROUGH.matchweek,
  );

  return (
    <div
      data-page-main
      className="mx-auto max-w-3xl pt-4 pb-10 text-neutral-900 dark:text-neutral-100 sm:px-4"
    >
      <JsonLd
        data={sightseeingBreadcrumbJsonLd([
          { name: FOOTBALL_SECTION_NAME, path: FOOTBALL_BASE },
          { name: "試合日程", path: FIXTURES_PATH },
        ])}
      />

      <Breadcrumbs path={FOOTBALL_BASE} current="試合日程" />

      <header className="mt-6 space-y-3">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          ロンドンのプレミアリーグ日程
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Premier League fixtures in London, {SEASON}
        </p>
        {fixtures.length > 0 && (
          <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            {`ロンドンでは${formatMatchDay(fixtures[0].date)}から${formatMatchDay(fixtures[fixtures.length - 1].date)}まで、${LONDON_CLUBS.length}クラブのホーム試合が${fixtures.length}試合あります。日時が確定しているのは${monthDay(CONFIRMED_LAST)}の試合までで、それより後の試合は、テレビ放映の都合で同じ週末のうちに動くことがあります。`}
          </p>
        )}
        <GuideFreshness dataAsOf={jpDate(FIXTURES_CHECKED_ON)} />
      </header>

      <section
        aria-labelledby="when-confirmed"
        className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/60 sm:p-5"
      >
        <h2 id="when-confirmed" className="text-lg font-bold">
          日時はいつ決まるか
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
          <li>
            <span className="font-semibold">確定</span>:
            {monthDay(CONFIRMED_LAST)}までの試合(第{CONFIRMED_THROUGH.matchweek}
            節まで)。{monthDay(CONFIRMED_THROUGH.announcedOn)}
            にプレミアリーグが発表しました。
          </li>
          <li>
            <span className="font-semibold">未確定</span>:
            {"それより後の試合は、日程表の日付(週末の節は土曜15:00、平日の節は20:00)に仮に置かれています。テレビ放映に選ばれると、同じ週末の金〜月(平日の節は火〜木)のどこかへ動きます。"}
          </li>
          <li>
            <span className="font-semibold">最終節</span>:
            {formatMatchDay(FINAL_DAY.date)}は全試合が{FINAL_DAY.kickoff}
            開始で、開幕前から決まっています。
          </li>
        </ul>

        {next?.overdue && (
          <p
            role="note"
            className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            公式は{formatAnnouncement(next)}に第{next.from}〜{next.to}
            節の日時を発表する予定でしたが、このページにはまだ反映できていません。
            {matchDatesOf(next)}の試合は、クラブの公式サイトでも日時を確かめてください。
          </p>
        )}

        {remaining.length > 0 && (
          <>
            <h3 className="mt-4 text-sm font-bold">これからの発表予定(公式)</h3>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-300 text-left text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                  <th scope="col" className="py-1.5 pr-3 font-medium">
                    発表
                  </th>
                  <th scope="col" className="py-1.5 font-medium">
                    日時が決まる試合
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {remaining.map((a) => (
                  <tr key={a.from}>
                    <td className="whitespace-nowrap py-1.5 pr-3 align-top">
                      {formatAnnouncement(a)}
                    </td>
                    <td className="py-1.5">
                      {matchDatesOf(a)}
                      <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">
                        (第{a.from === a.to ? a.from : `${a.from}〜${a.to}`}節)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <p className="mt-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {"公式は、年内は6週間前、1月からは5週間前までに知らせる方針です。ただし欧州の大会を勝ち進んだクラブの試合などは、もっと直前に動くことがあります。動いても旅程が崩れない組み方は"}
          <Link href="/sightseeing/football/planning" className={`mx-1 ${linkClass}`}>
            キックオフ時間と日程の確定
          </Link>
          にまとめています。
        </p>
      </section>

      <section aria-label="試合を探す" className="mt-8">
        <FixtureFinder fixtures={fixtures} emptyWeekends={emptyWeekends} />
      </section>

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <section aria-labelledby="how-to-read" className="mt-10 space-y-3">
        <h2 id="how-to-read" className="text-xl font-bold md:text-2xl">
          表の見方
        </h2>
        <ul className="space-y-3 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
          <li>
            <span className="font-semibold">時刻</span>
            はロンドン時間です。日本時間は、冬は9時間、英国の夏時間(3月の最終日曜から)の間は8時間進んだ時刻で併記しています。
          </li>
          <li>
            <span className="font-semibold">英国で生中継</span>
            とある試合は、Sky Sports か TNT Sports が中継するので、スタジアムに入れなくてもパブで観られます。土曜15時の試合は、英国では生中継されません。詳しくは
            <Link href="/sightseeing/football/pub-watching" className={`mx-1 ${linkClass}`}>
              パブで観る
            </Link>
            に。
          </li>
          <li>
            <span className="font-semibold">チケット</span>
            の表示は、会員になっていない旅行者が席を取れる見込みをクラブごとに示したものです。同じクラブでも、相手が強いほど取りにくく高くなります。クラブの比べ方は
            <Link href="/sightseeing/football/which-club" className={`mx-1 ${linkClass}`}>
              6クラブの比較
            </Link>
            、買い方は
            <Link href="/sightseeing/football/tickets" className={`mx-1 ${linkClass}`}>
              チケットの取り方
            </Link>
            にあります。
          </li>
          <li>
            <span className="font-semibold">ロンドン・ダービー</span>
            は、相手もロンドンのクラブの試合です。アーセナルとトッテナムの試合は「ノース・ロンドン・ダービー」と呼ばれます。
          </li>
        </ul>
      </section>

      <section aria-labelledby="not-listed" className="mt-10 space-y-3">
        <h2 id="not-listed" className="text-xl font-bold md:text-2xl">
          このページに載せていない試合
        </h2>
        <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
          {"載せているのはプレミアリーグのホーム試合だけです。FAカップ・EFLカップと欧州の大会(UEFA)のホーム試合は、各クラブの公式サイトで確かめてください。表の「試合なし」の週末は、プレミアリーグの試合が無いという意味で、代表戦の期間やカップ戦の週末などにあたります。女子スーパーリーグや下部リーグなら、もっと安く確実に観られます("}
          <Link href="/sightseeing/football/lower-leagues" className={linkClass}>
            ほかの選択肢
          </Link>
          )。
        </p>
      </section>

      <section
        aria-labelledby="sources"
        className="mt-10 rounded-lg border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h2 id="sources" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          このページの日程について
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {`プレミアリーグの公式発表(下の資料)から、ロンドンの${LONDON_CLUBS.length}クラブのホーム試合を抜き出して載せています。${jpDate(FIXTURES_CHECKED_ON)}に公式の記事と照らし合わせました。公式が日時を発表するたびに、このページも直します。チケットを買う前と出発の前には、クラブの公式サイトでも日時を確かめてください。`}
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {FIXTURE_SOURCES.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
