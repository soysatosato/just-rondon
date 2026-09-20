// 「ロンドンの街」のエリア分類。DB の Content.tags に入る値の正典。
// ここに無いタグは /reading/areas のフィルタに現れないので、増やすときは必ず追加する。
//
// 方角で切っているのは、ロンドンの住人自身がこの軸で街を語るため。
// 「北に住んでいる」「サウスは電車が違う」は日常会話の粒度で、
// テムズ川と地下鉄網の偏りという実体がある(南は地下鉄が薄く、
// National Rail が主役になる)。1記事に必ず1つだけ付く軸なので、
// 絞り込みチップとして破綻しない。
//
// コラム(lib/column-taxonomy.ts)や以前の時事セクションと違って
// 「何を論じるか」で切っていないのは、この連載が1エリア1本で
// 話題の種類が全記事でほぼ同じ(由来・歴史・いまの数字・歩き方)だから。
// 内容で切ると全部同じタグになる。

export const AREA_TAGS = [
  { key: "central", label: "セントラル" },
  { key: "east", label: "イースト" },
  { key: "north", label: "ノース" },
  { key: "south", label: "サウス" },
  { key: "west", label: "ウェスト" },
] as const;

export type AreaTagKey = (typeof AREA_TAGS)[number]["key"];

const TAG_LABELS = new Map<string, string>(
  AREA_TAGS.map((t) => [t.key, t.label]),
);

export function areaTagLabel(key: string): string {
  return TAG_LABELS.get(key) ?? key;
}

export function isKnownAreaTag(key: string): key is AreaTagKey {
  return TAG_LABELS.has(key);
}

/**
 * Content の汎用カラムに入れる、街ごとの事実。
 *
 * 専用カラムを足していないのは、この5項目が「見出しの下に1行で並べる
 * 事実」以外の使われ方をしないため。検索や絞り込みには使わないので、
 * 型を付けて持つ利得がスキーマを広げる代償に見合わない。
 * かわりにどのカラムが何なのかをここに正典として置く。
 *
 * - engTitle    英語名(`Brixton`)。スラッグ生成と、見出しの副題に使う
 * - route       宿エリアガイドの Area.id(`shoreditch` など)。
 *               lib/hotels/booking-link.ts の AREA_SEARCH_TERMS と
 *               同じ値のときだけ、記事から宿の検索リンクを出せる。
 *               対応するエリアが無ければ空文字
 * - description 行政区(`ランベス区`)
 * - description2 地下鉄・鉄道のゾーン(`2`、またがるなら `2〜3`)
 * - description3 中心部からの所要時間(`ヴィクトリアから地下鉄で9分`)
 */
export type AreaFacts = {
  borough: string | null;
  zone: string | null;
  access: string | null;
};

export function areaFacts(content: {
  description: string | null;
  description2: string | null;
  description3: string | null;
}): AreaFacts {
  return {
    borough: content.description?.trim() || null,
    zone: content.description2?.trim() || null,
    access: content.description3?.trim() || null,
  };
}
