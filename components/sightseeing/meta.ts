import { fitTitle, truncateDescription, TITLE_MAX_LENGTH } from "@/lib/seo";

/**
 * 観光スポット詳細(/sightseeing/[slug])のタイトルと description を組み立てる。
 *
 * ここを本文とは別に持つ理由:
 * DB の summary は「〜は、〜に位置する〜です。」という百科事典型の紹介文で、
 * 読み物としては正しい一方、検索結果のスニペットとしては弱い。実際に
 * 検索されているのは「所要時間」「料金」「行き方」といった具体的な疑問で、
 * Attraction はそれらを durationText / priceAdult / nearestStation として
 * 構造化して持っている(145件中 durationText 120件・priceAdult 136件)。
 * 本文を書き換えずに、その事実だけをスニペット側へ寄せる。
 */

/** truncateDescription の既定値と揃える。日本語の検索結果はおおむねここで切られる。 */
const DESCRIPTION_MAX_LENGTH = 120;

/**
 * 事実の後ろに本文を続けるとき、これ未満しか残らないなら本文を諦める。
 * 半端に切られた数文字が続くくらいなら、事実だけで終わらせたほうが読める。
 */
const MIN_BODY_LENGTH = 20;

type AttractionMetaInput = {
  name: string;
  summary?: string | null;
  tagline?: string | null;
  durationText?: string | null;
  priceAdult?: string | null;
  nearestStation?: string | null;
  isFree?: boolean;
};

/**
 * タイトルのサフィックス候補。長い順に渡し、収まるいちばん長いものが選ばれる。
 *
 * 旧実装は全145ページが実質3種類の語尾しか持たず、しかもその末尾
 * 「｜ロンドン観光ガイド」が全ページ共通だった。34文字しかない表示領域の
 * 9文字を、どのページでも同じで検索語にもならない文字列が占めていたことになる。
 *
 * 「とは？」を先頭に置くのは、実際に「クラレンスハウスとは」のような
 * クエリで表示されているため。疑問形は名前だけのクエリで来た人に対して
 * 「このページが答えを持っている」ことを示せる。
 */
const TITLE_SUFFIXES = [
  "とは？見どころ・所要時間・行き方",
  "とは？見どころと所要時間",
  "の見どころ・所要時間",
  "の見どころ",
  // 名前が長いスポット向けの最後の砦。これも入らなければ名前だけになる。
  "とは",
];

/**
 * 所要時間を持つスポット向けのサフィックス。
 *
 * 「30分」「2〜3時間」のような実データをタイトルに入れると、
 * 同じ語尾が並ぶ検索結果の中で唯一そのページだけが持つ情報になる。
 * durationText は原文の幅(「3時間〜」等)をそのまま保持しているので、
 * 数値へ丸めずに文字列のまま差し込む。
 */
function durationSuffixes(durationText: string) {
  return [
    `とは？所要時間${durationText}・見どころ・行き方`,
    `とは？所要時間${durationText}と見どころ`,
    `の所要時間${durationText}・見どころ`,
    `の所要時間${durationText}`,
  ];
}

export function attractionTitle(attraction: AttractionMetaInput): string {
  const duration = attraction.durationText?.trim();

  // 所要時間があればそれを優先する。収まらなければ通常のサフィックスへ落ちる。
  if (duration) {
    const withDuration = fitTitle(attraction.name, durationSuffixes(duration));
    // fitTitle は収まらないとき名前だけを返す。その場合は通常版を試す。
    if (withDuration !== attraction.name) return withDuration;
  }

  return fitTitle(attraction.name, TITLE_SUFFIXES);
}

/**
 * 事実を先頭に寄せた description を作る。
 *
 * 冒頭に「所要時間○○/料金○○/最寄り○○」を置き、そのあとに本文の summary を
 * 続ける。スニペットは先頭から表示されるため、読者が探している数字が
 * 最初の一目に入る。事実が1つも無いスポットでは、従来どおり summary だけを出す。
 */
export function attractionDescription(attraction: AttractionMetaInput): string {
  const facts: string[] = [];

  if (attraction.durationText?.trim()) {
    facts.push(`所要時間${attraction.durationText.trim()}`);
  }

  // isFree のスポットは priceAdult も "無料" が入っているので二重に出さない。
  if (attraction.priceAdult?.trim()) {
    facts.push(
      attraction.isFree ? "入場無料" : `料金${attraction.priceAdult.trim()}`
    );
  }

  if (attraction.nearestStation?.trim()) {
    facts.push(attraction.nearestStation.trim());
  }

  const body = (attraction.summary ?? attraction.tagline ?? "").trim();

  if (facts.length === 0) {
    return truncateDescription(
      body || "ロンドン観光に役立つスポット情報を紹介します。"
    );
  }

  const head = `${facts.join("・")}。`;

  if (!body) return head;

  // 事実と本文を繋げてから truncateDescription に渡してはいけない。
  // あの関数は上限を超えると最後の「。」まで戻すので、事実部分の句点が
  // 唯一の句点になり、本文が丸ごと落ちて事実だけのスニペットになる。
  // 先に本文側だけを残り字数へ収め、そのあとで事実を前置きする。
  // truncateDescription は句点が見つからないとき末尾に「…」を足すので、
  // 戻り値が maxLength + 1 文字になり得る。その1文字ぶんを先に引いておく。
  const remaining = DESCRIPTION_MAX_LENGTH - head.length - 1;

  // 本文を入れる余地が無いほど事実が長い場合は、事実だけで返す。
  if (remaining < MIN_BODY_LENGTH) return head;

  return `${head}${truncateDescription(body, remaining)}`;
}

export { TITLE_MAX_LENGTH };
