import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buildPageMetadata } from "@/lib/seo";
import { fetchGbpJpyRate, fetchGbpJpyRateOn, type FxRate } from "@/lib/fx/rate";
import { PRICE_BASES, PRICE_BASIS_ORDER } from "@/lib/price-board/bases";
import {
  PRICE_GROUPS,
  PRICE_ITEMS,
  resolvePrice,
  samePrice,
  upcomingChange,
} from "@/lib/price-board/items";
import { latestSnapshot, previousSnapshot } from "@/lib/price-board/history";
import PriceRow from "@/components/prices/PriceRow";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

/**
 * ロンドンの物価ボード。
 *
 * 「ロンドン 物価」で検索してくる人が欲しいのは、感想ではなく日付つきの値段。
 * ポンドの値段は月に1回まとめて確かめ(history.ts の記録)、円はページを
 * 作るたびに ECB のレートで換算する。ポンドは月1回、円は毎日動くので、
 * 円の列だけが日々新しくなる。
 *
 * 再生成は lib/fx/rate.ts の FX_REVALIDATE_SECONDS と同じ6時間。
 * セグメント設定は静的に読める値でないといけないので、数字で書いている。
 */
export const revalidate = 21600;

const latest = latestSnapshot();
const previous = previousSnapshot();

/** "2026-10-05" → { y: 2026, m: 10, d: 5 } */
function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

const checked = latest ? parts(latest.checkedAt) : null;

export const metadata = buildPageMetadata({
  path: "/prices",
  title: checked
    ? `ロンドンの物価【${checked.y}年${checked.m}月】${PRICE_ITEMS.length}品目をポンドと円で｜運賃・パブ・入場料・家賃`
    : `ロンドンの物価｜${PRICE_ITEMS.length}品目をポンドと円で`,
  description: `ロンドンの物価を${PRICE_ITEMS.length}品目で。地下鉄の運賃、パブの1パイント、Meal Deal、主な観光地の入場料、家賃、Council Tax まで、ポンドの値段を毎月確かめ、ECB のレートで円に換算しています。どの数字にも、何を数えた値かと出典を付けています。`,
  keywords: [
    "ロンドン 物価",
    "イギリス 物価",
    "ロンドン 物価 円",
    "イギリス 物価 2026",
    "ロンドン ビール 値段",
    "ロンドン 家賃 相場",
  ],
  modifiedTime: latest?.checkedAt,
});

function londonToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function oneYearBefore(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${y - 1}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function dayJa(iso: string): string {
  const { m, d } = parts(iso);
  return `${m}月${d}日`;
}

function changePercent(from: number, to: number): number {
  return ((to - from) / from) * 100;
}

function signedPercent(from: number, to: number): string {
  const p = changePercent(from, to);
  return `${p >= 0 ? "+" : "−"}${Math.abs(p).toFixed(1)}%`;
}

async function settle(p: Promise<FxRate>): Promise<FxRate | null> {
  try {
    return await p;
  } catch (error) {
    console.error("[prices] fx", error);
    return null;
  }
}

export default async function PricesPage() {
  const today = londonToday();
  const [fx, fxYearAgo] = await Promise.all([
    settle(fetchGbpJpyRate()),
    settle(fetchGbpJpyRateOn(oneYearBefore(today))),
  ]);
  const rate = fx?.jpyPerGbp ?? null;

  const rows = PRICE_ITEMS.map((item) => ({
    item,
    price: resolvePrice(item, today),
    upcoming: upcomingChange(item, today),
    previous: previous?.prices[item.id],
  }));
  const changedCount = rows.filter(
    (r) => r.previous !== undefined && !samePrice(r.previous, r.price),
  ).length;

  /** 為替だけで円の支払いがどれだけ動いたか。円安なら正。 */
  const yearAgoChange =
    fx && fxYearAgo ? changePercent(fxYearAgo.jpyPerGbp, fx.jpyPerGbp) : null;
  const yearAgoText =
    yearAgoChange === null
      ? null
      : yearAgoChange >= 0
        ? `ポンドの値段が同じでも、円で払う額は1年前より${yearAgoChange.toFixed(1)}%増えています。`
        : `ポンドの値段が同じなら、円で払う額は1年前より${Math.abs(yearAgoChange).toFixed(1)}%減っています。`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/prices" })} />
      <Breadcrumbs path="/prices" className="mb-5" />

      <header className="mb-8">
        <div className="h-[3px] bg-foreground" />
        <p className="border-b border-foreground/20 py-2 font-serif text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground sm:text-[11px]">
          London Price Board
        </p>
        <h1 className="pt-6 text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl dark:text-white">
          ロンドンの物価
        </h1>
        <p className="mt-5 max-w-[42rem] text-sm leading-[2] text-muted-foreground dark:text-gray-400">
          地下鉄の運賃からパブの1パイント、家賃まで{PRICE_ITEMS.length}品目。
          ポンドの値段を毎月確かめて、円はその日のレートで換算しています。
          物価の数字は、何を数えたかで簡単に倍違います。どの行にも、何の数字かを添えました。
        </p>
        {checked && (
          <p className="mt-4 text-xs font-bold tabular-nums text-foreground/80 dark:text-gray-300">
            {checked.y}年{checked.m}月{checked.d}日に全品目を確認
          </p>
        )}
      </header>

      {fx && (
        <section
          aria-label="為替レート"
          className="mb-10 border-l-[3px] border-emerald-600 bg-emerald-600/[0.05] px-5 py-4"
        >
          <p className="text-2xl font-bold tabular-nums tracking-tight dark:text-white">
            £1 = {fx.jpyPerGbp.toFixed(2)}
            <span className="ml-1 text-base font-semibold">円</span>
            <span className="ml-3 align-middle text-[11px] font-semibold text-muted-foreground dark:text-gray-400">
              ECB・{dayJa(fx.rateDate)}
            </span>
          </p>
          {fxYearAgo && (
            <p className="mt-2 text-sm leading-relaxed text-foreground/80 dark:text-gray-300">
              1年前({dayJa(fxYearAgo.rateDate)})は{fxYearAgo.jpyPerGbp.toFixed(2)}円。{yearAgoText}
            </p>
          )}
          {previous && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
              前回の確認({parts(previous.checkedAt).m}月)からは、ポンドの値段が変わった品目が
              {changedCount}つ、為替は{signedPercent(previous.jpyPerGbp, fx.jpyPerGbp)}。
            </p>
          )}
        </section>
      )}

      {latest?.memo && (
        <section className="mb-10">
          <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            This Month
          </p>
          <h2 className="mt-1.5 text-lg font-bold tracking-tight dark:text-white">
            {checked?.m}月の物価メモ
          </h2>
          <p className="mt-2 text-sm leading-[1.9] dark:text-gray-200">{latest.memo}</p>
          {latest.issue && (
            <Link
              href={`/changes/${latest.issue}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground dark:text-gray-200"
            >
              今月変わったロンドンを読む
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </section>
      )}

      {PRICE_GROUPS.map((group) => {
        const groupRows = rows.filter((r) => r.item.group === group.id);
        if (groupRows.length === 0) return null;
        return (
          <section key={group.id} className="mb-10" aria-labelledby={`group-${group.id}`}>
            <div className="border-t-2 border-foreground pt-3">
              <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {group.eyebrow}
              </p>
              <h2
                id={`group-${group.id}`}
                className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl dark:text-white"
              >
                {group.label}
              </h2>
              {group.lead && (
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
                  {group.lead}
                </p>
              )}
            </div>
            <ul className="divide-y divide-border dark:divide-neutral-800">
              {groupRows.map((r) => (
                <PriceRow
                  key={r.item.id}
                  item={r.item}
                  price={r.price}
                  rate={rate}
                  previous={r.previous}
                  upcoming={r.upcoming}
                />
              ))}
            </ul>
          </section>
        );
      })}

      <section id="basis" className="scroll-mt-20 border-t-2 border-foreground pt-3">
        <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          How We Count
        </p>
        <h2 className="mt-1.5 text-lg font-bold tracking-tight dark:text-white">数字の基準</h2>
        <dl className="mt-3 divide-y divide-border text-xs leading-relaxed dark:divide-neutral-800">
          {PRICE_BASIS_ORDER.filter((id) => PRICE_ITEMS.some((i) => i.basis === id)).map(
            (id) => {
              const basis = PRICE_BASES[id];
              return (
                <div key={id} id={`basis-${id}`} className="scroll-mt-20 py-3">
                  <dt className="font-bold dark:text-white">{basis.name}</dt>
                  <dd className="mt-0.5 text-foreground/80 dark:text-gray-300">
                    {basis.what}
                    <span className="text-muted-foreground dark:text-gray-400">{basis.why}</span>
                    {basis.url && (
                      <a
                        href={basis.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 underline underline-offset-2 hover:text-foreground"
                      >
                        出典
                      </a>
                    )}
                  </dd>
                </div>
              );
            },
          )}
          <div className="py-3">
            <dt className="font-bold dark:text-white">円の換算</dt>
            <dd className="mt-0.5 text-foreground/80 dark:text-gray-300">
              ECB(欧州中央銀行)の参考レートを
              <a
                href="https://frankfurter.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-0.5 underline underline-offset-2 hover:text-foreground"
              >
                Frankfurter
              </a>
              経由で6時間ごとに取得しています。
              <span className="text-muted-foreground dark:text-gray-400">
                ECB の公表は平日1日1回です。カード払いや両替では、手数料のぶん数%不利になります。
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-10 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground dark:border-neutral-800 dark:text-gray-500">
        ここの値段は、交通・光熱費・住まい・予算の各ガイドが使っている数字と同じものです。
        改定があればガイドとこのボードが同時に変わり、その月の変化は
        <Link href="/changes" className="mx-0.5 underline underline-offset-2 hover:text-foreground">
          今月変わったロンドン
        </Link>
        にまとめています。
      </p>
    </main>
  );
}
