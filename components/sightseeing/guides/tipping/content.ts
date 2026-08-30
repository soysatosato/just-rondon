import { CONTACTLESS_BRANDS } from "@/lib/transport/rates";
import { TRAVEL_GUIDE_AS_OF, TRAVEL_GUIDE_UPDATED_AT } from "../guides";
import type { TravelGuideMetaSource } from "../guides";
import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSourceLink,
} from "@/components/guides/types";

/**
 * チップと支払い。
 *
 * travel-tips.ts の money / cards / tipping / vat を切り出したもの。
 * 「ロンドン チップ」「ロンドン 両替」は単独で検索需要が大きく、
 * 実用情報の1セクションに埋めておくと上位を取れない。一方で新規に
 * 書き下ろすと travel-tips と自己カニバリを起こす。そこで切り出して、
 * travel-tips 側は要約＋リンクに置き換えている。
 * travel-tips に同じ内容を戻さないこと。金額の一次情報はこちらが持つ。
 *
 * /jobs/service-charges(在住者・従業員視点の Tipping Act 解説)とは
 * 読者が違う。こちらは「払う側」、あちらは「受け取る側」。
 * 相互リンクは張るが、内容は重ねない。
 *
 * 形の設計:
 * この記事は読み物ではなく「その場でどうするか」の判定集。読者は
 * レジや伝票を前にして開く。だから以前の作り——8行の相場表、4行の
 * ブランド表、散文の DCC 解説——は形が合っていなかった。
 * とくに、このページで最も実用的なのは実際に口に出す英語の一文
 * ("Could you remove the service charge, please?")なのに、
 * 2節目の本文中の引用ブロックに埋まっていた。前に出す。
 *
 * 為替レートは書かない。書いた瞬間に古くなり、読者が誤った予算を立てる。
 */

/* ------------------------------------------------------------------ */
/* メタ情報                                                            */
/* ------------------------------------------------------------------ */

export const tippingMeta: TravelGuideMetaSource & {
  engTitle: string;
  summary: string;
  dataAsOf: string;
} = {
  slug: "tipping-and-payment",
  title: "ロンドンのチップと支払い｜service charge・カード・両替・DCC の断り方",
  engTitle: "Tipping & Paying in London",
  summary:
    "ロンドンでチップは義務ではありません。着席型のレストランでは service charge が12.5%前後、伝票に自動加算されているのが普通で、その場合は追加不要です。そして街はほぼ完全にキャッシュレス。ただし JCB はほぼ使えず、円建て決済を勧められたら断るべきです。払う側が知っておくべきことをまとめました。",
  description:
    "ロンドンのチップの相場と service charge の仕組み、外してもらう方法、キャッシュレス事情、JCB が使えない問題、DCC（円建て決済）を断る理由、両替で損をしない方法、現金がいくら必要かを解説します。2026年8月時点。",
  keywords: [
    "ロンドン チップ",
    "イギリス チップ 相場",
    "service charge ロンドン",
    "ロンドン 両替",
    "ロンドン クレジットカード",
    "ロンドン 現金",
    "イギリス JCB",
  ],
  dataAsOf: TRAVEL_GUIDE_AS_OF,
  updatedAt: TRAVEL_GUIDE_UPDATED_AT,
};

/** 冒頭で答えを3つ出し切る。ここで帰る読者がいてよい。 */
export const headlines = [
  { head: "チップは義務ではない", body: "払うかどうかを毎回考える必要はありません" },
  {
    head: "着席型は service charge 12.5%前後が加算済み",
    body: "伝票に乗っていれば追加不要。外すこともできます",
  },
  { head: "JCB はほぼ使えない", body: "地下鉄の改札でも不可。Visa か Mastercard を用意" },
];

export const tippingLead =
  "日本人がロンドンで最も不安になるのが「チップをいくら払えばいいのか」ですが、実際はかなり簡単です。ロンドンはほぼ完全にキャッシュレスで、現金は£20〜50もあれば足ります。";

export const payerScope = {
  body: "この記事は「払う側」の話です。集められた service charge が従業員にどう渡るのかは別ページで扱っています。",
  href: "/jobs/service-charges",
  label: "英国サービスチャージ完全ガイド（受け取る側の話）",
};

/* ------------------------------------------------------------------ */
/* 1. チップの相場                                                     */
/* ------------------------------------------------------------------ */

export type TipVerdict = "加算済み" | "不要" | "任意";

export type TipCase = {
  where: string;
  verdict: TipVerdict;
  detail: string;
  href?: string;
  hrefLabel?: string;
};

/**
 * 8行の表をやめて判定カードにする。
 * 読者は「いまパブにいる。払うのか」を1件だけ知りたいので、
 * 判定を行頭のバッジにして目で拾えるようにする。
 */
export const tipCases: TipCase[] = [
  {
    where: "レストラン（着席・給仕あり）",
    verdict: "加算済み",
    detail: "伝票に service charge 12.5% 前後が自動加算されていることが多い。加算済みなら追加不要",
  },
  {
    where: "パブ（カウンターで注文）",
    verdict: "不要",
    detail: "席で待っていても誰も来ません。カウンターで注文して先払いします",
    href: "/restaurants/pub-etiquette",
    hrefLabel: "パブの作法",
  },
  { where: "カフェ・ファストフード", verdict: "不要", detail: "端末のチップ選択は断ってよい" },
  { where: "ホテル（枕銭）", verdict: "不要", detail: "置く習慣がありません" },
  { where: "タクシー", verdict: "任意", detail: "端数を切り上げる程度。必須ではない" },
  { where: "ホテル（荷物を運んでもらった）", verdict: "任意", detail: "£1〜2 程度" },
  { where: "美容室・理容室", verdict: "任意", detail: "10%程度" },
  { where: "ツアーガイド", verdict: "任意", detail: "£5〜10 程度" },
];

export const tippingRule =
  "迷ったら「加算されているか伝票を見る」だけで足ります。加算されていれば何もしない。されていなくて満足したなら10〜12%を足す。それだけです。";

export const tippingVsJapan = {
  title: "日本との決定的な違い",
  body: "日本では「チップを渡す＝特別なこと」ですが、英国では service charge として最初から価格に組み込まれていることが多い。つまり、チップを払うかどうかを毎回考える必要がありません。",
};

export const tippingNotes = [
  "チップを現金で渡すか、カードの伝票に足すかは自由。どちらも普通に行われている",
  "「サービスが良かったから多めに」は自由だが、20%を超える必要はまったくない",
];

/* ------------------------------------------------------------------ */
/* 2. service charge を外す                                            */
/* ------------------------------------------------------------------ */

/**
 * このページで唯一「実際に口に出す」もの。
 * 以前は本文中の引用ブロックだったので、伝票を前にした読者が探せなかった。
 */
export const removePhrase = {
  en: "Could you remove the service charge, please?",
  ja: "サービスチャージを外していただけますか",
  note: "英国では普通に行われていることで、気まずい行為ではありません。店員も慣れています。",
};

export const removeWhen = {
  title: "外してよい場面",
  items: [
    "明らかに給仕の対応が悪かった",
    "注文が間違っていて、対応も雑だった",
    "そもそも給仕らしい給仕を受けていない（実質セルフサービスだった）",
  ],
  reverse:
    "逆に、加算されていない店で満足したなら、10〜12%程度を渡すと喜ばれます。",
};

export const terminalTip = {
  title: "カフェの端末で出るチップ選択",
  body: "カードをタッチする端末に「10% / 15% / 20% / No tip」と表示されることが増えました。カウンター注文なら No tip で問題ありません。これは米国式の慣行が端末経由で入ってきたもので、英国の相場ではありません。",
};

export const doubleTip = {
  title: "二重に払わない",
  body: "service charge が加算されている伝票で、さらに端末でチップを足す必要はありません。端末が改めてチップを聞いてくることがありますが、加算済みなら No tip を選んでください。",
};

export const tippingActCallout: GuideCalloutData = {
  tone: "info",
  title: "そのチップはどこへ行くのか",
  body: "2023年に成立した Tipping Act により、集められたサービスチャージは原則として従業員に全額渡ることになっています。制度の詳細と、実際に守られているかは[英国サービスチャージ完全ガイド](/jobs/service-charges)で掘り下げています。",
};

/* ------------------------------------------------------------------ */
/* 3. カード                                                           */
/* ------------------------------------------------------------------ */

export type BrandVerdict = "○" | "△" | "×";

export const cardBrands: {
  brand: string;
  verdict: BrandVerdict;
  detail: string;
}[] = [
  { brand: "Visa", verdict: "○", detail: "どこでも" },
  { brand: "Mastercard", verdict: "○", detail: "どこでも" },
  {
    brand: "American Express",
    verdict: "△",
    detail: "中〜高価格帯の店では使えるが、小さな店では断られることがある",
  },
  { brand: "JCB", verdict: "×", detail: "加盟店が非常に少ない。地下鉄の改札でも使えない" },
];

export const cashless = {
  intro:
    "ロンドンのキャッシュレス化は日本より進んでいます。カフェ、パブ、スーパー、地下鉄、タクシー、屋台まで、ほぼすべてがカードで完結します。「現金お断り」の店すら珍しくありません。",
  jcbWarning: `JCB しか持っていない場合は、必ず Visa か Mastercard を用意してください。地下鉄の改札でも同じです。TfL のタッチ決済が受け付けるのは ${CONTACTLESS_BRANDS.join("、")} で、JCB は含まれていません。`,
  contactless: {
    title: "タッチ決済が基本",
    body: "英国のタッチ決済（contactless）に金額の上限はありますが、日常的な買い物ならまず届きません。高額の決済では IC チップ＋PIN（暗証番号）を求められます。カードの暗証番号を思い出せるようにしておいてください。",
  },
  phone: {
    title: "スマホ決済",
    body: "Apple Pay / Google Pay も広く使えます。地下鉄の改札でも使えますが、電池切れに注意してください。改札の中で電池が切れると出られなくなります。",
  },
  notes: [
    "IC チップ＋PIN を使う場面がある。暗証番号を忘れているなら、渡航前に確認しておく",
    "カード会社に「英国で使う」と事前に伝えておくと、不正利用検知でカードが止まるリスクが下がる",
    "予備のカードを別の場所に分けて持つ。1枚が止まると身動きが取れなくなります",
    "スマホ決済で改札を通ったなら、そのスマホでしか出られない。同行者と端末を混同しないこと",
  ],
};

/* ------------------------------------------------------------------ */
/* 4. DCC                                                              */
/* ------------------------------------------------------------------ */

/**
 * 判断は二択で、答えは常に同じ。散文にせず、規則として1行で出す。
 */
export const dcc = {
  asked: "GBP と JPY のどちらで支払いますか？",
  rule: "必ず GBP（ポンド建て）を選ぶ",
  why: "円建てを選ぶと、その店や ATM 事業者が決めたレートで換算されます。これはカード会社の国際ブランドレートより明確に不利です。数%の差が乗ることが多く、滞在中ずっと円建てを選び続けると無視できない額になります。「日本円で表示されるほうが安心」と感じるのは自然ですが、その安心感の対価が数%の手数料です。",
  /** 端末に実際に出る文字列。これを探せば済む。 */
  buttons: {
    terminal: ["GBP", "Pay in GBP", "Pounds"],
    atm: ["Without conversion", "Continue without conversion"],
  },
  noExplanation: "店員に説明する必要はありません。端末の画面で選ぶだけです。",
  callout: {
    tone: "warn" as const,
    title: "円建てを選ぶと、ほぼ確実に損をします",
    body: "DCC は「親切な機能」に見えますが、換算レートを決めるのは店やATM側です。カード会社のレートのほうが有利なので、常に GBP を選んでください。",
  },
};

/* ------------------------------------------------------------------ */
/* 5. 現金と両替                                                       */
/* ------------------------------------------------------------------ */

export const cash = {
  currency: "通貨はポンド（GBP、£）。補助単位はペンス（p）で、£1 = 100p です。",
  amount: "£20〜50",
  amountBody: "もあれば十分です。使う場面は次のくらいに限られます。",
  uses: ["小さな屋台やマーケットの一部", "一部の公衆トイレ（20〜50p）", "現金で渡したいチップ"],

  /** 評価順に並べる。表の行として並列に置くと、優劣が伝わらない。 */
  exchange: [
    {
      how: "Wise / Revolut などのマルチカレンシーカード",
      rank: "有力" as const,
      detail: "渡航前に作っておく",
    },
    {
      how: "現地の ATM（cashpoint）",
      rank: "有力" as const,
      detail: "必要な分だけ引き出す。DCC は断る",
    },
    {
      how: "街の「手数料無料」の両替所",
      rank: "避ける" as const,
      detail: "手数料を取らない代わりに、実質レートに利益を乗せている。無料ではない",
    },
    { how: "空港の両替所", rank: "最も不利" as const, detail: "緊急時以外は使わない" },
  ],
  exchangeRule: "日本で全額を両替するのは、ほぼ確実に損です。",

  notes_banknotes: {
    title: "紙幣について",
    items: [
      "現在有効なのはポリマー（プラスチック）製の紙幣のみ。従来の紙製紙幣は2022年9月に法定通貨としての効力を失っています",
      "£50 紙幣は小さな店で受け取りを断られることがある。ATM では £20 以下の紙幣が出る設定を選ぶと安心",
    ],
  },

  noRate: {
    title: "為替レートについて",
    body: "この記事では意図的に「£1=◯円」を書いていません。書いた時点で古くなり、読者が誤った予算を立てる原因になるためです。渡航直前にご自身で確認してください。",
  },

  notes: [
    "スコットランドや北アイルランドの銀行が発行するポンド紙幣は、イングランドの店で受け取りを渋られることがある",
    "ATM は銀行の店内にあるものを使う。路上の独立系 ATM は手数料を取ることがある",
    "小銭は帰国前に使い切る。日本では硬貨を両替できません",
  ],
};

/* ------------------------------------------------------------------ */
/* 6. 免税                                                             */
/* ------------------------------------------------------------------ */

export const vat = {
  verdict: "廃止済み",
  when: "2021年1月",
  headline: "英国の旅行者向け VAT（付加価値税）還付制度はありません",
  body: "かつては店で「Tax Free」の書類を作ってもらい、空港で還付を受けることができましたが、現在この制度は存在しません。ブレグジット後の制度変更によるものです。ロンドンで買い物をしても、税金は戻ってきません。",
  warning:
    "古いガイドブックやブログには今も還付手続きの説明が残っていることがあります。予算に「還付ぶん」を見込まないでください。",
  eu: "なお、EU 各国（フランス、イタリアなど）では引き続き還付制度があります。英国と大陸ヨーロッパを周遊する場合、英国だけルールが違うと覚えておいてください。",
};

/* ------------------------------------------------------------------ */
/* 7. 表示価格                                                         */
/* ------------------------------------------------------------------ */

export const prices = {
  vatIncluded: {
    title: "VAT は表示価格に含まれています",
    body: "英国の小売価格は税込表示です。レジで消費税が上乗せされることはありません（日本の総額表示と同じ）。",
  },
  addOns: [
    { what: "service charge", detail: "着席型のレストランで12.5%前後。伝票に加算される" },
    { what: "カバーチャージ", detail: "一部の店で席料。まれ" },
    { what: "レジ袋", detail: "有料。エコバッグを持参する" },
    { what: "公衆トイレ", detail: "20〜50p のことがある" },
    { what: "配達手数料", detail: "デリバリーアプリで別途" },
  ],
  sunday: {
    title: "大型店の日曜営業",
    body: "直接の支払いの話ではありませんが、覚えておくと役に立ちます。大型店（延床面積の大きい店）の日曜営業は法律で6時間に制限されており、11:00〜17:00 が典型です。日曜に買い物を予定しているなら、開店が遅い前提で組んでください。",
  },
};

/* ------------------------------------------------------------------ */
/* セクション一覧                                                      */
/* ------------------------------------------------------------------ */

export const tippingSections = [
  { id: "tipping", label: "チップの相場", navLabel: "チップ" },
  { id: "service-charge", label: "service charge を外す", navLabel: "外す" },
  { id: "cards", label: "カード決済とキャッシュレス", navLabel: "カード" },
  { id: "dcc", label: "円建て決済（DCC）は断る", navLabel: "DCC" },
  { id: "cash", label: "現金と両替", navLabel: "現金" },
  { id: "vat", label: "免税（VAT還付）", navLabel: "免税" },
  { id: "prices", label: "表示価格と、あとから乗るもの", navLabel: "表示価格" },
] as const;

/* ------------------------------------------------------------------ */
/* FAQ・出典・関連                                                     */
/* ------------------------------------------------------------------ */

export const tippingFaq: GuideFaqItem[] = [
  {
    question: "ロンドンでチップは必ず払わないといけませんか？",
    answer:
      "**義務ではありません**。着席型のレストランでは伝票に service charge が12.5%前後加算されていることが多く、その場合は追加不要です。パブのカウンター注文、カフェ、ホテルの枕銭は不要です。",
  },
  {
    question: "service charge は断れますか？",
    answer:
      '**断れます**。法的な支払い義務はありません。サービスに不満があれば "Could you remove the service charge, please?" と伝えれば外してもらえます。英国では普通に行われていることで、気まずい行為ではありません。',
  },
  {
    question: "JCB カードは使えますか？",
    answer:
      "**ほぼ使えません**。加盟店が非常に少なく、**地下鉄の改札でも使えません**。Visa または Mastercard を必ず用意してください。American Express は中〜高価格帯の店では使えますが、小さな店では断られることがあります。",
  },
  {
    question: "「円で払いますか、ポンドで払いますか」と聞かれたら？",
    answer:
      "**必ずポンド（GBP）を選んでください**。これは DCC と呼ばれる仕組みで、円建てを選ぶと店や ATM 側が決めた不利なレートが適用されます。カード会社のレートのほうが有利です。",
  },
  {
    question: "現金はいくら持っていけばいいですか？",
    answer:
      "**£20〜50 程度で十分**です。ロンドンはほぼ完全にキャッシュレスで、カフェ・パブ・スーパー・地下鉄・タクシーまでカードで完結します。現金が必要なのは、小さな屋台、一部の公衆トイレ、チップくらいです。",
  },
  {
    question: "両替はどこでするのが得ですか？",
    answer:
      "**日本で全額両替するのは避けてください**。空港の両替所は最も不利で、「手数料無料」を掲げる両替所も実質レートに利益を乗せています。Wise や Revolut などのマルチカレンシーカードを用意し、現地の ATM で必要な分だけ引き出すのが現実的です。",
  },
  {
    question: "免税手続き（VAT還付）はできますか？",
    answer:
      "**できません**。英国の旅行者向け VAT 還付制度は2021年1月に廃止されました。古いガイドブックには還付手続きの説明が残っていることがありますが、現在この制度は存在しません。",
  },
];

export const tippingSources: GuideSourceLink[] = [
  { label: "GOV.UK – Tips at work（チップの取り扱い）", url: "https://www.gov.uk/tips-at-work" },
  { label: "GOV.UK – Tax on shopping and services（VAT）", url: "https://www.gov.uk/tax-on-shopping" },
  {
    label: "Bank of England – Withdrawn banknotes（旧紙幣）",
    url: "https://www.bankofengland.co.uk/banknotes/exchange-withdrawn-banknotes",
  },
  {
    label: "TfL – Contactless payment（対応ブランド）",
    url: "https://tfl.gov.uk/fares/how-to-pay-and-where-to-buy-tickets-and-oyster/pay-as-you-go/contactless-and-mobile-pay-as-you-go",
  },
];

export const tippingRelatedLinks: GuideRelatedLink[] = [
  { href: "/jobs/service-charges", label: "英国サービスチャージ完全ガイド（受け取る側の話）" },
  { href: "/sightseeing/budget", label: "ロンドン旅行の予算｜7日間の費用を積算" },
  { href: "/sightseeing/travel-tips", label: "ロンドン旅行の実用情報" },
  { href: "/sightseeing/transport/fares", label: "ロンドンの運賃と上限額の仕組み" },
  { href: "/food", label: "ロンドンの食費節約" },
];
