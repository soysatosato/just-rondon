import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import GuideNotes from "@/components/guides/GuideNotes";
import { SITE_URL } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import {
  BEYOND_FARE_BANDS,
  RAIL_AS_OF,
  RAIL_UPDATED_AT,
} from "@/lib/beyond-london/rates";
import {
  BEYOND_BASE,
  BEYOND_LOCAL_TRANSPORT_LABELS,
  BEYOND_SECTION_NAME,
  BEYOND_THEME_LABELS,
  beyondDestinations,
  beyondHubCollectionJsonLd,
  beyondPath,
  type BeyondLocalTransport,
  type BeyondMeta,
  type BeyondTimeFit,
} from "../destinations";
import DestinationChooser, { type ChooserCard } from "./DestinationChooser";
import {
  HUB_DESCRIPTION,
  HUB_LEAD,
  HUB_TITLE,
  hubFaq,
  hubRelatedLinks,
  listNotes,
  prerequisites,
} from "./content";

/**
 * 所要バーの基準。最も遠いペンザンス(片道5時間)を上限にする。
 *
 * 固定値にせず一覧から取るのは、行き先が増えたときに
 * バーの意味が黙って変わらないようにするため。
 */
const MAX_MINUTES = Math.max(
  ...beyondDestinations.map((d) => d.journeyMinutes ?? 0)
);

const TIME_FIT_LABELS: Record<BeyondTimeFit, string> = {
  halfDay: "半日",
  fullDay: "1日",
  overnight: "1泊",
};

/**
 * 現地の足のバッジ色。
 *
 * 3段階を色で分けているのは、ここが行き先選びを覆す唯一の項目だから。
 * 所要と運賃だけを並べると、コッツウォルズはオックスフォードと
 * 同程度の日帰り先に見えてしまう。
 */
const LOCAL_TRANSPORT_STYLES: Record<BeyondLocalTransport, string> = {
  walk: "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400",
  local: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  tour: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

/** 行き先1件のカード。DestinationChooser には描画済みで渡す。 */
function DestinationCard({ d }: { d: BeyondMeta }) {
  const fare = BEYOND_FARE_BANDS[d.slug];
  const minutes = d.journeyMinutes ?? 0;
  const barWidth = Math.max(6, Math.round((minutes / MAX_MINUTES) * 100));

  return (
    <Link
      href={beyondPath(d.slug)}
      className="group block rounded-xl border border-gray-300 bg-white shadow-sm transition hover:border-teal-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-teal-500"
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className="block text-xs font-semibold text-teal-600">
              {d.eyebrow}
            </span>
            <span className="mt-0.5 block text-lg font-bold group-hover:text-teal-700 dark:group-hover:text-teal-400">
              {d.label}
            </span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {(d.timeFit ?? []).map((t) => (
              <li
                key={t}
                className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              >
                {TIME_FIT_LABELS[t]}
              </li>
            ))}
          </ul>
        </div>

        {/*
          行き方の3点。このセクションが「必ず行き方から書く」と
          決めているのに、以前のハブは1つも出していなかった。
        */}
        <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:pt-0.5">
            出発
          </dt>
          <dd className="text-gray-700 dark:text-gray-300">
            {d.fromStation}
            {d.county && (
              <span className="text-gray-500 dark:text-gray-400">
                {" → "}
                {d.county}
              </span>
            )}
          </dd>

          <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:pt-0.5">
            片道
          </dt>
          <dd>
            <span className="text-gray-700 dark:text-gray-300">
              {d.journeyTime}
            </span>
            <span
              aria-hidden
              className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800"
            >
              <span
                className="block h-full rounded-full bg-teal-500/70"
                style={{ width: `${barWidth}%` }}
              />
            </span>
          </dd>

          {fare && (
            <>
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:pt-0.5">
                運賃
              </dt>
              <dd className="text-gray-700 dark:text-gray-300">
                Advance {fare.advanceFrom}
                <span aria-hidden className="mx-1.5 text-gray-400">
                  →
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  当日 {fare.onTheDay}
                </span>
              </dd>
            </>
          )}
        </dl>

        {d.localTransport && (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-1 font-semibold ${
                LOCAL_TRANSPORT_STYLES[d.localTransport]
              }`}
            >
              {BEYOND_LOCAL_TRANSPORT_LABELS[d.localTransport]}
            </span>
            {d.localTransportNote && (
              <span className="text-gray-500 dark:text-gray-400">
                {d.localTransportNote}
              </span>
            )}
          </p>
        )}

        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {d.blurb}
        </p>

        {d.themes && d.themes.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400 dark:text-neutral-500">
            {d.themes.map((t) => (
              <li key={t}>{BEYOND_THEME_LABELS[t]}</li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}

export default function BeyondHub() {
  const pageUrl = `${SITE_URL}${BEYOND_BASE}`;

  /*
    行き先だけをチューザーに渡す。BritRail Pass(category: "rail")は
    行き先ではなく移動の実務なので、前提ブロックのほうへ回す。
    以前は同じ形のカードで一緒に並んでいた。
  */
  const cards: ChooserCard[] = beyondDestinations
    .filter((d) => d.category !== "rail")
    .map((d) => ({
      slug: d.slug,
      timeFit: d.timeFit ?? [],
      themes: d.themes ?? [],
      journeyMinutes: d.journeyMinutes ?? 0,
      node: <DestinationCard d={d} />,
    }));

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd
        data={beyondHubCollectionJsonLd({
          name: HUB_TITLE,
          description: HUB_DESCRIPTION,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd({
          name: BEYOND_SECTION_NAME,
          path: BEYOND_BASE,
        })}
      />
      <JsonLd data={faqPageJsonLd(hubFaq, pageUrl)} />

      <Breadcrumbs path="/beyond-london" />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          Beyond London
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ロンドンから日帰り・週末で行く英国
        </p>
        <div className="mt-3">
          <GuideFreshness dataAsOf={RAIL_AS_OF} updatedAt={RAIL_UPDATED_AT} />
        </div>
        <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {HUB_LEAD}
        </p>
      </header>

      {/*
        行き先より先に置く。どれを選んでも先に効く2つで、
        知らずに出発すると日帰り1回で数十ポンド損をする。
      */}
      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">出発する前に、この2つだけ</h2>
        {prerequisites.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 dark:bg-amber-950/25"
          >
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {p.headline}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {p.body}
            </p>
            {p.link && (
              <Link
                href={p.link.href}
                className="mt-2 inline-block text-sm font-semibold text-blue-700 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
              >
                {p.link.label} →
              </Link>
            )}
          </div>
        ))}
      </section>

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <section className="mt-10">
        <h2 className="text-lg font-semibold">行き先を絞り込む</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          日本語の日帰り情報は「何があるか」は丁寧に書きますが、どの駅から乗り、何分かかり、いくらで、着いてから歩けるのかを書いているものは多くありません。実際に行こうとすると、そこで詰まります。各記事は街の紹介より先に行き方の表を置いていて、この一覧はその要約です。
        </p>

        <div className="mt-5">
          <DestinationChooser cards={cards} />
        </div>

        <GuideNotes items={listNotes} />
      </section>

      <GuideFaq items={hubFaq} />

      <div className="mt-10 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          {hubRelatedLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-blue-600 hover:opacity-80 dark:text-blue-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
