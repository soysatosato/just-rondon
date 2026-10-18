/**
 * サイト内検索の照合。索引は public/search-index.json(postbuild で
 * scripts/build-search-index.mjs が作る)を、検索を開いたときに1度だけ読む。
 *
 * 770ページ程度なので、全件をブラウザで照合する。サーバーも外部の
 * 検索サービスも要らない。
 *
 * 照合は表記の揺れを吸収することに重きを置く。Search Console に実際に
 * 来ている検索語には、同じものを指す「93/4番線」「9 3/4」「9¾」「9と3/4番線」や、
 * 中黒を打たない「ナショナルギャラリー」が並んでいる。
 */

export type SearchEntry = {
  /** パス。 */
  u: string;
  /** 一覧に出す見出し(h1)。 */
  t: string;
  /** <title>。見出しと違うときだけ。照合に使う。 */
  a?: string;
  /** description の頭。結果の下に小さく出し、照合にも使う。 */
  d?: string;
  /** 区分(パンくずの1つ上)。 */
  s?: string;
};

type Prepared = SearchEntry & {
  /** 見出しと <title> を正規化したもの。 */
  nt: string;
  /** description を正規化したもの。 */
  nd: string;
  /** 見出しと <title> を小文字にしただけのもの。短い英単語の語頭判定に使う。 */
  wt: string;
  /** description を小文字にしただけのもの。 */
  wd: string;
  /** URL の階層の深さ。同点のとき浅いページ(区分のトップ)を上にする。 */
  depth: number;
};

export type SearchResult = SearchEntry & { score: number };

/**
 * 照合用の正規化。
 *
 *   - NFKC: 全角英数を半角に、「¾」を「3⁄4」に。
 *   - 小文字化。
 *   - ひらがなをカタカナに(「なしょなる」でも引ける)。
 *   - 中黒・空白・記号を落とす(「ナショナル・ギャラリー」と「ナショナルギャラリー」、
 *     「Tate Modern」と「tatemodern」を同じに扱う)。
 *   - 数字に挟まれた「と」を落とす(「9と3/4」→「934」。「/」も落ちるので
 *     「9¾」「93/4」「9 3/4」と揃う)。
 *
 * 長音記号「ー」は残す。落とすと「テート」と「テト」が同じになり、
 * 誤って当たるほうが増える。
 */
export function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u3041-\u3096]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0x60),
    )
    .replace(/(\d)\s*ト\s*(?=\d)/g, "$1")
    .replace(/[\s・･\u2044/\\|,.:;!?'"`~^*+=<>()[\]{}「」『』【】（）、。〜～\-‐‑–—_#&@%$]/g, "");
}

/**
 * カタカナと英語の両方で書かれる語。サイト内でも表記が揃っておらず
 * (運賃のページは「Oyster」、パリのページは「ユーロスター」)、どちらで
 * 打っても引けるようにする。片方を含む語は、もう片方に置き換えた形でも探す。
 */
const SYNONYMS: [string, string][] = (
  [
    ["オイスター", "oyster"],
    ["ユーロスター", "eurostar"],
    ["コンタクトレス", "contactless"],
    ["ヒースロー", "heathrow"],
    ["ガトウィック", "gatwick"],
    ["スタンステッド", "stansted"],
    ["チューブ", "tube"],
    ["エリザベスライン", "elizabethline"],
    ["ブリットレイル", "britrail"],
    ["カウンシルタックス", "counciltax"],
    ["ナショナルレール", "nationalrail"],
    ["サービスチャージ", "servicecharge"],
    ["ウエストエンド", "westend"],
    ["プレミアリーグ", "premierleague"],
    ["アフタヌーンティー", "afternoontea"],
    ["バンクシー", "banksy"],
  ] as const
).map(([a, b]) => [normalize(a), normalize(b)]);

function alternatives(term: string): string[] {
  const out = [term];
  for (const [a, b] of SYNONYMS) {
    if (term.includes(a)) out.push(term.replace(a, b));
    else if (term.includes(b)) out.push(term.replace(b, a));
  }
  return out;
}

/**
 * 語を文字の種類の境目で分ける(英字/カタカナ/漢字/その他)。
 * 「gp登録」→「gp」「登録」、「ナショナルギャラリー所要時間」→2語。
 * 1文字のカナ(「の」「を」などの助詞。正規化でカタカナになっている)は捨てる。
 */
function scriptParts(term: string): string[] {
  const runs =
    term.match(/[a-z]+|[\u30a0-\u30ff]+|[\u3400-\u9fff々〆]+|[^a-z\u30a0-\u30ff\u3400-\u9fff々〆]+/g) ?? [];
  return runs.filter((run) => !(run.length === 1 && /[\u30a0-\u30ff]/.test(run)));
}

const SHORT_LATIN = /^[a-z]{1,3}$/;

/**
 * 1語が見出し・description のどこに当たるかの点。当たらなければ 0。
 *
 * 3文字以下の英字は語頭でしか当てない。空白を落として比べると、
 * 「ETA」が「the talk」や「ballet and」の中に当たってしまうため。
 */
function scorePart(entry: Prepared, part: string): number {
  if (SHORT_LATIN.test(part)) {
    const head = new RegExp(`(^|[^a-z])${part}`);
    if (head.test(entry.wt)) return entry.wt.startsWith(part) ? 10 : 6;
    return head.test(entry.wd) ? 2 : 0;
  }
  if (entry.nt.startsWith(part)) return 10;
  if (entry.nt.includes(part)) return 6;
  if (entry.nd.includes(part)) return 2;
  return 0;
}

/** 入力の1かたまり(空白で区切った単位)の点。分けた部分語でも試す。 */
function scoreChunk(entry: Prepared, chunk: string): number {
  let best = 0;
  for (const alt of alternatives(chunk)) {
    best = Math.max(best, scorePart(entry, alt));
    const parts = scriptParts(alt);
    if (best === 0 && parts.length > 1) {
      const scores = parts.map((part) => scorePart(entry, part));
      // ひと続きで当たるより弱く扱う。部分語がばらばらの場所に当たっただけ。
      if (scores.every((score) => score > 0)) {
        best = Math.max(best, Math.min(...scores) * 0.5);
      }
    }
  }
  return best;
}

export function prepare(entries: SearchEntry[]): Prepared[] {
  return entries.map((e) => {
    const title = `${e.t} ${e.a ?? ""}`;
    return {
      ...e,
      nt: normalize(title),
      nd: normalize(e.d ?? ""),
      wt: title.normalize("NFKC").toLowerCase(),
      wd: (e.d ?? "").normalize("NFKC").toLowerCase(),
      depth: e.u === "/" ? 0 : e.u.split("/").length - 1,
    };
  });
}

/**
 * 空白で区切ったかたまりごとに点を付け、全部が当たったページだけを返す(AND)。
 * 見出しの頭に当たるものを最も上に出し、同点なら浅い階層・短い見出しを上にする。
 */
export function search(
  index: Prepared[],
  query: string,
  limit = 30,
): SearchResult[] {
  const chunks = query
    .split(/[\s\u3000]+/)
    .map(normalize)
    .filter(Boolean);
  if (chunks.length === 0) return [];

  const results: SearchResult[] = [];
  for (const entry of index) {
    let score = 0;
    let matchedAll = true;
    for (const chunk of chunks) {
      const s = scoreChunk(entry, chunk);
      if (s === 0) {
        matchedAll = false;
        break;
      }
      score += s;
    }
    if (!matchedAll) continue;
    score -= entry.depth * 0.1 + entry.t.length / 1000;
    results.push({ u: entry.u, t: entry.t, a: entry.a, d: entry.d, s: entry.s, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

let cached: Promise<Prepared[]> | null = null;

/** 索引を読む。2回目以降は同じ Promise を返す。失敗したら次は読み直す。 */
export function loadSearchIndex(): Promise<Prepared[]> {
  if (!cached) {
    cached = fetch("/search-index.json")
      .then((res) => {
        if (!res.ok) throw new Error(`search index ${res.status}`);
        return res.json() as Promise<{ entries: SearchEntry[] }>;
      })
      .then((data) => prepare(data.entries))
      .catch((error) => {
        cached = null;
        throw error;
      });
  }
  return cached;
}

/**
 * 検索語を GA4 に送る(推奨イベント search)。0件だった語は次に書く記事の
 * 候補になる。GA が読み込まれていない環境(開発・同意前など)では何もしない。
 */
export function trackSearch(term: string, resultCount: number) {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  gtag?.("event", "search", {
    search_term: term,
    results_count: resultCount,
  });
}
