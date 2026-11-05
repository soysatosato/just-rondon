/**
 * 郵便番号 → 座標(その郵便番号の中心点)。postcodes.io で 2026-11-05 に引いた値。
 * ブランドの店舗(seed-brands.ts)が、住所の郵便番号からここを引いて地図に置く。
 *
 * 英国の郵便番号は十数軒単位なので、中心点でも地図と「近くのスポット」の計算には
 * 足りる。建物の入口そのものではない。
 *
 * W1A 1ER(フォートナム&メイソンの公式住所)は郵便局の大口用の番号で、
 * 中心点が別の地区(クラーケンウェル)に落ちる。公式が地図アプリ用に案内している
 * W1J 9LE に読み替える(POSTCODE_ALIASES)。
 * W1B 4TB(バーバリー リージェント・ストリート店)は postcodes.io に無いので、
 * 地図には置かない。
 */
export const POSTCODE_COORDS: Record<string, { lat: number; lng: number }> = {
  "E9 6LP": { lat: 51.546486, lng: -0.051283 },
  "OX26 6WD": { lat: 51.891821, lng: -1.155714 },
  "SW10 0LJ": { lat: 51.48338, lng: -0.177351 },
  "W1C 1AP": { lat: 51.514053, lng: -0.15432 },
  "W1F 7RP": { lat: 51.513684, lng: -0.138928 },
  "W1J 9LE": { lat: 51.508408, lng: -0.137947 },
  "W1K 3DJ": { lat: 51.510865, lng: -0.147157 },
  "W1K 4AX": { lat: 51.512732, lng: -0.146404 },
  "W1S 2YL": { lat: 51.511737, lng: -0.142048 },
  "W1S 4AY": { lat: 51.510049, lng: -0.142218 },
  "W1S 4HH": { lat: 51.509003, lng: -0.141425 },
  "W1S 4QE": { lat: 51.509272, lng: -0.141385 },
  "WC2E 8PW": { lat: 51.511042, lng: -0.123226 },
  "WC2R 1AP": { lat: 51.513089, lng: -0.112967 },
};

/** 住所の郵便番号を、地図に置くための郵便番号に読み替える。 */
export const POSTCODE_ALIASES: Record<string, string> = {
  "W1A 1ER": "W1J 9LE",
};

const POSTCODE_RE = /([A-Z]{1,2}[0-9][0-9A-Z]?)\s?([0-9][A-Z]{2})\b/;

/** 住所から郵便番号と座標を引く。見つからなければ null。 */
export function geocodeAddress(address: string | undefined | null) {
  const m = address?.match(POSTCODE_RE);
  if (!m) return null;
  const postcode = `${m[1]} ${m[2]}`;
  const key = POSTCODE_ALIASES[postcode] ?? postcode;
  const coords = POSTCODE_COORDS[key];
  return coords ? { postcode: key, ...coords } : null;
}
