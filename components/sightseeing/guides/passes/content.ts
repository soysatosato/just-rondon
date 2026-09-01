import {
  ADMISSIONS,
  ADMISSIONS_AS_OF,
  FREE_HIGHLIGHTS,
  SUGGESTED_DONATION,
  gbp,
} from "@/lib/sightseeing/budget";
import {
  BUS_CREDIT,
  EXPLORER_PASS,
  GREENWICH,
  LONDON_PASS,
  MERLIN_COMBOS,
  NOT_INCLUDED,
  PASS_AS_OF,
  PASS_SOURCES,
  PASS_UPDATED_AT,
  SUMMER_VAT_CUT,
  attractionsToBreakEven,
  breakEvenRows,
  breakEvenTotal,
} from "@/lib/sightseeing/passes";
import type { TravelGuideMetaSource } from "../guides";
import type { GuideFaqItem, GuideRelatedLink } from "@/components/guides/types";

/**
 * 観光パス。
 *
 * この記事は「ロンドンパスの説明」ではなく「買うべきか」の判定表。
 * 以前は観光スポットDB(Attraction)に4つのパスが1件ずつ入っていたが、
 * 商品ページが4枚に割れている限り、どのページも単体で「お得です」と
 * 書くしかなかった。実際、旧ページは要約が「コスパも良い」で本文冒頭が
 * 「まず元が取れません」という矛盾を抱えたまま公開されていた。
 *
 * 損得は比較でしか出ない。だから4つを1本にまとめ、判定を1か所に置く。
 * 旧URLはこのページへ301で寄せてある(next.config.mjs)。
 *
 * 金額はすべて lib/sightseeing/passes.ts と lib/sightseeing/budget.ts から
 * 引く。ここにべた書きしない。
 */

const one = LONDON_PASS[0];
const two = LONDON_PASS[1];
const three = LONDON_PASS[2];

/** 中心部の名所を3つ回ったときの合計。分岐点の手前で止まる代表例。 */
const bigThree = breakEvenRows()[2];

/* ------------------------------------------------------------------ */
/* メタ情報                                                            */
/* ------------------------------------------------------------------ */

export const passesMeta: TravelGuideMetaSource & {
  engTitle: string;
  summary: string;
  dataAsOf: string;
} = {
  slug: "passes",
  title: "ロンドンパスは元が取れるのか｜損益分岐点を入場料の実額で計算（2026年版）",
  engTitle: "London Sightseeing Passes",
  summary:
    `ロンドンの主要な博物館・美術館は元から入場無料です。そのうえで観光パスの元を取るには、有料施設だけを短期間に詰め込む必要があります。ロンドンパス・エクスプローラーパス・マーリン系コンボ・グリニッジのデイパスを、入場料の実額を積み上げて損益分岐点から判定しました。${PASS_AS_OF}時点の料金。`,
  description:
    `ロンドンパスは本当にお得か。大英博物館など主要館が無料であることを前提に、ロンドン塔${gbp(ADMISSIONS.towerOfLondon)}・ウェストミンスター寺院${gbp(ADMISSIONS.westminsterAbbey)}などの入場料を積み上げて損益分岐点を計算。1日券は有料施設${attractionsToBreakEven(one.adult)}か所目でようやく元が取れます。4種類のパスを誰に向くかで比較。`,
  keywords: [
    "ロンドンパス",
    "ロンドンパス 元が取れる",
    "ロンドンパス お得",
    "London Pass 比較",
    "ロンドン 観光パス",
    "ロンドン 入場料",
  ],
  dataAsOf: PASS_AS_OF,
  updatedAt: PASS_UPDATED_AT,
};

/* ------------------------------------------------------------------ */
/* 冒頭の判定                                                          */
/* ------------------------------------------------------------------ */

/**
 * 3つの条件。すべて満たさないと元は取れない。
 *
 * 「行く施設が多いほどお得」という売り文句を、満たすべき条件の形に
 * 言い換えたもの。読者は自分の旅程を3つと照合するだけで判定できる。
 */
export const conditions = [
  {
    id: "paid-only",
    label: "有料施設だけを回る",
    body: `ロンドンの一級の博物館・美術館は常設展が無料です。無料の館に行く時間は、パスの元を取る観点では丸ごと空振りになります。`,
  },
  {
    id: "density",
    label: `1日に有料施設を${attractionsToBreakEven(one.adult)}か所以上`,
    body: `1日券${gbp(one.adult)}に対し、中心部の名所を3つ回っても合計${gbp(bigThree.cumulative)}で届きません。${attractionsToBreakEven(one.adult)}か所目でようやく超えます。`,
  },
  {
    id: "consecutive",
    label: "それを連日つづける",
    body: `日数制のパスは初回利用日から連続で切れます。中日に無料の博物館や買い物を挟むと、その日のぶんは捨てることになります。`,
  },
] as const;

export const verdictHeadline =
  "「行きたい有料施設が1日3〜4か所あり、それを連日つづける」旅程でだけ得をします";

export const verdictBody =
  "この条件から外れる旅程——無料の博物館をゆっくり見る、街歩きと買い物に時間を使う、1日1か所を丁寧に見る——では、まず元が取れません。ロンドンは無料の館が強いぶん、観光パスが効きにくい街です。";

/** 買わないほうがいい人。条件の裏返しを具体的な旅程の形で出す。 */
export const skipIf = [
  "博物館・美術館めぐりが旅の中心",
  "3泊以下で、移動と食事にも時間を使いたい",
  "子連れで1日1〜2か所しか回らない",
  "有料の名所は2〜3か所だけと決めている",
] as const;

/* ------------------------------------------------------------------ */
/* 1. 無料の館                                                         */
/* ------------------------------------------------------------------ */

export const freeSection = {
  intro:
    "パスの損得を考える前に、ロンドンという街の前提を押さえる必要があります。ここが他の欧州の都市と決定的に違います。",
  free: [...FREE_HIGHLIGHTS],
  note: `いずれも常設展が無料です。入口に任意の寄付（${gbp(SUGGESTED_DONATION)}前後が推奨額として掲示される）の箱がありますが、義務ではありません。特別展だけは別料金です。`,
  effect: "この8館だけで、まる3日は埋まります。入場料£0で。",
  conclusion:
    "つまりロンドンでは、観光パスが効く相手が最初から限られています。パスの「100以上の施設に入れる」という宣伝は、その100のうち何割が自分の行きたい有料施設なのかを見ないと意味を持ちません。",
} as const;

/* ------------------------------------------------------------------ */
/* 2. 損益分岐                                                         */
/* ------------------------------------------------------------------ */

export const breakEven = {
  intro: `有料施設を回る順に入場料を積み上げると、パス代を超える地点が出ます。並び順は中心部から郊外へ、実際に回る順序に近づけました（安い順に並べると分岐点が不当に遠のき、高い順ならパスが不当に有利になります）。`,
  rows: breakEvenRows(),
  /** 表の下に置く判定。日数制の主要3種だけ出す。 */
  verdicts: [one, two, three].map((p) => ({
    days: p.days,
    price: p.adult,
    nth: attractionsToBreakEven(p.adult),
    total: breakEvenTotal(p.adult),
  })),
  priceNote: `入場料は大人・当日窓口の目安です（${ADMISSIONS_AS_OF}時点）。多くの施設はオンラインで事前に買うともう少し安く、その場合パスの分岐点はさらに遠のきます。`,
  killer: `注目してほしいのは3行目です。ロンドン塔・ウェストミンスター寺院・セント・ポール大聖堂——ロンドンの有料名所の代表格を1日で3つ回っても、合計は${gbp(bigThree.cumulative)}。1日券${gbp(one.adult)}に届きません。`,
  busCredit: `ただしパスには乗り降り自由バスとテムズ川クルーズが含まれます。もともと乗るつもりだったなら、その${gbp(BUS_CREDIT)}前後はパス側に足して考えてよい金額です。逆にいえば、バスに乗る予定がないなら、この宣伝上の「お得」は自分には発生しません。`,
} as const;

/* ------------------------------------------------------------------ */
/* 3. 対象外                                                           */
/* ------------------------------------------------------------------ */

export const notIncluded = {
  intro:
    "「100以上の施設」は数の話であって、行きたい施設が入っているかどうかとは別です。旅行者の行き先上位に入りながら、対象外のものがあります。",
  rows: [...NOT_INCLUDED],
  conclusion:
    "とくにチャーチル戦時執務室は、どのパスにも入っていません。ここを旅程の中心に据えている人は、パスの対象施設だけで分岐点まで積み上がるかを別に確かめる必要があります。",
} as const;

/* ------------------------------------------------------------------ */
/* 4. 4種類の比較                                                      */
/* ------------------------------------------------------------------ */

/**
 * 4つのパスを「誰に向くか」で並べる。価格順でも知名度順でもない。
 *
 * 旧サイトはこの4つを別々のスポットページとして持っていた。並べて
 * 初めて分かるのは、日数制が向く人はごく一部で、多くの旅行者には
 * 施設数制か、そもそもパス無しが正解だということ。
 */
export const passComparison = [
  {
    id: "london-pass",
    name: "ロンドンパス（Go City All-Inclusive）",
    axis: "日数制",
    priceLine: `${gbp(one.adult)}（1日）〜${gbp(LONDON_PASS[LONDON_PASS.length - 1].adult)}（10日）`,
    childLine: `子供（5〜15歳）${gbp(one.child)}〜${gbp(LONDON_PASS[LONDON_PASS.length - 1].child)}`,
    fitsWho:
      "有料の名所を1日3〜4か所、連日詰め込める人。体力と時間の両方が要ります",
    caution: `連続した日数で切れます。中日を休むと1日ぶん捨てることになります`,
    recommended: false,
  },
  {
    id: "explorer-pass",
    name: "エクスプローラー・パス（Go City）",
    axis: "施設数制",
    priceLine: `${gbp(EXPLORER_PASS[0].adult)}（2施設）〜${gbp(EXPLORER_PASS[EXPLORER_PASS.length - 1].adult)}（7施設）`,
    childLine: `子供 ${gbp(EXPLORER_PASS[0].child)}〜${gbp(EXPLORER_PASS[EXPLORER_PASS.length - 1].child)}`,
    fitsWho:
      "有料施設を数か所だけ、日をまたいで回りたい人。ロンドンの旅程にはこちらのほうが素直に当てはまります",
    caution:
      "施設ごとの定価より確実に安いとは限りません。行き先を決めてから単体価格と足し算で比べてください",
    recommended: true,
  },
  {
    id: "merlin",
    name: "マーリン系コンボ券",
    axis: "系列内の抱き合わせ",
    priceLine: MERLIN_COMBOS.map((c) => gbp(c.price)).join(" / "),
    childLine: "大人・子供の別は時間帯によって変動（公式が固定額を出していない）",
    fitsWho:
      "ロンドン・アイ、マダム・タッソー、シーライフ、ダンジョン、シュレック——この系列を子連れで2つ以上回るなら明確に得です",
    caution:
      "対象はすべて同じ運営会社の娯楽施設です。歴史的な名所は1つも入っていません",
    recommended: true,
  },
  {
    id: "greenwich",
    name: "ロイヤル・ミュージアムズ・グリニッジ デイパス",
    axis: "1地区の館だけ",
    priceLine: `大人 ${gbp(GREENWICH.dayPassAdult)} / 子供（4〜15歳）${gbp(GREENWICH.dayPassChild)}`,
    childLine: `単体は王立天文台 ${gbp(GREENWICH.observatory)}、カティサーク ${gbp(GREENWICH.cuttySark)}`,
    fitsWho: `グリニッジで有料の2館を両方見る人。単体で買うと ${gbp(GREENWICH.observatory + GREENWICH.cuttySark)} なので、${gbp(GREENWICH.observatory + GREENWICH.cuttySark - GREENWICH.dayPassAdult)} 安くなります`,
    caution: `同じ敷地の${GREENWICH.freeSites.join("と")}は元から無料です。デイパスの対象に入っていないのはそのためで、損ではありません`,
    recommended: true,
  },
] as const;

/**
 * ゴールデンパス。価格を出さない理由をそのまま書く。
 *
 * 旧スポットページは「£69〜」と書いていたが、公式サイトは閲覧者の
 * 通貨で変動する額しか出しておらず、GBPの定価を確認できなかった。
 * 確認できない数字を載せるくらいなら、載せられない事実のほうを書く。
 */
export const goldenPassNote = {
  name: "ゴールデンパス（Golden Tours）",
  body: "乗り降り自由バス24時間券に、12施設から1〜3か所を選んで組み合わせる商品です。有効期限30日と長く、ウォーキングツアーも付きます。ただし公式サイトが閲覧者の通貨で変動する価格しか表示せず、GBPの定価を確認できませんでした。価格を固定額で示せない商品は、事前に損得を計算できません。買う前に必ず決済画面でポンド建ての総額を確かめてください。",
} as const;

/* ------------------------------------------------------------------ */
/* 5. 数字の読み方                                                     */
/* ------------------------------------------------------------------ */

export const traps = [
  {
    id: "list-price",
    title: "「£300ぶんが£99」の£300は当日窓口の定価",
    body: "パスが宣伝する節約額は、対象施設をすべて当日窓口の定価で買った場合との差です。実際には多くの施設がオンライン事前購入で安くなり、時間帯によってはさらに下がります。比べるなら、自分が実際に払う額どうしで比べてください。",
  },
  {
    id: "vat",
    title: `${SUMMER_VAT_CUT.to}まで、入場料が一時的に安かった`,
    body: `英政府の ${SUMMER_VAT_CUT.name} により、${SUMMER_VAT_CUT.from}から${SUMMER_VAT_CUT.to}まで施設入場料のVATが${SUMMER_VAT_CUT.normalRate}%から${SUMMER_VAT_CUT.reducedRate}%に下がっていました。夏に調べた価格が今より2〜3割安いのはこのためです。このページの数字は税率が戻ったあとの標準料金で計算しています。`,
  },
  {
    id: "slots",
    title: "パスがあっても入場枠は別に要る",
    body: "人気施設は時間指定の予約枠が必要です。パスは入場料を先払いしただけで、枠を確保するものではありません。到着してからアプリで押さえようとすると、その日は満席ということが起こります。",
  },
  {
    id: "count",
    title: "対象施設の数は、行きたい施設の数ではない",
    body: "対象100件のうち大半は、ウォーキングツアー、郊外の小規模な館、体験型の商品です。数を魅力として受け取る前に、自分の旅程に実際に載る施設が何件あるかを数えてください。多くの人は3〜5件です。",
  },
] as const;

/* ------------------------------------------------------------------ */
/* セクション一覧                                                      */
/* ------------------------------------------------------------------ */

export const passesSections = [
  { id: "free", label: "前提 — ロンドンは主要館が無料", navLabel: "無料の館" },
  { id: "break-even", label: "損益分岐 — 何か所で元が取れるか", navLabel: "分岐点" },
  { id: "not-included", label: "「100以上」の穴 — 対象外の名所", navLabel: "対象外" },
  { id: "compare", label: "4種類のパスを誰に向くかで比べる", navLabel: "比較" },
  { id: "traps", label: "数字の読み方", navLabel: "読み方" },
] as const;

/* ------------------------------------------------------------------ */
/* FAQ・出典・関連                                                     */
/* ------------------------------------------------------------------ */

export const passesFaq: GuideFaqItem[] = [
  {
    question: "ロンドンパスは結局お得ですか？",
    answer: `**多くの旅行者にとっては元が取れません**。ロンドンの主要な博物館・美術館が元から無料だからです。1日券${gbp(one.adult)}の元を取るには有料施設を${attractionsToBreakEven(one.adult)}か所回る必要があり、ロンドン塔・ウェストミンスター寺院・セント・ポール大聖堂の3つを回っても合計${gbp(bigThree.cumulative)}にしかなりません。**有料の名所を1日3〜4か所、連日詰め込む旅程**でだけ得をします。`,
  },
  {
    question: "大英博物館やナショナル・ギャラリーにパスは要りますか？",
    answer: `**要りません**。常設展はどちらも入場無料です。${FREE_HIGHLIGHTS.slice(0, 6).join("、")}なども同じで、パスの有無に関係なく無料で入れます。入口の寄付箱は任意で、義務ではありません。ただし**特別展だけは別料金**です。`,
  },
  {
    question: "何日券を買えばいいですか？",
    answer: `日数で選ぶ前に、**行きたい有料施設を書き出して数えてください**。3〜5か所なら日数制ではなく**施設数制のエクスプローラー・パス**（${gbp(EXPLORER_PASS[0].adult)}〜）のほうが合います。日数制は連続した日数で切れるので、中日に無料の博物館や買い物を挟むとその日のぶんが無駄になります。`,
  },
  {
    question: "チャーチル戦時執務室はパスで入れますか？",
    answer: `**入れません**。ロンドンパスにもエクスプローラー・パスにも入っていないため、別途 ${gbp(ADMISSIONS.churchillWarRooms)} 前後のチケットが必要です。バッキンガム宮殿のステートルームとワーナー・ブラザース スタジオツアー（ハリー・ポッター）も同様に対象外です。`,
  },
  {
    question: "夏に調べた入場料と値段が違うのはなぜですか？",
    answer: `${SUMMER_VAT_CUT.from}から${SUMMER_VAT_CUT.to}まで、英政府の ${SUMMER_VAT_CUT.name} で施設入場料のVATが${SUMMER_VAT_CUT.normalRate}%から${SUMMER_VAT_CUT.reducedRate}%に下がっていたためです。**${SUMMER_VAT_CUT.to}で終了**し、税率は元に戻りました。このページの数字は戻ったあとの標準料金です。`,
  },
  {
    question: "グリニッジのデイパスは買う価値がありますか？",
    answer: `**王立天文台とカティサークの両方に行くなら、はっきり得です**。単体だと ${gbp(GREENWICH.observatory)} と ${gbp(GREENWICH.cuttySark)} で合計 ${gbp(GREENWICH.observatory + GREENWICH.cuttySark)}、デイパスなら ${gbp(GREENWICH.dayPassAdult)} なので ${gbp(GREENWICH.observatory + GREENWICH.cuttySark - GREENWICH.dayPassAdult)} 安くなります。片方だけなら単体で買ってください。同じ敷地の${GREENWICH.freeSites.join("と")}は元から無料です。`,
  },
];

export const passesSources = [...PASS_SOURCES];

export const passesRelatedLinks: GuideRelatedLink[] = [
  { href: "/sightseeing/budget", label: "ロンドン旅行の予算｜7日間の費用を積算" },
  { href: "/sightseeing/free", label: "ロンドンの無料スポット" },
  { href: "/sightseeing/must-see", label: "ロンドンで外せない名所" },
  { href: "/sightseeing/itinerary", label: "ロンドン モデルコース（1〜5日）" },
  { href: "/sightseeing/transport", label: "ロンドンの交通ガイド｜運賃と上限額の仕組み" },
  { href: "/plan", label: "行きたいスポットから旅程を組む" },
];
