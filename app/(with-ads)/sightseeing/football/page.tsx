import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import {
  faqPageJsonLd,
  sightseeingBreadcrumbJsonLd,
} from "@/components/sightseeing/jsonld";
import {
  FOOTBALL_BASE,
  FOOTBALL_CATEGORY_BLURBS,
  FOOTBALL_CATEGORY_LABELS,
  FOOTBALL_CATEGORY_ORDER,
  FOOTBALL_SECTION_NAME,
  footballGuidePath,
  footballGuides,
  footballGuidesByCategory,
  footballHubCollectionJsonLd,
} from "@/components/sightseeing/football/guides";
import {
  DIFFICULTY_LABELS,
  FOOTBALL_AS_OF,
  FOOTBALL_UPDATED_AT,
  LEAGUE_RULES,
  LONDON_CLUBS,
  OTHER_FOOTBALL,
  REALISTIC_CLUBS,
  SEASON,
  SEASON_DATES,
  gbp,
  jpDate,
} from "@/lib/football/clubs";

const TITLE = "プレミアリーグ観戦ガイド｜ロンドンでチケットを取って観に行く";
const DESCRIPTION = `ロンドンでプレミアリーグを観戦する方法を12本の記事で網羅。一般販売が存在しない理由と会員制度の仕組み、転売チケットが違法で入場できない理由、6クラブの取りやすさ比較、試合当日の流れ、そしてチケットが取れなかったときのパブ観戦と女子サッカーまで。${SEASON}シーズン、${FOOTBALL_AS_OF}時点の公式情報で解説します。`;

export const metadata = buildPageMetadata({
  path: FOOTBALL_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "プレミアリーグ 観戦",
    "プレミアリーグ チケット",
    "ロンドン サッカー観戦",
    "ロンドン サッカー",
    "アーセナル チケット",
    "チェルシー 観戦",
    "プレミアリーグ 観戦 ガイド",
    "ロンドン スタジアム",
  ],
});

/**
 * 状況から入口を選ばせる。
 *
 * 観戦の記事は「チケットを取る前か、取った後か」で必要な情報が
 * まるごと違う。まだ席がない人に持ち込み制限を説明しても読まれないし、
 * 明日行く人に会員制度の解説を出しても遅い。
 * /transport ハブと同じく、抽象的な目次ではなく読者の現在地を選ばせる。
 */
const SCENARIOS: {
  situation: string;
  answer: string;
  detail: string;
  href: string;
  cta: string;
}[] = [
  {
    situation: "チケットを買おうとしたら、どこにも売っていない",
    answer: "一般販売がありません",
    detail: `席の大半は年間シート保有者と会員で埋まります。会員になる、公式リセールを張る、ホスピタリティを買う。この3つが旅行者の現実的な経路です。`,
    href: "/sightseeing/football/tickets",
    cta: "チケットの取り方を見る",
  },
  {
    situation: "転売サイトに出ているので、そこで買おうと思う",
    answer: "違法です。入場できません",
    detail:
      "英国ではサッカーのチケット転売が法律で禁じられています。コンサートとは扱いが違います。買った席は無効化され、スタジアムの入口で止められます。",
    href: "/sightseeing/football/resale-warning",
    cta: "なぜ買えないのかを見る",
  },
  {
    situation: "どのクラブの試合を観ればいいか分からない",
    answer: "有名クラブほど取れません",
    detail: `ロンドンには6クラブあります。${REALISTIC_CLUBS.map((c) => c.name).join("・")}なら現実的に取れて、相手として強豪もやって来ます。`,
    href: "/sightseeing/football/which-club",
    cta: "6クラブを比べる",
  },
  {
    situation: "旅行の日程に試合を組み込みたい",
    answer: "キックオフ時刻は後から動きます",
    detail:
      "テレビ放映の都合で、土曜15時の試合が日曜16時半になることがあります。確定は5〜6週間前。試合の前後に予定を詰めてはいけません。",
    href: "/sightseeing/football/planning",
    cta: "日程の組み方を見る",
  },
  {
    situation: "チケットが取れた。当日は何を持って行けばいい？",
    answer: "とにかく荷物を減らす",
    detail:
      "A4サイズを超えるバッグは持ち込めず、しかも預かり所がありません。スーツケースを持って行くと入場できず、宿に戻ることになります。",
    href: "/sightseeing/football/matchday",
    cta: "当日の流れを見る",
  },
  {
    situation: "スタジアムまでどう行って、どう帰る？",
    answer: "難所は帰りです",
    detail:
      "試合終了後、数万人が同時に駅へ向かい入場規制がかかります。30〜60分待つことも。1つ先の駅まで歩くのが最も効率的です。",
    href: "/sightseeing/football/getting-there",
    cta: "行き方と帰り方を見る",
  },
  {
    situation: "現地での振る舞い方が不安",
    answer: "守るのは2つだけ",
    detail:
      "ホーム側の席で相手を応援しないこと。発煙筒・ピッチ侵入・差別的言動をしないこと。この2つ以外は自由に楽しんでいい場所です。",
    href: "/sightseeing/football/etiquette",
    cta: "観戦の作法を見る",
  },
  {
    situation: "結局チケットが取れなかった",
    answer: "パブがあります",
    detail:
      "イギリス人の大多数はパブでサッカーを観ています。入場無料、予約不要、ビール1杯で何時間でも。これがこの国の日常の観戦です。",
    href: "/sightseeing/football/pub-watching",
    cta: "パブ観戦を見る",
  },
  {
    situation: "もっと安く、確実に試合を観たい",
    answer: "女子サッカーと下部リーグ",
    detail: `WSLはエミレーツやスタンフォード・ブリッジで ${gbp(OTHER_FOOTBALL.wslLow)}台から。下部リーグは当日券で入れます。体験としてはむしろ濃くなります。`,
    href: "/sightseeing/football/lower-leagues",
    cta: "ほかの選択肢を見る",
  },
];

const FAQ_ITEMS = [
  {
    question: "プレミアリーグのチケットは日本から買えますか？",
    answer:
      "**買えます**。クラブの会員登録もチケット購入も、日本の住所と日本発行のクレジットカードで完結します。チケットはデジタルでクラブの公式アプリに表示されるため、郵送も不要です。ただし**会員登録は事実上の必須条件**で、これなしでは人気クラブの席は取れません。",
  },
  {
    question: "なぜ一般販売でチケットが買えないのですか？",
    answer:
      "席の**6〜7割がシーズンチケット（年間シート）保有者**で埋まり、残りもアウェイ配分と会員向け販売で消えるためです。シーズンチケットは親から子へ受け継がれることすらあり、空きが出ません。アーセナルやトッテナムには数万人規模の待機リストがあります。",
  },
  {
    question: "viagogo や StubHub で買ってもいいですか？",
    answer: `**絶対にやめてください**。英国ではサッカーのチケット転売がクラブの認可なしには法律で禁じられています（${LONDON_CLUBS.length}クラブすべて共通）。これらのサイトで買った席は無効化され、**入場を拒否されます**。返金も期待できません。コンサートのチケットとは扱いがまったく違います。`,
  },
  {
    question: "チケットは1枚いくらぐらいですか？",
    answer: `**大人1枚 ${gbp(30)}〜${gbp(120)}** が目安です（${FOOTBALL_AS_OF}時点）。同じクラブでも対戦相手のランク（Category A / B / C）で3倍近く変わります。ホスピタリティは ${gbp(150)}〜${gbp(500)} と別枠です。**女子スーパーリーグなら ${gbp(OTHER_FOOTBALL.wslLow)}〜${gbp(OTHER_FOOTBALL.wslHigh)}** で、同じ大スタジアムに入れます。`,
  },
  {
    question: "初めてなら、どのクラブの試合がおすすめですか？",
    answer: `**${REALISTIC_CLUBS.map((c) => c.name).join("・")}**のいずれかです。会員になれば現実的に取れて、価格も ${gbp(30)}〜${gbp(75)} に収まります。しかも相手として来るのはリバプールやマンチェスター・シティです。**同じ選手を、半額以下で、より近い距離から観られます**。`,
  },
  {
    question: "シーズンはいつからいつまでですか？",
    answer: `${SEASON}シーズンは**${jpDate(SEASON_DATES.opening)}開幕、${jpDate(SEASON_DATES.finalDay)}閉幕**です。**${SEASON_DATES.offSeason}は完全なオフシーズン**でリーグ戦が1試合もありません。加えて9月・10月・11月・3月には代表戦期間があり、その週末はリーグ戦が止まります。`,
  },
  {
    question: "キックオフの時刻は変わりますか？",
    answer:
      "**変わります**。テレビ放映のカードが決まると、それに合わせて曜日と時刻が動きます。土曜15時のはずだった試合が日曜16時半や金曜20時になることは日常的です。確定は**おおむね5〜6週間前**なので、それより前に旅程を固めるのは危険です。",
  },
  {
    question: "スタジアムにバッグは持ち込めますか？",
    answer:
      "**A4サイズ以下の小さなバッグまで**が原則です。そして重要な点として、**ロンドンのスタジアムには手荷物預かり所がありません**。断られたら入場を諦めるしかないので、大きな荷物は宿か駅のコインロッカーに置いてから向かってください。",
  },
  {
    question: "相手チームのユニフォームを着て行ってもいいですか？",
    answer:
      "**ホームサポーター席では避けてください**。イングランドではホームとアウェイのサポーターが座席で厳格に分離されており、ホーム側で相手を応援すると安全上の理由で**退場を命じられます**。旅行者が買えるのはほぼホーム側の席です。何も着ない中立の格好が最も安全です。",
  },
  {
    question: "ロンドンにはプレミアリーグのクラブがいくつありますか？",
    answer: `${SEASON}シーズンは**6クラブ**です（${LONDON_CLUBS.map((c) => c.name).join("、")}）。なお**ウェストハム・ユナイテッドは前シーズンに降格**したため、今季ロンドン・スタジアムでプレミアリーグの試合は開催されません。昇降格でクラブの顔ぶれは毎年変わります。`,
  },
];

export default function FootballHubPage() {
  const pageUrl = `${SITE_URL}${FOOTBALL_BASE}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={sightseeingBreadcrumbJsonLd([
          { name: FOOTBALL_SECTION_NAME, path: FOOTBALL_BASE },
        ])}
      />
      <JsonLd
        data={footballHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <BreadCrumbs
        name="観光ガイド"
        link="sightseeing"
        name2={FOOTBALL_SECTION_NAME}
      />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          プレミアリーグ観戦ガイド
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Watching Premier League Football in London
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          ロンドンでプレミアリーグを観るとき、最大の壁は
          <strong>チケットです</strong>。
          日本の感覚で公式サイトを開いても、席は売っていません。
          この差を理解しないまま二次流通サイトに流れると、
          スタジアムの入口で入場を拒否されます。
        </p>
        <GuideFreshness
          dataAsOf={FOOTBALL_AS_OF}
          updatedAt={FOOTBALL_UPDATED_AT}
        />
      </header>

      {/*
        「一般販売が存在しない」を最上部に置く。
        日本語で流通しているプレミアリーグ観戦情報は、いまだに
        「公式サイトでチケットを買いましょう」で終わるものが多く、
        読者が二次流通サイトに流れて入場拒否されるという実害が出ているため。
        この枠だけ読んで離脱しても、最悪の事故だけは防げるようにする。
      */}
      <div className="mt-8 rounded-lg border border-emerald-300 bg-emerald-50/70 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/25">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          先に結論：一般販売はありません。そして転売チケットでは入れません
        </p>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            ・席の大半は<strong>年間シート保有者と会員</strong>で埋まります。
            一般の人が買える枠は、人気クラブでは実質的に残りません
          </li>
          <li>
            ・
            <strong>
              英国ではサッカーのチケット転売が法律で禁じられています
            </strong>
            。viagogo などで買った席は無効化され、入場を拒否されます
          </li>
          <li>
            ・旅行者の現実的な経路は
            <strong>
              「会員になる」「公式リセールを張る」「ホスピタリティを買う」
            </strong>
            の3つです
          </li>
          <li>
            ・
            <strong>
              有名クラブほど取れません。
            </strong>
            {REALISTIC_CLUBS.map((c) => c.name).join("・")}
            なら現実的に狙えます
          </li>
          <li>
            ・準備は<strong>3ヶ月前</strong>から。会員登録には数日かかります
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          転売が違法である理由と、合法な入手経路との見分け方は
          <Link
            href="/sightseeing/football/resale-warning"
            className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            買ってはいけないチケット
          </Link>
          にまとめています。
        </p>
      </div>

      <Separator className="my-8" />

      <section aria-labelledby="find-your-stage" className="space-y-5">
        <div className="space-y-2">
          <h2 id="find-your-stage" className="text-xl font-bold md:text-2xl">
            自分の状況を選んでください
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            一番近いものが1つ見つかれば、それがあなたの読むべきページです。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <Link key={s.href} href={s.href} className="block">
              <Card className="h-full border-gray-300 bg-white shadow-sm transition hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-500">
                <CardContent className="flex h-full flex-col p-5">
                  <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                    {s.situation}
                  </p>
                  <p className="mt-3 text-xs font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
                    → {s.answer}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {s.detail}
                  </p>
                  <span className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {s.cta} →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="my-10" />

      <section aria-labelledby="clubs-overview" className="space-y-4">
        <h2 id="clubs-overview" className="text-xl font-bold md:text-2xl">
          ロンドンの6クラブ早見表
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {SEASON}シーズン、ロンドンには
          <strong>6つ</strong>
          のプレミアリーグクラブがあります。この表で最も重要な列は
          <strong>「取りやすさ」</strong>
          です。席が取れなければ、他の条件は意味を持ちません。
        </p>
        <MarkdownBody>
          {`| クラブ | スタジアム | 収容 | 価格帯 | 取りやすさ |
|---|---|---:|---:|---|
${LONDON_CLUBS.map(
  (c) =>
    `| **${c.name}** | ${c.stadiumJa} | ${c.capacity.toLocaleString()} | ${gbp(c.ticketLow)}〜${gbp(c.ticketHigh)} | ${DIFFICULTY_LABELS[c.difficulty]} |`
).join("\n")}

**${SEASON}シーズンの基本情報**

| 項目 | 内容 |
|---|---|
| 開幕 | ${jpDate(SEASON_DATES.opening)} |
| 閉幕 | ${jpDate(SEASON_DATES.finalDay)} |
| オフシーズン | ${SEASON_DATES.offSeason}（**試合なし**） |
| ロンドンでの開催数 | 年${LEAGUE_RULES.homeMatchesPerClub * LONDON_CLUBS.length}試合 |
| アウェイ席の上限額 | ${gbp(LEAGUE_RULES.awayTicketCap)}（${LEAGUE_RULES.awayCapUntilSeason}シーズンまで） |
| 女子スーパーリーグ | ${gbp(OTHER_FOOTBALL.wslLow)}〜${gbp(OTHER_FOOTBALL.wslHigh)}（同じスタジアムで開催） |

**ウェストハム・ユナイテッドは前シーズンに降格した**ため、今季ロンドン・スタジアムでプレミアリーグの試合は開催されません。昇降格でロンドンのクラブ数は毎年変わります。`}
        </MarkdownBody>
      </section>

      <Separator className="my-10" />

      <section aria-labelledby="all-guides" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-guides" className="text-xl font-bold md:text-2xl">
            観戦ガイド一覧
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            全{footballGuides.length}本。まだ席がない人は1段目から、
            チケットが取れた人は2段目から読んでください。
          </p>
        </div>

        {FOOTBALL_CATEGORY_ORDER.map((category) => {
          const guides = footballGuidesByCategory(category);
          if (guides.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  {FOOTBALL_CATEGORY_LABELS[category]}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {FOOTBALL_CATEGORY_BLURBS[category]}
                </p>
              </div>
              <div className="space-y-3">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={footballGuidePath(g.slug)}
                    className="block"
                  >
                    <Card className="border-gray-300 bg-white shadow-sm transition hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-500">
                      <CardContent className="p-5">
                        <span className="block text-xs font-semibold text-emerald-600">
                          {g.eyebrow}
                        </span>
                        <span className="mt-1 block text-base font-semibold">
                          {g.label}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {g.blurb}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <GuideFaq items={FAQ_ITEMS} />

      <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          観戦と一緒に決まること
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          スタジアムはいずれも中心部から離れています。移動手段と宿の場所は、
          観戦の計画と切り離せません。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href="/sightseeing/stadium-tours"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドンのスタジアムツアー一覧
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/transport/fares"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドンの運賃と支払い方法｜切符は買いません
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/hotels"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              宿泊エリア別ホテル選び｜どのゾーンに泊まるべきか
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/itinerary"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドン モデルコース（1〜5日）
            </Link>
          </li>
        </ul>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本サイトの価格・制度は{FOOTBALL_AS_OF}
        時点で各クラブ公式サイト・premierleague.com・GOV.UK
        の情報を確認したものです。チケット価格とメンバーシップの料金は
        <strong>毎シーズン改定</strong>され、
        <strong>昇降格によってロンドンのクラブの顔ぶれも毎年変わります</strong>
        。チケット転売の規制に関する記述は情報提供を目的としたもので、
        法的助言ではありません。購入にあたっては、必ず各クラブの公式サイトで
        最新の情報をご確認ください。
      </p>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
