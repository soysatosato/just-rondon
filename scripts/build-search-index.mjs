// サイト内検索の索引(public/search-index.json)を作る。postbuild で next-sitemap の後に走る。
//
// 索引の元はビルドが書き出した HTML(.next/server/app/**/*.html)。
// 観光スポットやコラムは DB、ガイド記事はコードと、ページの出どころが
// ばらばらなので、出どころごとにタイトルを集めると漏れが出る。書き出された
// HTML なら、サイトマップに載るページはすべて揃っている。
//
//   - noindex のページは入れない(店舗ページ、未執筆の月など)。
//   - canonical が自分以外を指すページは入れない(/events/week/<最新号> など、
//     同じ内容の正のURLが別にあるもの)。
//   - 区分はパンくずの構造化データ(BreadcrumbList)から取る。
//
// ビルド後に DB へ足したページ(公開予約したコラムなど)は、次のデプロイで
// 索引に入る。サイトマップと同じ間隔。
//
// 使い方: node scripts/build-search-index.mjs  (next build の後)

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, ".next/server/app");
const OUT = path.join(ROOT, "public/search-index.json");
const SITE = "https://www.just-rondon.com";
const TITLE_SUFFIX = /\s*[|｜]\s*ジャスト・ロンドン\s*$/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function textOf(html) {
  // 子要素の境目に空白を入れる。<h1>名前<span>English</span></h1> が
  // 「名前English」とつながると、英語名で引けなくなる。
  // ただし <br> は日本語の見出しの改行位置なので、空白にせず詰める。
  return decode(html.replace(/<br\b[^>]*>/g, "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function breadcrumbNames(html) {
  for (const m of html.matchAll(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    try {
      const data = JSON.parse(m[1]);
      for (const node of Array.isArray(data) ? data : [data]) {
        if (node?.["@type"] === "BreadcrumbList") {
          return node.itemListElement.map((item) => String(item.name));
        }
      }
    } catch {
      // 壊れた JSON-LD は飛ばす。区分が空になるだけ。
    }
  }
  return [];
}

const files = walk(APP_DIR);
const entries = [];
const skipped = { noindex: 0, canonical: 0, untitled: 0 };

for (const file of files) {
  const rel = path.relative(APP_DIR, file).replace(/\.html$/, "");
  if (rel.startsWith("_") || /(^|\/)(404|500)$/.test(rel)) continue;
  const pagePath = rel === "index" ? "/" : `/${rel}`;

  const html = fs.readFileSync(file, "utf8");
  const head = html.slice(0, html.indexOf("</head>") + 7 || undefined);

  if (/<meta name="robots" content="[^"]*noindex/.test(head)) {
    skipped.noindex++;
    continue;
  }

  const canonical = head.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical) {
    const canonicalPath = new URL(canonical, SITE).pathname.replace(/\/$/, "") || "/";
    if (decodeURI(canonicalPath) !== decodeURI(pagePath)) {
      skipped.canonical++;
      continue;
    }
  }

  const title = decode(head.match(/<title>([^<]*)<\/title>/)?.[1] ?? "")
    .replace(TITLE_SUFFIX, "")
    .trim();
  const h1Html = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  const h1 = h1Html ? textOf(h1Html) : "";
  if (!title && !h1) {
    skipped.untitled++;
    continue;
  }

  const description = decode(
    head.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "",
  );

  // Home > 観光 > ロンドン自然史博物館 なら「観光」。区分のトップ自身は空。
  const crumbs = breadcrumbNames(html);
  const section = crumbs.length >= 3 ? crumbs[crumbs.length - 2] : "";

  // 見出しは h1 を優先する。<title> は検索結果向けに「とは？所要時間…」などを
  // 足しているので、一覧に並べると長い。照合には両方を使う。
  const label = h1 && h1.length <= 80 ? h1 : title;

  entries.push({
    u: pagePath,
    t: label,
    ...(title && title !== label ? { a: title } : {}),
    ...(description ? { d: description.slice(0, 120) } : {}),
    ...(section ? { s: section } : {}),
  });
}

// 浅い階層(区分のトップ・ハブ)を先に置く。点数が並んだときの順になる。
entries.sort(
  (a, b) => a.u.split("/").length - b.u.split("/").length || a.u.localeCompare(b.u),
);

fs.writeFileSync(OUT, JSON.stringify({ v: 1, entries }));
console.log(
  `search index: ${entries.length} pages -> ${path.relative(ROOT, OUT)} ` +
    `(skipped noindex ${skipped.noindex}, non-canonical ${skipped.canonical}, untitled ${skipped.untitled})`,
);
