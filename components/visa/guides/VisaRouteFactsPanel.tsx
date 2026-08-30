import { VISA_SPONSOR_LABELS } from "./guides";
import type { VisaRouteFacts } from "./types";

/**
 * ルートの要件。記事冒頭とハブの比較で同じデータを描く。
 *
 * 以前ここは atAGlance の灰色の label/value 表だった。7本の記事が
 * それぞれ違うラベルで同じ項目を書いていたので(「永住まで」と
 * 「永住へのカウント」、「費用」と「費用の総額」と「申請料」)、
 * ハブ側は横に並べられず、GFM の表を手書きしていた。
 *
 * スポンサーと永住カウントだけ色を付けているのは、この2つが
 * 「そもそも自分に使えるか」を決めるから。雇用主のスポンサーが
 * 要るルートは、内定が無い時点で候補から外れる。永住カウントは
 * 逆に、知らずに数年過ごしてから気づくと取り返しがつかない。
 * 残りの項目と同じ灰色にすると、どちらも読み飛ばされる。
 */

const SPONSOR_STYLES: Record<VisaRouteFacts["sponsor"], string> = {
  none: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  employer: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  school: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  partner: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

export default function VisaRouteFactsPanel({
  facts,
}: {
  facts: VisaRouteFacts;
}) {
  const rows: { label: string; value: string; note?: string }[] = [];
  if (facts.ageLimit) rows.push({ label: "年齢", value: facts.ageLimit });
  if (facts.incomeRequirement) {
    rows.push({ label: "収入・資金", value: facts.incomeRequirement });
  }
  rows.push({
    label: "申請時に払う額",
    value: facts.upfrontCost,
    note: facts.upfrontNote,
  });
  rows.push({ label: "滞在できる期間", value: facts.maxStay });
  rows.push({ label: "審査期間", value: facts.processing });

  return (
    <section className="mb-8 rounded-xl border border-gray-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <h2 className="text-base font-bold">このビザの要件</h2>

      <p className="mt-3">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
            SPONSOR_STYLES[facts.sponsor]
          }`}
        >
          {VISA_SPONSOR_LABELS[facts.sponsor]}
        </span>
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {facts.sponsorNote}
      </p>

      <dl className="mt-4 grid gap-4 border-t border-gray-200 pt-4 dark:border-neutral-700 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {row.value}
              {row.note && (
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  {row.note}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {/*
        永住カウントは最後に、独立した枠で。ここを読み違えると
        「2年働いたのに1日も算入されていなかった」が起きる。
      */}
      <div
        className={`mt-4 rounded-lg border-l-4 px-4 py-3 ${
          facts.countsTowardsIlr
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/25"
            : "border-red-500 bg-red-50 dark:bg-red-950/25"
        }`}
      >
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          永住（ILR）に
          {facts.countsTowardsIlr ? "カウントされます" : "カウントされません"}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {facts.ilrNote}
        </p>
      </div>
    </section>
  );
}
