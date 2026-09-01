import { absoluteUrl } from "@/lib/seo";

/**
 * パンくずの階層定義。サイト全体でここだけが階層を知っている。
 *
 * 以前は汎用の BreadCrumbs に加えてセクション専用の実装が5つあり、
 * さらに JSON-LD の BreadcrumbList を各 jsonld.ts が別々に組み立てていた。
 * 同じ階層を7箇所で手書きしていたので、画面表示とJSON-LDが食い違い、
 * ナビの大区分(menu.ts)もパンくずに現れていなかった。
 *
 * 階層はグローバルナビの大区分(components/navbar/menu.ts)と揃える。
 * 大区分 → セクション → 記事、が基本形:
 *
 *   Home > 英国を読む > コラム > 記事タイトル
 *
 * ただし「旅の準備」だけは大区分にならない。配下のリンクが実際には
 * /sightseeing 配下のページばかりで、URL上の親が既に「観光」だからで、
 * 大区分としてもう一段挟むと同じページが二重に現れる。
 *
 * ここに登録するのは「他のページの親になりうるページ」だけ。記事本文の
 * ページは自分のタイトルを current として渡すので登録しなくてよい。
 */

type TreeNode = {
  label: string;
  /** 親のパス。省略した場合は大区分(Home直下)。 */
  parent?: string;
};

const TREE = {
  // ---- 大区分(Home の直下) ------------------------------------------
  "/plan": { label: "旅行プラン作成" },
  "/sightseeing": { label: "観光" },
  "/things-to-do": { label: "体験する" },
  "/beyond-london": { label: "ロンドンの外へ" },
  "/living": { label: "住む・働く" },
  "/events": { label: "今週のロンドン" },
  "/reading": { label: "英国を読む" },

  // ---- 観光 ----------------------------------------------------------
  "/museums": { label: "美術館ナビ", parent: "/sightseeing" },
  "/sightseeing/all": { label: "観光スポット一覧", parent: "/sightseeing" },
  "/sightseeing/areas": { label: "エリアガイド", parent: "/sightseeing" },
  "/sightseeing/transport": { label: "交通ガイド", parent: "/sightseeing" },
  "/sightseeing/football": {
    label: "プレミアリーグ観戦ガイド",
    parent: "/sightseeing",
  },
  "/sightseeing/blue-plaques": {
    label: "ブルー・プラーク",
    parent: "/sightseeing",
  },
  "/sightseeing/film-locations": {
    label: "映画・ドラマのロケ地",
    parent: "/sightseeing",
  },
  "/sightseeing/christmas-markets": {
    label: "クリスマスマーケット",
    parent: "/sightseeing",
  },

  // ---- 体験する ------------------------------------------------------
  "/musicals": { label: "ミュージカル", parent: "/things-to-do" },
  "/musicals/theatres": { label: "劇場ガイド", parent: "/musicals" },
  "/restaurants": { label: "レストランとお店", parent: "/things-to-do" },
  "/shopping": { label: "ロンドンの買い物", parent: "/things-to-do" },
  "/brands": { label: "イギリスのブランド", parent: "/things-to-do" },
  "/souvenirs": { label: "ロンドンのお土産", parent: "/things-to-do" },

  // ---- 住む・働く ----------------------------------------------------
  "/visa": { label: "ビザガイド", parent: "/living" },
  "/housing": { label: "住まい探し", parent: "/living" },
  "/money": { label: "お金・銀行", parent: "/living" },
  "/health": { label: "医療・NHS", parent: "/living" },
  "/food": { label: "食費を抑える", parent: "/living" },
  "/social": { label: "出会いと人間関係", parent: "/living" },
  "/trouble": { label: "トラブル対応", parent: "/living" },
  "/jobs": { label: "労働問題", parent: "/living" },
  "/jobs/service-charges": {
    label: "サービスチャージ",
    parent: "/jobs",
  },
  "/jobs/service-charges/case-story": {
    label: "当事者の記録",
    parent: "/jobs/service-charges",
  },

  // ---- 今週のロンドン ------------------------------------------------
  "/events/calendar": { label: "年間イベントカレンダー", parent: "/events" },

  // ---- 英国を読む ----------------------------------------------------
  "/column": { label: "コラム", parent: "/reading" },
  "/modern-britain": { label: "英国のいまを論じる", parent: "/reading" },
  "/history": { label: "イギリスの歴史", parent: "/reading" },
  "/british-english": { label: "イギリス英語", parent: "/reading" },
} as const satisfies Record<string, TreeNode>;

/** 木に登録済みのパス。呼び出し側の綴り間違いは型エラーになる。 */
export type BreadcrumbPath = keyof typeof TREE;

// 親の綴り間違いは階層が黙って途切れる形で壊れるので、読み込み時に弾く。
for (const [path, node] of Object.entries(TREE) as [string, TreeNode][]) {
  if (node.parent && !(node.parent in TREE)) {
    throw new Error(
      `パンくずの親が未登録です: ${path} の parent "${node.parent}"`
    );
  }
}

export type Crumb = { label: string; href?: string };

/** 登録済みなら木のラベル。未登録なら undefined。 */
export function treeLabel(path: string): string | undefined {
  return path in TREE ? TREE[path as BreadcrumbPath].label : undefined;
}

/**
 * { name, path } 形式の指定を Crumb に直す。木に載っているパスは木の
 * ラベルを優先し、呼び出し側が渡した別表記("ブループラーク巡り" など)は
 * 使わない。画面と構造化データで違う名前が出るのを防ぐため。
 */
export function crumbFor(item: {
  name: string;
  path: string;
}): { label: string; href: string } {
  return { label: treeLabel(item.path) ?? item.name, href: item.path };
}

export type BreadcrumbSpec = {
  /** 木に登録済みの祖先。ここまでは全てリンクになる。 */
  path: BreadcrumbPath;
  /** 木に置けない動的な中間階層(個別の美術館名など)。 */
  trail?: { label: string; href: string }[];
  /** 現在地。記事タイトルなど。リンクにはしない。 */
  current?: string;
  /** 現在地のURL。JSON-LD にだけ使う(画面ではリンクしない)。 */
  currentHref?: string;
};

/** 登録済みノード自身と、その上の祖先。Home は含まない。 */
function chainOf(path: BreadcrumbPath): Crumb[] {
  const chain: Crumb[] = [];
  let key: string | undefined = path;

  while (key) {
    const node: TreeNode = TREE[key as BreadcrumbPath];
    chain.unshift({ label: node.label, href: key });
    key = node.parent;
  }

  return chain;
}

/**
 * path より上の階層。木に登録していないページからも呼べる。
 *
 * 未登録のパスは、いちばん長い登録済みの前方一致を親とみなす。
 * /sightseeing/transport/fares のような記事ページを木に一つずつ
 * 書き足さなくても「観光 > 交通ガイド」が出るようにするため。
 */
export function ancestorCrumbs(path: string): Crumb[] {
  if (path in TREE) return chainOf(path as BreadcrumbPath).slice(0, -1);

  const nearest = Object.keys(TREE)
    .filter((key) => path.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0];

  return nearest ? chainOf(nearest as BreadcrumbPath) : [];
}

/**
 * Home から現在地までの並び。画面表示と JSON-LD の両方がこれを使うので、
 * 二つが食い違うことはない。
 */
export function resolveCrumbs(spec: BreadcrumbSpec): Crumb[] {
  return [
    { label: "Home", href: "/" },
    ...chainOf(spec.path),
    ...(spec.trail ?? []),
    ...(spec.current
      ? [{ label: spec.current, href: spec.currentHref }]
      : []),
  ];
}

/**
 * BreadcrumbList の構造化データ。
 * URL を持たない要素(末尾の現在地)は item を省く。Google は最後の要素の
 * item を必須としない。
 */
export function crumbsJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
    })),
  };
}

/** 画面のパンくずと同じ spec から作る BreadcrumbList。 */
export function breadcrumbListJsonLd(spec: BreadcrumbSpec) {
  return crumbsJsonLd(resolveCrumbs(spec));
}
