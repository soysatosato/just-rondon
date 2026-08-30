import {
  ADMISSIONS,
  BUDGET_AS_OF,
  BUDGET_SOURCES,
  BUDGET_UPDATED_AT,
  DAILY_TOTALS,
  EXTRAS,
  FOOD_PER_DAY,
  FREE_HIGHLIGHTS,
  LODGING,
  SUGGESTED_DONATION,
  TRIP_NIGHTS,
  gbp,
  gbpRange,
  lodgingTotal,
  perDay,
} from "@/lib/sightseeing/budget";
import { AIRPORTS, CAPS } from "@/lib/transport/rates";
import { MEAL_DEALS } from "@/lib/food/prices";
import type { TravelGuideMetaSource } from "../guides";
import type { GuideFaqItem, GuideRelatedLink } from "@/components/guides/types";

/**
 * 旅行予算。
 *
 * この記事は読み物ではなく計算表。以前は TravelGuideLayout に流していて、
 * 本文に GFM テーブルが9枚並んでいた。MarkdownBody は表に
 * min-w-[32rem] を掛けるので、スマホでは9回とも横スクロールになる。
 * 数字を読ませる記事としては最悪の形だった。
 *
 * さらに構造が主張と矛盾していた。この記事の主張は
 * 「宿が総額の6割を決める」「削って効く順番は 宿→食→入場料」
 * 「交通費は上限額があるので天井が決まっている」——つまり
 * 項目ごとに重みがまるで違うという話なのに、4項目が同じ大きさの
 * 同じ表で並んでいた。割合を目に見える形にする。
 *
 * 予算帯も3つ(節約/標準/ゆとり)あるが、読者が属するのは1つだけ。
 * 積算モデルは3枚の表を並べず、選んだ帯のものを1つ出す。
 *
 * 金額はすべて lib/sightseeing/budget.ts から引く。ここにべた書きしない。
 * 交通費は lib/transport/rates.ts、食費の単価は lib/food/prices.ts が持つ。
 *
 * 為替レートは書かない(travel-tips と同じ理由)。
 * 航空券は積算に含めない。出発地・時期・航空会社で10万円単位で動き、
 * 幅を書いても予算の役に立たないため。「現地費用」に絞ることで
 * この記事の数字は最後まで信用できる。
 */

export { TRIP_NIGHTS, gbp };

/* ------------------------------------------------------------------ */
/* メタ情報                                                            */
/* ------------------------------------------------------------------ */

export const budgetMeta: TravelGuideMetaSource & {
  engTitle: string;
  summary: string;
  dataAsOf: string;
} = {
  slug: "budget",
  title: "ロンドン旅行の予算｜7日間の費用を宿・食・交通・入場で積算（2026年版）",
  engTitle: "London Travel Budget",
  summary:
    "「ロンドンは高い」で終わらせず、7泊ぶんの現地費用を宿・食・交通・入場料に分けて積算しました。節約・標準・ゆとりの3つの予算帯で1日あたりの金額を出し、どこを削ると効くのかまで踏み込みます。航空券を除いた「着いてから使う金額」の話です。",
  description:
    "ロンドン7日間の旅行予算を宿泊・食費・交通費・入場料に分けて積算。節約・標準・ゆとりの3パターンで内訳と合計を示し、無料の博物館や交通費の上限額など、実際に効く節約ポイントを解説します。2026年8月時点の料金。",
  keywords: [
    "ロンドン 旅行 予算",
    "ロンドン 7日間 費用",
    "ロンドン 物価",
    "イギリス 旅行 費用",
    "ロンドン 節約",
    "ロンドン 入場料",
  ],
  dataAsOf: BUDGET_AS_OF,
  updatedAt: BUDGET_UPDATED_AT,
};

/* ------------------------------------------------------------------ */
/* 予算帯                                                              */
/* ------------------------------------------------------------------ */

export type TierId = "thrifty" | "standard" | "comfortable";

export type Tier = {
  id: TierId;
  label: string;
  perDay: string;
  total: string;
  blurb: string;
  /** 積算モデルの内訳。合計は DAILY_TOTALS の tripTotal と一致させること。 */
  rows: { item: string; amount: string }[];
  closing: string;
};

/**
 * 3帯ぶんの積算。
 * 内訳を変えたら lib/sightseeing/budget.ts の DAILY_TOTALS も引き直すこと。
 * 自動計算にしないのは、宿が1室あたり・食費が1名あたりで割り勘の前提が
 * 違い、機械的に足すと嘘になるため(lib 側のコメントを参照)。
 */
export const tiers: Tier[] = [
  {
    id: "thrifty",
    label: DAILY_TOTALS.thrifty.label,
    perDay: gbp(perDay(DAILY_TOTALS.thrifty.tripTotal)),
    total: gbp(DAILY_TOTALS.thrifty.tripTotal),
    blurb: "無料の博物館だけで組む",
    rows: [
      { item: "宿（ホステルのドミトリー）", amount: `${gbp(LODGING.hostelDorm.min * TRIP_NIGHTS)}〜` },
      { item: "食費（Meal Deal 中心）", amount: gbp(FOOD_PER_DAY.thrifty.perDay * TRIP_NIGHTS) },
      {
        item: "交通（週上限＋空港往復）",
        amount: gbp(CAPS.zone1to2.weekly + AIRPORTS.heathrow.piccadillyFromZone1 * 2),
      },
      { item: "入場料（無料施設のみ）", amount: gbp(0) },
    ],
    closing: "無料の博物館だけで組んでも、ロンドンは十分に楽しめます。",
  },
  {
    id: "standard",
    label: DAILY_TOTALS.standard.label,
    perDay: gbp(perDay(DAILY_TOTALS.standard.tripTotal)),
    total: gbp(DAILY_TOTALS.standard.tripTotal),
    blurb: "多くの旅行者が着地する帯",
    rows: [
      {
        item: "宿（格安チェーン・2人で1室を割り勘）",
        amount: `${gbp((LODGING.budgetHotel.min * TRIP_NIGHTS) / 2)}〜`,
      },
      { item: "食費（昼は軽く、夜はパブ）", amount: gbp(FOOD_PER_DAY.standard.perDay * TRIP_NIGHTS) },
      {
        item: "交通（週上限＋空港往復）",
        amount: gbp(CAPS.zone1to2.weekly + AIRPORTS.heathrow.piccadillyFromZone1 * 2),
      },
      { item: "入場料（有料3施設）", amount: `約 ${gbp(90)}` },
      { item: "ミュージカル1本", amount: gbp(EXTRAS.musicalMid) },
    ],
    closing: "多くの旅行者が現実的に着地するのはこの帯です。",
  },
  {
    id: "comfortable",
    label: DAILY_TOTALS.comfortable.label,
    perDay: gbp(perDay(DAILY_TOTALS.comfortable.tripTotal)),
    total: gbp(DAILY_TOTALS.comfortable.tripTotal),
    blurb: "1日1回はレストラン",
    rows: [
      {
        item: "宿（中級ホテル・2人で1室を割り勘）",
        amount: `${gbp((LODGING.midRange.min * TRIP_NIGHTS) / 2)}〜`,
      },
      {
        item: "食費（1日1回はレストラン）",
        amount: gbp(FOOD_PER_DAY.comfortable.perDay * TRIP_NIGHTS),
      },
      {
        item: "交通（週上限＋空港はエリザベス・ライン往復）",
        amount: gbp(CAPS.zone1to2.weekly + AIRPORTS.heathrow.elizabethFromZone1 * 2),
      },
      { item: "入場料（有料5施設＋日帰り遠出）", amount: `約 ${gbp(200)}` },
      {
        item: "ミュージカル良席＋アフタヌーンティー",
        amount: `約 ${gbp(EXTRAS.musicalPremium + EXTRAS.afternoonTeaFrom)}`,
      },
    ],
    closing:
      "どのモデルでも交通費だけはほぼ同額です。上限額があるので、そういう構造になっています。",
  },
];

export const tierCaveat = `上の3つは、各項目の下限を積んだ最低ラインです。宿を範囲の上限で取れば節約モデルでも£500近くになりますし、繁忙期はさらに動きます。予備費として1〜3割を上乗せして考えてください。`;

export const excluded = [
  {
    what: "航空券",
    why: "出発地・時期・航空会社で10万円単位で動くため、幅を書いても予算の役に立ちません。ここは「着いてから使う金額」に絞ります。",
  },
  {
    what: "為替レート",
    why: "書いた瞬間に古くなり、読者が誤った予算を立てる原因になります。渡航直前にご自身で確認してください。",
  },
];

/* ------------------------------------------------------------------ */
/* 予算の構造                                                          */
/* ------------------------------------------------------------------ */

export type CostShare = {
  id: string;
  label: string;
  /** 総額に占める割合の下限・上限(%)。棒の幅にも使う。 */
  min: number;
  max: number;
  flex: "非常に大きい" | "大きい" | "小さい";
  note: string;
  href: string;
};

/**
 * 「宿が6割を決める」を主張ではなく形にする。
 * 割合の幅をそのまま棒の長さにして、4項目の重みの差を目で見せる。
 */
export const costShares: CostShare[] = [
  {
    id: "lodging",
    label: "宿泊",
    min: 40,
    max: 60,
    flex: "非常に大きい",
    note: "ここが予算を決める",
    href: "#lodging",
  },
  {
    id: "food",
    label: "食費",
    min: 20,
    max: 30,
    flex: "大きい",
    note: "工夫が直接効く",
    href: "#food",
  },
  {
    id: "admissions",
    label: "入場料",
    min: 5,
    max: 20,
    flex: "大きい",
    note: "無料施設だけでも成立する",
    href: "#admissions",
  },
  {
    id: "transport",
    label: "交通費",
    min: 8,
    max: 12,
    flex: "小さい",
    note: "上限額があるため天井が決まっている",
    href: "#transport",
  },
];

export const structureConclusion = {
  order: ["宿", "食", "入場料"],
  body: "交通費を削っても総額はほとんど変わりません。上限額の仕組みで最初から天井が決まっているからです。逆に言えば、交通費は最初に確定できるということでもあります。いちばん読みにくい宿から決めて、交通費は固定費として置いてしまうのが早い。",
  notes: [
    "1人旅とふたり旅では1人あたりの宿泊費が倍近く違う。宿は「1室あたり」で価格が付くため、割り勘が効く",
    "滞在を1泊延ばすより、1泊減らして宿のグレードを上げたほうが満足度が高いことが多い",
  ],
};

/* ------------------------------------------------------------------ */
/* 宿泊費                                                              */
/* ------------------------------------------------------------------ */

export const lodging = {
  intro: "ロンドンの宿は季節と曜日で倍近く動きます。下は通年の目安です。",
  rows: [
    {
      label: LODGING.hostelDorm.label,
      perNight: gbpRange(LODGING.hostelDorm),
      total: lodgingTotal(LODGING.hostelDorm),
      note: LODGING.hostelDorm.note,
    },
    {
      label: LODGING.budgetHotel.label,
      perNight: gbpRange(LODGING.budgetHotel),
      total: lodgingTotal(LODGING.budgetHotel),
      note: LODGING.budgetHotel.note,
    },
    {
      label: LODGING.apartment.label,
      perNight: gbpRange(LODGING.apartment),
      total: lodgingTotal(LODGING.apartment),
      note: LODGING.apartment.note,
    },
    {
      label: LODGING.midRange.label,
      perNight: gbpRange(LODGING.midRange),
      total: lodgingTotal(LODGING.midRange),
      note: LODGING.midRange.note,
    },
  ],
  perRoom:
    "ホステル以外は「1室あたり」の価格です。ふたりで泊まれば1人あたりは半分になります。1人旅とふたり旅で総額の印象が大きく変わるのはここが理由です。",
  seasons: {
    high: ["6〜8月：観光のピーク。最も高い", "12月中旬〜クリスマス：マーケットとイルミネーション", "大型イベントの開催週：ウィンブルドン、大きな展示会など"],
    low: ["1〜2月：最安。ただし日照が短く寒い", "11月（クリスマス前）：比較的落ち着く"],
  },
  zone: {
    title: "立地をどう考えるか",
    body: "ゾーン1の中心部にこだわると跳ね上がります。ただしゾーン2〜3に出しても交通費は上限額で頭打ちになるため、宿代の下がり幅のほうがたいてい大きい。地下鉄の駅から徒歩5分以内なら、ゾーン2は十分に現実的な選択です。",
  },
  link: {
    href: "/sightseeing/hotels",
    label: "宿泊エリア別ホテル選び",
    blurb: "どのエリアに泊まると何が近いのか、日本人が驚くポイントは何か",
  },
  notes: [
    "英国のホテルは部屋が狭い。日本のビジネスホテルより狭いことも珍しくない",
    "古い建物の宿はエレベーターが無いことがある。大きなスーツケースなら事前に確認する",
    "朝食込みかどうかで実質的な価格が変わる。1人£15前後の差になる",
  ],
};

/* ------------------------------------------------------------------ */
/* 食費                                                                */
/* ------------------------------------------------------------------ */

export const food = {
  intro: "工夫がそのまま金額に出る項目です。",
  bands: [
    {
      label: FOOD_PER_DAY.thrifty.label,
      perDay: gbp(FOOD_PER_DAY.thrifty.perDay),
      total: gbp(FOOD_PER_DAY.thrifty.perDay * TRIP_NIGHTS),
      note: FOOD_PER_DAY.thrifty.note,
    },
    {
      label: FOOD_PER_DAY.standard.label,
      perDay: gbp(FOOD_PER_DAY.standard.perDay),
      total: gbp(FOOD_PER_DAY.standard.perDay * TRIP_NIGHTS),
      note: FOOD_PER_DAY.standard.note,
    },
    {
      label: FOOD_PER_DAY.comfortable.label,
      perDay: gbp(FOOD_PER_DAY.comfortable.perDay),
      total: gbp(FOOD_PER_DAY.comfortable.perDay * TRIP_NIGHTS),
      note: FOOD_PER_DAY.comfortable.note,
    },
  ],
  mealDeal: {
    title: "Meal Deal が昼食の基準線",
    body: "スーパーやドラッグストアのメイン＋スナック＋ドリンクのセットです。",
    rows: [
      { shop: MEAL_DEALS.tesco.label, standard: gbp(MEAL_DEALS.tesco.standard), member: gbp(MEAL_DEALS.tesco.member) },
      { shop: MEAL_DEALS.sainsburys.label, standard: gbp(MEAL_DEALS.sainsburys.standard), member: gbp(MEAL_DEALS.sainsburys.member) },
      { shop: MEAL_DEALS.boots.label, standard: gbp(MEAL_DEALS.boots.standard), member: gbp(MEAL_DEALS.boots.member) },
      { shop: MEAL_DEALS.coop.label, standard: gbp(MEAL_DEALS.coop.standard), member: gbp(MEAL_DEALS.coop.member) },
    ],
    effect: `昼を Meal Deal にするだけで1日£10前後、${TRIP_NIGHTS}日で£70が浮きます。入場料2つぶんです。`,
  },
  eatingOut: [
    { what: "パブのビール1パイント（ゾーン1）", price: `${gbp(EXTRAS.pintZone1)}前後` },
    { what: "カフェのコーヒー", price: `${gbp(EXTRAS.coffee)}前後` },
    { what: "パブの食事（メイン1皿）", price: "£16〜22" },
    { what: "きちんとしたレストランのディナー", price: "1人£45〜" },
  ],
  water: {
    title: "水を買わない",
    body: `ロンドンの水道水は飲めます。マイボトルを持って行けば、それだけで1日£2〜3、${TRIP_NIGHTS}日で£15〜20が浮きます。`,
  },
  link: {
    href: "/food",
    label: "ロンドンの食費節約",
    blurb: "閉店前の値引き、余剰food アプリ、学割など",
  },
  notes: [
    "着席型のレストランでは伝票に service charge が12.5%前後加算されている。予算に乗せておく",
    "パブはカウンターで注文して先払い。席で待っていても誰も来ない",
    "宿にキッチンがあるなら、朝食だけ自炊するだけで1日£8前後が浮く",
  ],
};

/* ------------------------------------------------------------------ */
/* 交通費                                                              */
/* ------------------------------------------------------------------ */

export const transport = {
  headline: "予算のうち唯一「最悪でもこれ以上かからない」と言い切れる項目",
  intro:
    "タッチ決済には1日・1週間の上限額（capping）があり、それを超えて課金されません。",
  caps: [
    { zone: "Zone 1〜2", daily: gbp(CAPS.zone1to2.daily), weekly: gbp(CAPS.zone1to2.weekly), main: true },
    { zone: "Zone 1〜3", daily: gbp(CAPS.zone1to3.daily), weekly: gbp(CAPS.zone1to3.weekly), main: false },
    { zone: "Zone 1〜6", daily: gbp(CAPS.zone1to6.daily), weekly: gbp(CAPS.zone1to6.weekly), main: false },
  ],
  capConclusion: `観光の大半は Zone 1〜2 に収まります。つまり、どれだけ乗っても週${gbp(CAPS.zone1to2.weekly)}。これが交通費の天井です。`,
  noTickets: {
    title: "切符は買わない",
    body: "Oyster カードも1日券も、旅行者にはほぼ不要です。手持ちの Visa / Mastercard のタッチ決済でそのまま改札を通れます。上限額も自動で効きます。",
    warning: "ただし JCB は使えません。Visa か Mastercard を必ず用意してください。",
  },
  airport: {
    title: "空港からの移動",
    body: "ここは上限額と別枠で見ておく必要があります。",
    rows: [
      { how: "ピカデリー線（ヒースロー↔Zone 1）", price: gbp(AIRPORTS.heathrow.piccadillyFromZone1), cheap: true },
      { how: "エリザベス・ライン（同）", price: gbp(AIRPORTS.heathrow.elizabethFromZone1), cheap: false },
      { how: "ヒースロー・エクスプレス（当日券）", price: gbp(AIRPORTS.heathrow.expressOnDay), cheap: false },
      { how: "ヒースロー・エクスプレス（30日以上前の予約）", price: `${gbp(AIRPORTS.heathrow.expressAdvanceFrom)}〜`, cheap: false },
    ],
    conclusion:
      "急がないならピカデリー線が圧倒的に安い。所要50分ほどかかりますが、往復で£40近い差になります。",
  },
  total: {
    label: `${TRIP_NIGHTS}日間の交通費の目安`,
    value: gbp(CAPS.zone1to2.weekly + AIRPORTS.heathrow.piccadillyFromZone1 * 2),
    body: `Zone 1〜2 の週上限 ${gbp(CAPS.zone1to2.weekly)} ＋ 空港往復（ピカデリー線で ${gbp(AIRPORTS.heathrow.piccadillyFromZone1 * 2)}）。総額に占める割合は1割前後です。ここを削る努力は費用対効果が悪い。`,
  },
  link: {
    href: "/sightseeing/transport",
    label: "ロンドンの交通ガイド",
    blurb: "ゾーンの数え方、ピーク・オフピーク、バスのホッパー運賃など9本",
  },
};

/* ------------------------------------------------------------------ */
/* 入場料                                                              */
/* ------------------------------------------------------------------ */

export const admissions = {
  headline: "ロンドン最大の武器は、一級の博物館・美術館が軒並み無料なこと",
  free: [...FREE_HIGHLIGHTS],
  freeNote: `いずれも常設展が無料です。入口に任意の寄付（${gbp(SUGGESTED_DONATION)}前後が推奨額として掲示される）の箱がありますが、義務ではありません。特別展は別料金です。`,
  freeEffect: "この8施設だけで、まる3日は埋まります。入場料£0で。",
  paid: [
    { name: "ロンドン塔", price: gbp(ADMISSIONS.towerOfLondon) },
    { name: "ウェストミンスター寺院", price: gbp(ADMISSIONS.westminsterAbbey) },
    { name: "セント・ポール大聖堂", price: gbp(ADMISSIONS.stPaulsCathedral) },
    { name: "チャーチル戦時執務室", price: gbp(ADMISSIONS.churchillWarRooms) },
    { name: "ウィンザー城", price: gbp(ADMISSIONS.windsorCastle) },
    { name: "ザ・シャード（展望台）", price: gbp(ADMISSIONS.shardView) },
    { name: "ロンドン・アイ", price: gbp(ADMISSIONS.londonEye) },
    { name: "キュー・ガーデン", price: gbp(ADMISSIONS.kewGardens) },
    { name: "ワーナー・ブラザース スタジオツアー", price: gbp(ADMISSIONS.harryPotterStudio) },
  ],
  paidNote:
    "多くの施設はオンラインの事前購入が当日窓口より安く、しかも列に並ばずに済みます。行くと決めているなら、必ず先に買ってください。",
  planning: `有料施設を${TRIP_NIGHTS}日で3つに絞れば、入場料は約£90。5つなら約£155。無料施設と組み合わせれば、ここは自分でコントロールできる項目です。`,
  notes: [
    "ロンドン塔とウェストミンスター寺院は所要2〜3時間。1日に2つ以上の有料施設を詰めると駆け足になる",
    "展望台は無料の選択肢がある。Sky Garden は事前予約制で無料、テート・モダンの最上階も無料",
    "学生証（国際学生証を含む）で割引になる施設が多い。持っているなら必ず提示する",
  ],
};

/* ------------------------------------------------------------------ */
/* そのほかの出費                                                      */
/* ------------------------------------------------------------------ */

export const extras = {
  intro: "積算から漏れやすい項目です。",
  rows: [
    { what: "ミュージカル（安い席）", price: `${gbp(EXTRAS.musicalCheap)}〜` },
    { what: "ミュージカル（中位の席）", price: `${gbp(EXTRAS.musicalMid)}前後` },
    { what: "ミュージカル（良席）", price: `${gbp(EXTRAS.musicalPremium)}〜` },
    { what: "アフタヌーンティー", price: `${gbp(EXTRAS.afternoonTeaFrom)}〜` },
    { what: "土産（1週間ぶんの総額）", price: `${gbp(EXTRAS.souvenirsTypical)}前後` },
    { what: "海外旅行保険", price: EXTRAS.insuranceNote },
  ],
  forgotten: [
    { what: "公衆トイレ", detail: "20〜50p のことがある（博物館・デパート・パブは無料）" },
    { what: "レジ袋", detail: "有料。エコバッグを持って行く" },
    { what: "チップ", detail: "着席型レストランの service charge 12.5%前後は伝票に自動加算" },
    { what: "データ通信", detail: "eSIM で1週間£10前後" },
  ],
  noVat: {
    title: "免税は無い",
    body: "英国の旅行者向け VAT 還付制度は2021年1月に廃止されました。買い物をしても税金は戻ってきません。古いガイドブックには還付手続きの説明が残っていることがありますが、予算に「還付ぶん」を見込まないでください。",
  },
  insuranceCallout: {
    tone: "warn" as const,
    title: "海外旅行保険は予算に必ず入れる",
    body: "NHS は旅行者に無料ではありません。無保険で大きなけがや病気をすると、自己負担が数十万円〜数百万円規模になり得ます。削ってよい項目ではありません。",
  },
};

/* ------------------------------------------------------------------ */
/* 削るならここ                                                        */
/* ------------------------------------------------------------------ */

/** 効いた金額を見せる。順位だけ書いても、どれだけ効くかが伝わらない。 */
export const cuts = [
  {
    what: "宿をゾーン2に出す",
    saves: "£200以上",
    why: `1泊£30前後下がることがあり、${TRIP_NIGHTS}泊で£200以上。交通費は上限額で頭打ちなので、下がった宿代がそのまま残る`,
  },
  { what: "昼を Meal Deal にする", saves: "£70", why: `1日£10前後、${TRIP_NIGHTS}日で£70` },
  { what: "有料施設を絞る", saves: "£65〜", why: "無料の8施設で3日は埋まる。有料は「本当に見たい3つ」に" },
  { what: "空港はピカデリー線", saves: "£40前後", why: "ヒースロー・エクスプレスとの往復差" },
  { what: "マイボトルを持つ", saves: "£15〜20", why: `水道水が飲めるので、${TRIP_NIGHTS}日で` },
  { what: "ミュージカルは当日券・立ち見・平日マチネ", saves: "良席の半額以下", why: "席種で大きく動く" },
];

export const doNotCut = [
  { what: "海外旅行保険", why: "削ってはいけません" },
  { what: "歩きやすい靴", why: "1日1万歩以上歩きます。ここをケチると旅程が壊れます" },
  { what: "通信手段", why: "地図と乗換案内が使えないと、結果的にタクシー代がかさむ" },
];

export const budgetNotes = [
  "予備費として総額の10〜15%を上乗せしておく。天候で予定を変える、体調を崩す、良い土産を見つける",
  "現金は£20〜50で足りる。残りはすべてカードで払える",
  "決済端末で「円建てで払うか」と聞かれたら必ず断る。ポンド建てのほうが有利",
];

/* ------------------------------------------------------------------ */
/* セクション一覧                                                      */
/* ------------------------------------------------------------------ */

export const budgetSections = [
  { id: "structure", label: "予算の構造 — 宿が6割を決める", navLabel: "構造" },
  { id: "lodging", label: "宿泊費", navLabel: "宿" },
  { id: "food", label: "食費", navLabel: "食" },
  { id: "transport", label: "交通費", navLabel: "交通" },
  { id: "admissions", label: "入場料", navLabel: "入場料" },
  { id: "extras", label: "そのほかの出費", navLabel: "その他" },
  { id: "models", label: `${TRIP_NIGHTS}日間の積算モデル`, navLabel: "積算" },
  { id: "cutting", label: "削るならここ", navLabel: "削る" },
] as const;

/* ------------------------------------------------------------------ */
/* FAQ・出典・関連                                                     */
/* ------------------------------------------------------------------ */

export const budgetFaq: GuideFaqItem[] = [
  {
    question: "ロンドン7日間の旅行費用は、結局いくらですか？",
    answer: `**航空券を除いた現地費用で、1人あたり約${gbp(DAILY_TOTALS.thrifty.tripTotal)}〜${gbp(DAILY_TOTALS.comfortable.tripTotal)}**です。1日あたりに直すと、節約で約${gbp(perDay(DAILY_TOTALS.thrifty.tripTotal))}、標準的な旅行で約${gbp(perDay(DAILY_TOTALS.standard.tripTotal))}、ゆとりを持って約${gbp(perDay(DAILY_TOTALS.comfortable.tripTotal))}が目安になります。ただしこれは各項目の下限を積んだ最低ラインなので、**予備費として1〜3割を上乗せ**してください。差を生むのは主に宿泊費です。`,
  },
  {
    question: "交通費は1週間でいくらかかりますか？",
    answer: `**Zone 1〜2 なら週${gbp(CAPS.zone1to2.weekly)}が上限**です。タッチ決済には1日・1週間の上限額があり、それ以上は課金されません。空港往復（ピカデリー線で${gbp(AIRPORTS.heathrow.piccadillyFromZone1 * 2)}）を足しても、${TRIP_NIGHTS}日で約${gbp(CAPS.zone1to2.weekly + AIRPORTS.heathrow.piccadillyFromZone1 * 2)}です。`,
  },
  {
    question: "入場料を抑えるにはどうすればいいですか？",
    answer: `**大英博物館、ナショナル・ギャラリー、テート・モダン、自然史博物館、V&A など主要な博物館・美術館は常設展が無料**です。これだけで3日は埋まります。有料施設を「本当に見たい3つ」に絞れば、入場料は${TRIP_NIGHTS}日で£90前後に収まります。`,
  },
  {
    question: "1人旅とふたり旅で、1人あたりの費用は変わりますか？",
    answer:
      "**大きく変わります**。ホテルは「1室あたり」で価格が付くため、ふたりで泊まれば1人あたりの宿泊費はほぼ半分になります。宿泊費は総額の4〜6割を占めるので、1人あたりの総額で2〜3割の差が出ます。",
  },
  {
    question: "現金はいくら必要ですか？",
    answer:
      "**£20〜50で十分**です。ロンドンはほぼ完全にキャッシュレスで、カフェ・パブ・スーパー・地下鉄・タクシーまでカードで完結します。ただし**JCB はほぼ使えない**ため、Visa か Mastercard を用意してください。",
  },
  {
    question: "免税手続きで安くなりますか？",
    answer:
      "**なりません**。英国の旅行者向け VAT 還付制度は2021年1月に廃止されました。買い物をしても税金は戻ってこないので、予算に還付ぶんを見込まないでください。",
  },
  {
    question: "予備費はどれくらい見ておくべきですか？",
    answer:
      "**総額の10〜15%** を目安にしてください。天候で予定を変える、体調を崩して薬を買う、想定外に良い土産を見つける——このあたりで必ず動きます。",
  },
];

export const budgetSources = [...BUDGET_SOURCES];

export const budgetRelatedLinks: GuideRelatedLink[] = [
  { href: "/sightseeing/hotels", label: "宿泊エリア別ホテル選び" },
  { href: "/sightseeing/transport", label: "ロンドンの交通ガイド｜運賃と上限額の仕組み" },
  { href: "/food", label: "ロンドンの食費節約" },
  { href: "/sightseeing/tipping-and-payment", label: "チップと支払い｜service charge・カード・両替" },
  { href: "/sightseeing/itinerary", label: "ロンドン モデルコース（1〜5日）" },
  { href: "/sightseeing/travel-tips", label: "ロンドン旅行の実用情報" },
];
