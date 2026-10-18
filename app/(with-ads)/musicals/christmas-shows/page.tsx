import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MapPin, Ticket } from "lucide-react";

import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import { londonDate } from "@/lib/publish-schedule";
import { hubOgImage } from "@/lib/og-hubs";
import {
  SEASON_CHECKED,
  formatFullDate,
  formatRange,
  resolveItems,
  seasonYear,
  statusOn,
  type ResolvedItem,
  type SeasonSource,
} from "@/lib/christmas";
import { MUSICALS_PUBLISHER } from "@/components/musicals/guides/guides";
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

/**
 * ロンドンのクリスマスの舞台(/musicals/christmas-shows)。
 *
 * クリスマス特集とミュージカル欄の両方に属するページ。パント(日本でいう
 * パントマイムとは別物)の入門と、その年のパント・バレエ・芝居の上演、
 * 選び方をまとめる。ミュージカル欄はサイトでいちばん検索に強い区分なので、
 * 観劇ガイドの一覧(components/musicals/guides/guides.ts)にも並べている。
 *
 * 上演の会期は lib/christmas/shows.ts が持つ。観劇ガイドの決まり
 * (作品名・上演時間を本文に直書きしない)と同じく、年ごとの演目と配役は
 * editions に置き、ここには毎年変わらない説明だけを書く。
 */
export const revalidate = 60 * 60 * 24;

const PATH = "/musicals/christmas-shows";
const TITLE = "ロンドンのクリスマスの舞台";

const VA_PANTO: SeasonSource = {
  label: "V&A – The story of pantomime",
  url: "https://www.vam.ac.uk/articles/the-story-of-pantomime",
};

/**
 * 選び方の表の、年に依存しない評価。料金はその年の editions から出す。
 * 舞台を足したらここにも足すこと(無い舞台は表に出ない)。
 */
const GUIDE: Record<string, { forWho: string; english: string; kids: string }> = {
  "palladium-panto": {
    forWho: "英国の人気者の喜劇を、大劇場の豪華な舞台で",
    english: "台詞と時事ネタが多い。動きの笑いもある",
    kids: "家族向け",
  },
  "hackney-empire-panto": {
    forWho: "昔ながらのパントを、地元の客席と一緒に",
    english: "台詞が多いが、動きと歌で追える",
    kids: "4歳から自分の席。4歳未満は膝の上",
  },
  "royal-ballet-nutcracker": {
    forWho: "初めてのバレエを、本場の劇場で",
    english: "台詞なし",
    kids: "5歳から",
  },
  "enb-nutcracker": {
    forWho: "新しい演出の『くるみ割り人形』を",
    english: "台詞なし",
    kids: "5歳から。16歳未満は25%引き",
  },
  "old-vic-christmas-carol": {
    forWho: "英国の芝居で、クリスマスの物語を",
    english: "台詞が中心。筋を予習しておくと追いやすい",
    kids: "劇場の案内を確認",
  },
  "the-snowman": {
    forWho: "小さな子ども連れで",
    english: "これまでの舞台は台詞なし",
    kids: "家族向け",
  },
  "dickens-christmas-carol": {
    forWho: "物語が生まれた時代の家で、作者の子孫の芝居を",
    english: "台詞が中心",
    kids: "劇場の案内を確認",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const year = seasonYear(londonDate(new Date()));
  return buildPageMetadata({
    path: PATH,
    title: `ロンドンのクリスマスの舞台${year}｜パント・くるみ割り人形・クリスマス・キャロル`,
    description:
      "ロンドンの冬の劇場の定番を、その年の上演の会期と料金(劇場の公式発表を確かめたもの)とあわせてまとめました。日本のパントマイムとは別物の「パント」の楽しみ方、ロイヤル・バレエとENBの『くるみ割り人形』、オールド・ヴィックの『クリスマス・キャロル』まで。",
    keywords: [
      "ロンドン パントマイム",
      "ロンドン パント",
      "ロンドン くるみ割り人形",
      "ロイヤル・バレエ くるみ割り人形",
      "ロンドン クリスマス 舞台",
      "ロンドン クリスマス・キャロル 舞台",
      "London pantomime",
    ],
    images: [hubOgImage("christmas-shows")],
    type: "article",
  });
}

function ShowCard({ item, today }: { item: ResolvedItem; today: string }) {
  const edition = item.edition;
  return (
    <article
      id={item.slug}
      className="scroll-mt-28 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 dark:border-violet-900/50 dark:from-violet-950/20 dark:to-neutral-950"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug">{item.title}</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">{item.engTitle}</p>
        </div>
        <StatusChip status={statusOn(edition, today, item.kind)} kind={item.kind} />
      </div>
      <p className="mt-3 text-base font-semibold tabular-nums text-violet-900 dark:text-violet-200">
        {edition ? formatRange(edition) : `未発表(${item.usualTiming})`}
      </p>
      {edition?.hours && (
        <p className="mt-0.5 text-sm tabular-nums text-neutral-700 dark:text-neutral-300">{edition.hours}</p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{item.summary}</p>
      {edition?.notes && edition.notes.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-neutral-700 marker:text-violet-500 dark:text-neutral-300">
          {edition.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      <dl className="mt-3 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
        <div className="flex items-start gap-1.5">
          <dt className="shrink-0">
            <MapPin className="mt-0.5 h-4 w-4 text-red-700 dark:text-red-400" aria-label="最寄り駅" />
          </dt>
          <dd>{item.station}</dd>
        </div>
        <div className="flex items-start gap-1.5">
          <dt className="shrink-0">
            <Ticket className="mt-0.5 h-4 w-4 text-red-700 dark:text-red-400" aria-label="料金" />
          </dt>
          <dd>{edition?.price ?? "料金は劇場の公式サイトで"}</dd>
        </div>
      </dl>
      {edition?.booking?.url && (
        <a
          href={edition.booking.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-full bg-violet-700 px-5 text-sm font-semibold text-white transition hover:bg-violet-800"
        >
          公式サイトで日程と席を見る
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      {edition && (
        <p className="mt-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          出典:{" "}
          {edition.sources.map((source, i) => (
            <span key={source.url}>
              {i > 0 && "、"}
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">
                {source.label}
              </a>
            </span>
          ))}
          ({formatFullDate(edition.checkedAt)}確認)
        </p>
      )}
    </article>
  );
}

export default function ChristmasShowsPage() {
  const today = londonDate(new Date());
  const year = seasonYear(today);
  const shows = resolveItems(year).filter((i) => i.kind === "show");

  const sections = [
    { id: "panto", navLabel: "パントとは" },
    { id: "shows", navLabel: `${year}年の上演` },
    { id: "choose", navLabel: "選び方" },
    { id: "tips", navLabel: "観る前に" },
    { id: "basis", navLabel: "基準と出典" },
  ];
  const n = (id: string) => sections.findIndex((s) => s.id === id) + 1;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}${PATH}#article`,
    headline: `ロンドンのクリスマスの舞台${year}`,
    description: "パント・くるみ割り人形・クリスマス・キャロルなど、ロンドンの冬の劇場の定番と、その年の上演。",
    inLanguage: "ja",
    mainEntityOfPage: `${SITE_URL}${PATH}`,
    dateModified: `${SEASON_CHECKED}T12:00:00Z`,
    author: MUSICALS_PUBLISHER,
    publisher: MUSICALS_PUBLISHER,
  };

  return (
    <div
      data-page-main
      className="mx-auto max-w-4xl pb-10 pt-4 text-neutral-900 dark:text-neutral-100 sm:px-4"
    >
      <JsonLd
        data={breadcrumbListJsonLd({ path: "/musicals", current: "クリスマスの舞台", currentHref: PATH })}
      />
      <JsonLd data={articleJsonLd} />

      <Breadcrumbs path="/musicals" current="クリスマスの舞台" className="mb-5" />

      <ChristmasHero
        compact
        eyebrow={`CHRISTMAS SHOWS IN LONDON ${year}`}
        title={TITLE}
        lead={
          <p>
            ロンドンの冬は、劇場がいちばん賑わう季節です。家族で叫んで笑う「パント」、バレエの『くるみ割り人形』、ディケンズの『クリスマス・キャロル』。その年の上演と、選び方をまとめました。
          </p>
        }
      />

      <ChristmasSeriesNav current="shows" className="mt-4" />

      <div className="mt-10">
        <GuideSectionNav sections={sections} />

        <XmasSection
          n={n("panto")}
          id="panto"
          title="パントは「パントマイム」ではない"
          lead="日本でパントマイムといえば、言葉を使わない無言劇のことです。英国でクリスマスに「パントマイム(パント)」と言えば、まったく別のものを指します。"
        >
          <div className="space-y-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <p>
              英国のパントは、『シンデレラ』『ジャックと豆の木』のようなおとぎ話を下敷きにした、家族向けの喜劇の舞台です。歌と踊り、ドタバタ、その年の時事ネタが次々に出てきて、客席も黙って観ているのではなく、声を出して芝居に加わります。19世紀のヴィクトリア朝の劇場で、駄洒落と客席との掛け合いが加わって、いまの形になりました。
            </p>
            <p>
              主人公の母親役のデイムは、伝統的に男性が派手なドレスで演じます。若い主人公の男の子役(プリンシパル・ボーイ)を女性が演じる習わしは19世紀の半ばに始まり、19世紀の終わりには決まりになりました。
            </p>
          </div>
          <h3 className="mt-6 text-base font-bold">客席で使う掛け声</h3>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              {
                term: "He's behind you!(後ろにいるよ!)",
                body: "悪役やお化けが主人公の背後に忍び寄ったとき、客席みんなで知らせる。",
              },
              {
                term: "Oh no it isn't! / Oh yes it is!",
                body: "舞台の役と客席が「違う!」「そうだ!」を言い合う、パントのお決まりのやりとり。",
              },
              {
                term: "Boo!(ブーイング)",
                body: "悪役が出てきたら遠慮なくブーイングする。主人公には声援を送る。",
              },
              {
                term: "Hello!",
                body: "道化役が「Hello boys and girls!」と呼びかけたら、大きな声で返す。",
              },
            ].map((item) => (
              <div key={item.term} className="rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-700">
                <dt className="text-sm font-bold">{item.term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{item.body}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            英語の駄洒落や時事ネタは速くて難しいのですが、動きの笑いと歌、お決まりの掛け声だけでも十分に加われます。子どもが笑っている場面で一緒に笑えば、それでいいのがパントです。
          </p>
          <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
            出典:{" "}
            <a href={VA_PANTO.url} target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-2">
              {VA_PANTO.label}
            </a>
          </p>
        </XmasSection>

        <XmasSection
          n={n("shows")}
          id="shows"
          title={`${year}年の上演`}
          lead="会期と料金は、各劇場の公式の案内で確かめたものです。12月25日などの公演の有無は、劇場の公演カレンダーで確かめてください。"
        >
          <div className="grid gap-4">
            {shows.map((item) => (
              <ShowCard key={item.slug} item={item} today={today} />
            ))}
          </div>
        </XmasSection>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        <XmasSection
          n={n("choose")}
          id="choose"
          title="どれを観るか"
          lead="英語の量と、子どもの年齢で選ぶのが早道です。台詞の無いバレエは、英語に自信がなくても筋を追えます。"
        >
          <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-neutral-50 text-xs text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-semibold">舞台</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">向いている人</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">英語</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">子ども</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">料金</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {shows
                  .filter((item) => GUIDE[item.slug])
                  .map((item) => {
                    const guide = GUIDE[item.slug];
                    return (
                      <tr key={item.slug} className="align-top">
                        <th scope="row" className="px-3 py-2.5 font-medium">
                          <a href={`#${item.slug}`} className="text-link underline-offset-2 hover:underline">
                            {item.shortTitle}
                          </a>
                        </th>
                        <td className="px-3 py-2.5 leading-relaxed">{guide.forWho}</td>
                        <td className="px-3 py-2.5 leading-relaxed">{guide.english}</td>
                        <td className="px-3 py-2.5 leading-relaxed">{guide.kids}</td>
                        <td className="px-3 py-2.5 leading-relaxed">{item.edition?.price ?? "—"}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </XmasSection>

        <XmasSection n={n("tips")} id="tips" title="観る前に">
          <ul className="space-y-3">
            {[
              {
                title: "日程が決まったら、席を先に取る",
                body: "クリスマスの時期は、子ども向けの舞台の昼の回(マチネ)と週末から先に埋まります。",
                href: "/musicals/west-end-tickets",
                label: "チケットの買い方",
              },
              {
                title: "子どもの年齢の決まりを確かめる",
                body: "何歳から入れるか、膝の上で観られるかは劇場ごとに違います。チケットを買う前に確かめてください。",
                href: "/musicals/theatre-with-kids",
                label: "子連れ観劇ガイド",
              },
              {
                title: "英語が不安なら、筋を先に読んでおく",
                body: "バレエは台詞がありません。芝居は、あらすじを日本語で読んでおくだけで追いやすさが大きく変わります。",
                href: "/musicals/shows-without-english",
                label: "英語がわからなくても楽しめる作品の選び方",
              },
              {
                title: "騒いでよいのはパントだけ",
                body: "声を出して加わるのはパントのお約束です。バレエと芝居では、ふつうの観劇のマナーで観てください。",
                href: "/musicals/west-end-etiquette",
                label: "劇場の楽しみ方・マナー",
              },
            ].map((tip) => (
              <li key={tip.title} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                <p className="text-sm font-bold">{tip.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{tip.body}</p>
                <Link href={tip.href} className="mt-1.5 inline-block text-sm text-link underline underline-offset-2">
                  {tip.label}
                </Link>
              </li>
            ))}
          </ul>
        </XmasSection>

        <XmasSection n={n("basis")} id="basis" title="基準と出典">
          <div className="space-y-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <p>
              会期・料金・上演時間・年齢の決まりは、各劇場の公式の案内で確かめたものだけを載せています。料金の欄が空いている舞台は、公式の案内で料金の幅を確かめられなかったものです。出典は各舞台の欄にあります。
            </p>
            <p>パントの成り立ちは、V&A(ヴィクトリア&アルバート博物館)の解説によります。</p>
            <p className="font-semibold">最終確認: {formatFullDate(SEASON_CHECKED)}</p>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {[
              { href: "/events/christmas", label: "ロンドンのクリスマス特集" },
              { href: "/musicals", label: "ロンドンのミュージカル" },
              { href: "/column/the-first-christmas-card-in-1843-was-a-flop-henry-cole-a-toasting-child-and-the-temperance-critics", label: "コラム: 世界初のクリスマスカード" },
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
