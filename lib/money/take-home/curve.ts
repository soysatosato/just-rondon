import {
  calculateTakeHome,
  governmentTake,
  type TakeHomeInput,
} from "./calculate";

export type RatePoint = {
  /** 額面の年収。 */
  gross: number;
  /** 次の£1のうち国に納める割合(所得税+NI+学生ローン)。 */
  marginal: number;
  /** 額面全体に対して国に納めている割合。 */
  effective: number;
  takeHome: number;
};

/**
 * 限界税率の差を取る幅。
 *
 * £1 で差を取ると、非課税枠の逓減が「£2につき£1」なので奇数・偶数で
 * 40% と 60% が交互に出てギザギザになる。£10 なら丸めの影響が消え、
 * 境目をまたぐ誤差もチャートの1ピクセルに収まる。
 */
const DIFF_STEP = 10;

/**
 * 額面を0から xMax まで動かしたときの税率の曲線。
 *
 * 税率表から折れ線を組み立てず、計算の本体を標本点ごとに回している。
 * 年金の方式・学生ローン・税コード・スコットランドの6段階が重なった
 * 形を、表から正しく再現する式を別に持つと、計算機本体と食い違うため。
 */
export function sampleRateCurve(
  input: TakeHomeInput,
  xMax: number,
  count = 480,
): RatePoint[] {
  const points: RatePoint[] = [];
  for (let i = 0; i <= count; i++) {
    const gross = (xMax * i) / count;
    const here = calculateTakeHome({ ...input, grossAnnual: gross });
    const next = calculateTakeHome({ ...input, grossAnnual: gross + DIFF_STEP });
    const take = governmentTake(here);
    points.push({
      gross,
      marginal: Math.max(0, (governmentTake(next) - take) / DIFF_STEP),
      effective: gross > 0 ? take / gross : 0,
      takeHome: here.takeHome,
    });
  }
  return points;
}

/** チャートの横軸の右端。額面が見切れないよう、大きい年収では伸ばす。 */
export function curveDomainMax(gross: number) {
  const base = 160_000;
  if (gross <= base * 0.92) return base;
  return Math.ceil((gross * 1.25) / 20_000) * 20_000;
}
