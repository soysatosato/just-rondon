import { gbp, mealDealSaving, mealDealsByPrice } from "@/lib/food/prices";

/**
 * チェーン別の Meal Deal 価格。
 *
 * 以前は /food ハブと meal-deal 記事がそれぞれ GFM テーブルを手書きしていた。
 * MarkdownBody の表には min-w-[32rem] がかかるので、このサイトで最も
 * 参照される数字がスマホでは横スクロールの中にあった。しかも2つの表は
 * すでにずれていて、ハブ側は9社のうち WHSmith が抜けていた。
 *
 * カードにしたのは、比べたいものが「通常価格と会員価格の差」で、
 * 表だとその差が2列に離れて置かれるから。ここでは払う額を最も大きく出し、
 * 通常価格は打ち消し線で真下に添える。差額が一目で読める。
 *
 * 並びは安い順(mealDealsByPrice)。「どこが安いか」がこの一覧の用途で、
 * 会員価格の有無で順位が入れ替わるため、記述順では答えにならない。
 */
export default function MealDealPrices({
  asOf,
}: {
  /** 情報の基準時点。FOOD_AS_OF か article.dataAsOf を渡す。 */
  asOf: string;
}) {
  const deals = mealDealsByPrice();
  const cheapest = deals[0];
  const withMemberPrice = deals.filter((d) => d.member !== undefined).length;

  return (
    <div className="my-5">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => {
          const saving = mealDealSaving(deal);
          const isCheapest =
            (deal.member ?? deal.standard) ===
            (cheapest.member ?? cheapest.standard);

          return (
            <li
              key={deal.label}
              className={`rounded-lg border p-4 ${
                isCheapest
                  ? "border-emerald-400 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/25"
                  : "border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              }`}
            >
              <p className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {deal.label}
                </span>
                {isCheapest && (
                  <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    最安
                  </span>
                )}
              </p>

              <p className="mt-2 text-2xl font-bold leading-none text-gray-900 dark:text-gray-100">
                {gbp(deal.member ?? deal.standard)}
              </p>

              {deal.member !== undefined ? (
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  <span className="line-through">{gbp(deal.standard)}</span>
                  {" → "}
                  <strong className="font-semibold text-gray-900 dark:text-gray-100">
                    {deal.scheme}
                  </strong>
                  で{gbp(saving)}安い
                </p>
              ) : (
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  会員価格なし。この額が唯一の値段
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        {asOf}時点。会員価格のある{withMemberPrice}
        社は、カードを出さないと通常価格を払うことになります。価格は年に1〜2回改定されるため、最終的な金額は店頭でご確認ください。
      </p>
    </div>
  );
}
