/**
 * ★ 役目を終えたファイル。components/sightseeing/stories.ts に置き換えた。
 *
 * /sightseeing/[slug] は AttractionStory を読むようになったので、
 * ここの関数はどこからも呼ばれていない。AttractionSection モデルを
 * 削除するときに、このファイルも一緒に消す。
 *
 * 残しているのは、表示を切り替えた直後に問題が出たとき戻せるようにするため。
 * 新しく使わないこと。
 *
 * ここで起きていた問題(自由文字列の title を正規表現で推測していた)と、
 * それを kind の固定値でどう解いたかは stories.ts の冒頭に書いてある。
 *
 * --- 以下、旧実装の説明 ---
 *
 * 詳細ページ本文に出す AttractionSection の取捨選択。
 *
 * 料金・アクセス・開館時間などはファクトバーへ移したので、本文で
 * もう一度同じことを言う必要がない。ただし DB の sections は削っていない
 * (抽出が外れたときに情報が消えると困るため)ので、表示側で伏せる。
 *
 * 伏せるのは「ファクトバーに実際に値が入っている」ときだけにする。
 * 抽出できずファクトバーが空のまま本文も隠すと、そのページから
 * 料金の記載が丸ごと消えてしまう。
 */

export type SectionLike = {
  id: number;
  title: string;
  description: string | null;
  displayOrder: number;
};

/** ファクトバーに移した情報を含むセクションの見出し。 */
const PRICE_SECTION = /料金|チケット|入場料|価格/;
const ACCESS_SECTION = /アクセス|行き方|最寄|所在地|^場所/;
const HOURS_SECTION = /開館|開園|開場|営業|オープン|開閉/;
const DURATION_SECTION = /所要時間|滞在時間|見学時間/;

/** 「所要時間・年齢制限」のように、実用情報と他の話が同居する見出し。 */
const MIXED_SECTION = /年齢制限|注意|持ち物|服装|予約/;

/**
 * 「着いてからの歩き方」(visitFlow)と役割が重なる見出し。
 *
 * どちらも「何を見るか」を扱う。visitFlow が入っているページでは、
 * 見どころ節は同じ対象を名前だけ並べた劣化版になる——ウェストミンスター
 * 寺院なら、節が「ポエッツ・コーナー：チョーサー、シェイクスピア…」と
 * 列挙し、その200字ほど下で歩き方が同じ場所を「床石を踏まないと通れない
 * ほど密集している」と書く。読者は同じ話を2回読むことになる。
 *
 * そこで visitFlow を持つページでは、この見出しの節を伏せて歩き方に
 * 一本化する。
 *
 * これが機能するのは、判定が見出しと visitFlow の有無という
 * 明確な条件だけで決まるため。本文どうしの類似度で判定しようとすると
 * isRedundantOverview と同じ壁に当たる(同関数のコメント参照)。
 *
 * 伏せるのは visitFlow が実際に入っているときだけ。歩き方の無いページで
 * これを隠すと、見どころが本文から丸ごと消える。
 */
const VISIT_FLOW_SECTION =
  /見どころ|見られるもの|必見|ハイライト|展示されている|景観|体験内容|有名な展示|主な展示|現在開催中の展示/;

export function visibleSections(
  sections: SectionLike[],
  facts: {
    priceAdult: string | null;
    durationText: string | null;
    nearestStation: string | null;
    openingHours: string | null;
    /** 「着いてからの歩き方」のステップ数。0なら見どころ節を伏せない。 */
    visitFlowSteps?: number;
  },
): SectionLike[] {
  return sections
    .filter((s) => (s.description ?? "").trim().length > 0)
    .filter((s) => {
      const t = s.title;

      // 歩き方が入っているページでは、見どころ節は同じ対象の劣化版になる。
      // ここだけは MIXED_SECTION より先に判定する——「見どころ・注意点」の
      // ような複合見出しでも、歩き方があるなら歩き方を優先したいため。
      if (facts.visitFlowSteps && VISIT_FLOW_SECTION.test(t)) return false;

      // 実用情報以外の話も含む見出しは、隠すと本文が欠ける。常に残す。
      if (MIXED_SECTION.test(t)) return true;

      if (facts.priceAdult && PRICE_SECTION.test(t)) return false;
      if (facts.nearestStation && ACCESS_SECTION.test(t)) return false;
      if (facts.openingHours && HOURS_SECTION.test(t)) return false;
      // 所要時間だけのセクションは1行しかないことが多いので、
      // ファクトバーに出ていれば本文からは落とす。
      if (facts.durationText && DURATION_SECTION.test(t)) return false;

      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * 読み物として面白い順に並べ替える。
 *
 * DB の displayOrder は入力時の順で、スポットごとにばらばら。実際には
 * 「見どころ」が7番目で「ショップ・飲食」が2番目、というページがある。
 * 読者がこのページに来た理由は見どころなので、そこを最初に出す。
 *
 * 見出しの表記ゆれ(「見どころ」「見どころ・体験内容」「体験内容」が
 * すべて同義)は正規表現で吸収する。どのグループにも当たらない見出しは
 * OTHER_RANK に落として、元の displayOrder で並べる。
 */
const READING_ORDER: { rank: number; pattern: RegExp }[] = [
  /*
    「概要」を先頭に戻さないための行。

    isRedundantOverview() は実データで1件も検出しないので(同関数のコメント参照)、
    145件ある「概要」系セクションはすべて本文に残る。中身は summary の
    言い換えであることが多く、読者は同じ話を2回読むことになる。
    消すのは本文を減らすので表示側ではやらない。せめて読む順を下げ、
    見どころ・歴史の後ろへ送る。

    .find() の先頭一致なので、この行は「展示」等より前に置くこと——
    「ロンドン塔とは？」が /歴史/ に当たらないよう明示しておく。
  */
  { rank: 2.6, pattern: /^概要|とは[？?]\s*$|について\s*$/ },

  { rank: 0, pattern: /見どころ|体験内容|展示|見学|ハイライト|有名な/ },
  { rank: 1, pattern: /歴史|豆知識|由来|建築/ },
  { rank: 2, pattern: /ショップ|飲食|食事|カフェ|レストラン|お土産/ },

  /*
    ファクトバーに値が無くて本文に残った実用情報(大英博物館の「アクセス」など)。
    読み物としては最後でよいが、「服装・持ち物」より前に置く。
  */
  { rank: 3, pattern: /アクセス|行き方|最寄|所在地|^場所|料金|チケット|入場料|開館|営業|所要時間/ },

  { rank: 4, pattern: /服装|持ち物|注意|年齢制限|予約|よくある質問/ },
];

/** どのグループにも当たらない見出しの順位。実用情報の手前に置く。 */
const OTHER_RANK = 2.5;

function readingRank(title: string): number {
  const hit = READING_ORDER.find((r) => r.pattern.test(title));
  return hit ? hit.rank : OTHER_RANK;
}

/**
 * 目次リンクと <h2 id> に使うアンカー。
 *
 * 見出しは日本語なので slug 化してもURLに出せる文字にならない。
 * section.id (DB の連番) を使えば一意で、ページ内で安定する。
 */
export function sectionAnchor(section: SectionLike): string {
  return `sec-${section.id}`;
}

/**
 * visibleSections() の結果を読み物順に並べ替える。
 * 同順位のときは元の displayOrder を保つ(安定ソート)。
 */
export function orderForReading(sections: SectionLike[]): SectionLike[] {
  return [...sections].sort((a, b) => {
    const diff = readingRank(a.title) - readingRank(b.title);
    return diff !== 0 ? diff : a.displayOrder - b.displayOrder;
  });
}

/**
 * 冒頭の summary と中身が重なる「概要」セクションかどうか。
 *
 * ★ 現状、この関数は実データで1件も検出しない(0/145)。★
 *
 * 判定が「短いほうの先頭60%が相手に丸ごと含まれるか」という完全一致なのに対し、
 * 実際の summary と「概要」は原文のコピーではなく、同じ事実を別の言葉で
 * 書き直したものだから。例(ロンドン塔):
 *   summary: 「1078年に建てられた王室の要塞で、かつては牢獄や王室宝物庫として…」
 *   概要   : 「ロンドン塔は…ほぼ1,000年にわたる歴史を持つ要塞、王宮、そして
 *             悪名高い刑務所として知られています。」
 * 言っている中身は同じでも、文字列としては最後まで一致しない。
 *
 * 閾値を下げても解決しない。文字bigramのJaccard類似度で測ると最大でも0.34で、
 * 「言い換え重複」と「別の話題」を数値で切り分けられる境界が存在しない。
 *
 * 固有名詞と数値の共有率(概要側の7割以上が summary にもある)で判定する案も
 * 試したが、25件を伏せる一方でそのうち24件が summary に無い事実
 * (「入館無料（寄付歓迎）」「グレードII指定建造物」など)を含んでいた。
 * 重複を消すつもりで独自の情報まで落とすので採用しなかった。
 *
 * つまりこれは表示側の工夫で解ける問題ではなく、本文そのものを直す話になる。
 * 対応する場合は、各ページの「概要」を summary と重ならない内容へ
 * 書き直す(あるいは削除する)のが筋。それまでこの関数は事実上の no-op で、
 * 「概要」は READING_ORDER の rank 2.6 によって後方へ送られるだけになる。
 */
export function isRedundantOverview(
  section: SectionLike,
  summary: string | null,
): boolean {
  if (!summary) return false;
  // 「概要」「ロンドン塔とは？」「〜について」など、summary と同じ役割の見出し。
  // 「とは？」は語尾なので前方一致にしない(「ロンドン塔とは？」を拾うため)。
  if (!/^概要|とは[？?]\s*$|について\s*$/.test(section.title)) return false;

  const body = (section.description ?? "").replace(/\s|\*|#/g, "");
  const sum = summary.replace(/\s|\*|#/g, "");
  if (!body || !sum) return false;

  // 短いほうの6割が相手に含まれていれば重複とみなす。
  // 完全一致で判定すると、語尾だけ違う焼き直しを取りこぼす。
  const shorter = body.length < sum.length ? body : sum;
  const longer = body.length < sum.length ? sum : body;
  const probe = shorter.slice(0, Math.floor(shorter.length * 0.6));
  return probe.length > 20 && longer.includes(probe);
}
