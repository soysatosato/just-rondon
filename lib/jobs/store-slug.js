// lib/jobs/store-slug.js
//
// 店舗ページ(/jobs/service-charges/stores/<slug>)のURLと、
// そのページを検索結果に出してよいかの判定。
//
// CommonJS の .js で書いてある。next-sitemap.config.js が同じ規則で
// URL を組み立てる必要があり、あちらは CJS なので TS を読めない。
// 規則を2箇所に書くと、片方だけ直したときに sitemap が存在しないURLを
// 申告する(逆に、公開したページを申告しない)ことになるので、
// 規則はこのファイルだけに置いて双方から読む。

const STORES_BASE = "/jobs/service-charges/stores";

/**
 * 店名のURL用表記。ASCIIの英数字だけを拾う。
 *
 * 日本語だけの店名(「露結」「てんまる」など)はここが空になり "store" に落ちる。
 * URLに日本語をそのまま入れると、sitemap.xml(パーセントエンコードが必要)と
 * canonical や Link の href で表記が食い違いやすい。名前はタイトルと見出しで
 * 出せば検索には十分に効くので、URLはASCIIに寄せる。
 *
 * @param {string} name
 * @returns {string}
 */
function nameSlug(name) {
  const slug = (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return "store";
  if (slug.length <= 48) return slug;

  // 長い店名は語の途中で切らない。
  const cut = slug.slice(0, 48);
  const lastDash = cut.lastIndexOf("-");
  return lastDash > 0 ? cut.slice(0, lastDash) : cut;
}

/**
 * ポストコードのURL用表記。"NW5 2JT" → "nw5-2jt"。
 *
 * @param {string | null | undefined} postcode
 * @returns {string}
 */
function postcodeSlug(postcode) {
  return (postcode || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * placeId から6桁の英数字(FNV-1a)。ポストコードを持たない回答の識別子。
 *
 * 店舗候補に出てこない店を手入力で登録した回答は、placeId が UUID で
 * ポストコードが null になる。同じ文字列からは常に同じ値が出るので、
 * URLは回答が増えても変わらない。
 *
 * @param {string} value
 * @returns {string}
 */
function shortHash(value) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36).padStart(6, "0").slice(-6);
}

/**
 * 店舗ページの slug。「店名-ポストコード」。
 *
 * ポストコードを付けるのは、同名の別店舗(チェーンの各店)が同じURLに
 * ぶつからないようにするため。ハッシュより読めるうえ、ポストコード自体が
 * 検索語として使われる。
 *
 * 同じ placeId の回答は店名もポストコードも Google Places 由来で揃っている
 * ため、どの回答1件から作っても同じ slug になる。回答一覧のリンクは
 * 回答1件から、店舗ページのURLは集計から作っているので、この前提が崩れると
 * リンク先が 404 になる。
 *
 * @param {{ storeName: string, postcode?: string | null, placeId: string }} store
 * @returns {string}
 */
function storeSlug(store) {
  const tail = postcodeSlug(store.postcode) || shortHash(store.placeId);
  return `${nameSlug(store.storeName)}-${tail}`;
}

/**
 * 店舗ページのパス。
 *
 * @param {string} slug
 * @returns {string}
 */
function storePath(slug) {
  return `${STORES_BASE}/${slug}`;
}

/**
 * この店舗ページを検索結果に出してよいか。
 *
 * 回答1件・自由記述なし・金額なしの店舗は、ページに書けることが
 * 「徴収の有無と分配方法」の一行しかない。それが数十ページ並ぶと
 * サイト全体の評価を薄めるので、中身のあるページだけを sitemap と
 * index の対象にする。対象外のページも公開はする(一覧から辿れるし、
 * 回答が増えれば自動的に対象になる)。
 *
 * 未検証(店舗候補に無く手入力で登録された)の店舗は、実在の確認が
 * 済んでいないので常に対象外。
 *
 * @param {{ verifiedCount: number, responseCount: number, commentCount: number, amountCount: number }} store
 * @returns {boolean}
 */
function isIndexableStore(store) {
  if (store.verifiedCount < 1) return false;
  return (
    store.responseCount >= 2 || store.commentCount >= 1 || store.amountCount >= 1
  );
}

module.exports = {
  STORES_BASE,
  nameSlug,
  postcodeSlug,
  shortHash,
  storeSlug,
  storePath,
  isIndexableStore,
};
