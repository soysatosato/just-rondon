/**
 * Frankfurter API から GBP→JPY の参考レートを取得する。
 *
 * 設計メモ:
 * 1. APIキー不要。出典は ECB(欧州中央銀行)の公表レート。
 * 2. **リアルタイムではない。** ECB は平日の中央欧州時間16時ごろに
 *    1日1回だけ公表する。したがって週末や祝日は前営業日の値が返る。
 *    「今この瞬間の実勢レート」ではないので、UI では必ず
 *    レート自身の日付(API が返す date)を添えて出す。
 * 3. lib/money/rates.ts の方針(実額を書かず率だけ持つ)は据え置き。
 *    こちらは「読者が自分で概算するための基準値」を別レイヤーで足すもの。
 * 4. 両替所の店頭レートはここから数%離れる。手数料込みの実勢とは
 *    別物であることを UI 側で必ず明示する。
 */

const ENDPOINT = "https://api.frankfurter.dev/v1/latest?base=GBP&symbols=JPY";

/**
 * キャッシュ秒数。出典の ECB が平日1日1回しか公表しないため、
 * 頻繁に取りに行っても同じ値が返る。ただし1日1回にすると公表直後の
 * 反映が半日遅れることがあるので、その間を取っている。
 */
export const FX_REVALIDATE_SECONDS = 21600;

type FrankfurterResponse = {
  amount: number;
  base: string;
  /** レートの基準日 (YYYY-MM-DD)。取得日ではない。 */
  date: string;
  rates: { JPY?: number };
};

export type FxRate = {
  /** £1 = 何円か。 */
  jpyPerGbp: number;
  /** ECB がこのレートを公表した日 (YYYY-MM-DD)。 */
  rateDate: string;
  fetchedAt: string;
};

export async function fetchGbpJpyRate(): Promise<FxRate> {
  const res = await fetch(ENDPOINT, {
    headers: { Accept: "application/json" },
    next: { revalidate: FX_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Frankfurter responded ${res.status}`);
  }

  const data = (await res.json()) as FrankfurterResponse;
  const jpy = data.rates?.JPY;

  if (typeof jpy !== "number" || !Number.isFinite(jpy)) {
    throw new Error("Frankfurter returned no JPY rate");
  }

  return {
    jpyPerGbp: jpy,
    rateDate: data.date,
    fetchedAt: new Date().toISOString(),
  };
}

/** £N をおおよその円に直す。UI の早見表用。 */
export function toJpy(gbp: number, rate: number): number {
  return Math.round(gbp * rate);
}

/**
 * 早見表に出す金額。
 * ロンドンで実際に遭遇する価格帯(コーヒー・パブの1杯・食事・
 * ミュージカルの席・1日の交通費上限)に寄せて選んでいる。
 */
export const QUICK_AMOUNTS = [1, 5, 10, 20, 50, 100] as const;
