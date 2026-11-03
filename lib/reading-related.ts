/**
 * 読み物の「関連する読み物」を選ぶ。
 *
 * 以前の記事末尾は、公開日時で前後の1本ずつ(AdjacentContentNav)だけだった。
 * 毎日別の話題を出しているので、前後の記事はほぼ無関係になる
 * (ロンドン塔のカラスの次がマーマイトと葉酸)。話題の近い記事を、
 * セクション(コラム・イギリス英語・英国のいま・通史)をまたいで選ぶ。
 *
 * 選び方:
 *   1. 題・英題・要約・節の見出しの文字の重なり(TF-IDF のコサイン)。
 *      和文は分かち書きが無いので、カタカナ・漢字・英数字の連なりを
 *      2文字ずつに刻んで語の代わりにする。「ロンドン」「イギリス」のように
 *      どの記事にも出る文字は IDF で効かなくなる。
 *   2. 同じ観光スポットに紐づいた記事(ContentAttraction)は強く足す。
 *      ロンドン塔のカラスと鍵の儀式は、本文の言葉が違っても同じ場所の話。
 *   3. 同じテーマ(lib/reading-topics.ts で手で束ねたもの)の記事を足す。
 *      文字の重なりだけだと「1942年」「報告書」が同じだけの記事が並ぶ。
 *   4. 同じ連載の回は外す(連載の全話リストが別にある)。
 *
 * テーマの表に無い新しい記事(DB にだけ入る)は、1・2だけで選ばれる。
 */

export type RelatedCandidate = {
  /** 重複除外のための一意な鍵。DB の記事は id、通史は "history:<slug>"。 */
  key: string;
  href: string;
  title: string;
  /** 一覧に出す英語の見出し(イギリス英語の語)。 */
  engTitle?: string | null;
  summary?: string | null;
  sectionTitles?: string[];
  /** 本文(リード+各節)。あれば語の数え上げに加える。 */
  body?: string | null;
  image?: string | null;
  /** カードの上に出すセクション名。 */
  kind: RelatedKind;
  seriesName?: string | null;
  attractionIds?: string[];
  /** 手で束ねたテーマ(lib/reading-topics.ts)。 */
  themes?: string[];
  views?: number;
};

export type RelatedKind =
  | "column"
  | "british-english"
  | "modern-britain"
  | "history";

export const RELATED_KIND_LABEL: Record<RelatedKind, string> = {
  column: "コラム",
  "british-english": "イギリス英語",
  "modern-britain": "英国のいま",
  history: "イギリスの歴史",
};

const RUN = /[ァ-ヺー]+|[一-龠々〆ヵヶ]+|[A-Za-z][A-Za-z']+/g;

/**
 * 文字列を2文字ずつの語に刻む。英単語はそのまま1語。
 *
 * 年(1952 など)は語にしない。同じ年が出てくるだけの記事(1952年の
 * スモッグと、1952年に始まった芝居)が関連として並んでしまう。
 */
function tokens(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(RUN)) {
    const run = m[0];
    if (/^[A-Za-z]/.test(run)) {
      const w = run.toLowerCase();
      if (w.length >= 3) out.push(w);
      continue;
    }
    if (run.length === 1) continue;
    for (let i = 0; i < run.length - 1; i++) out.push(run.slice(i, i + 2));
  }
  return out;
}

function docText(c: RelatedCandidate): string[] {
  // 題は要約の3倍に数える。題に出る語がその記事の主題。
  const title = `${c.title} ${c.engTitle ?? ""}`;
  return [
    ...tokens(title),
    ...tokens(title),
    ...tokens(title),
    ...tokens(c.summary ?? ""),
    ...tokens((c.sectionTitles ?? []).join(" ")),
    ...tokens(c.body ?? ""),
  ];
}

type Vector = Map<string, number>;

function buildVectors(docs: RelatedCandidate[]): Map<string, Vector> {
  const tfs = docs.map((d) => {
    const tf = new Map<string, number>();
    for (const t of docText(d)) tf.set(t, (tf.get(t) ?? 0) + 1);
    return tf;
  });
  const df = new Map<string, number>();
  for (const tf of tfs) for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);

  const n = docs.length;
  const vectors = new Map<string, Vector>();
  docs.forEach((d, i) => {
    const v: Vector = new Map();
    let norm = 0;
    for (const [t, f] of tfs[i]) {
      const idf = Math.log((n + 1) / ((df.get(t) ?? 0) + 1));
      // 全記事の半分以上に出る語は話題を分けないので捨てる。
      if ((df.get(t) ?? 0) > n / 2) continue;
      const w = (1 + Math.log(f)) * idf;
      v.set(t, w);
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [t, w] of v) v.set(t, w / norm);
    vectors.set(d.key, v);
  });
  return vectors;
}

function cosine(a: Vector, b: Vector): number {
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  let sum = 0;
  for (const [t, w] of small) {
    const o = large.get(t);
    if (o) sum += w * o;
  }
  return sum;
}

/** 文字の重なりがこれ未満なら、関連としては出さない。 */
const MIN_SCORE = 0.06;
/** 同じスポットに紐づく記事1件あたりの加点。 */
const SHARED_SPOT_BONUS = 0.25;
/** 同じテーマ1つあたりの加点。文字の重なり(多くは0.05〜0.3)より強くする。 */
const SHARED_THEME_BONUS = 0.3;

export function pickRelated(
  current: RelatedCandidate,
  pool: RelatedCandidate[],
  take = 4,
): RelatedCandidate[] {
  const docs = [current, ...pool.filter((p) => p.key !== current.key)];
  const vectors = buildVectors(docs);
  const cur = vectors.get(current.key)!;
  const spots = new Set(current.attractionIds ?? []);
  const themes = new Set(current.themes ?? []);

  const scored = docs
    .slice(1)
    .filter(
      (d) =>
        !(current.seriesName && d.seriesName === current.seriesName),
    )
    .map((d) => {
      const sharedSpots = (d.attractionIds ?? []).filter((id) =>
        spots.has(id),
      ).length;
      const sharedThemes = (d.themes ?? []).filter((t) => themes.has(t)).length;
      return {
        d,
        score:
          cosine(cur, vectors.get(d.key)!) +
          sharedSpots * SHARED_SPOT_BONUS +
          sharedThemes * SHARED_THEME_BONUS,
      };
    })
    .filter((s) => s.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || (b.d.views ?? 0) - (a.d.views ?? 0));

  // 同じ連載の別の回が並ぶと1つの話題で枠が埋まるので、連載ごとに1本まで。
  const picked: RelatedCandidate[] = [];
  const seenSeries = new Set<string>();
  for (const { d } of scored) {
    if (d.seriesName) {
      if (seenSeries.has(d.seriesName)) continue;
      seenSeries.add(d.seriesName);
    }
    picked.push(d);
    if (picked.length >= take) break;
  }
  return picked;
}
