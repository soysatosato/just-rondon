import type { FoodGuideArticle } from "../types";
import {
  CLOSING_DISCOUNTS,
  FOOD_AS_OF,
  FOOD_UPDATED_AT,
} from "@/lib/food/prices";

const discountTiming: FoodGuideArticle = {
  slug: "discount-timing",
  title: "閉店前の半額と値引きシール｜ロンドンで安く買う時間帯",
  engTitle: "Yellow Stickers and Closing-Time Discounts",
  audience: "夕方に買い物ができる人。日本食を安く食べたい人",
  summary: `${CLOSING_DISCOUNTS.wasabi.label} や ${CLOSING_DISCOUNTS.itsu.label} は閉店${CLOSING_DISCOUNTS.wasabi.minutesBefore}分前を目安に${CLOSING_DISCOUNTS.wasabi.offMin}〜${CLOSING_DISCOUNTS.wasabi.offMax}%引きになります。日本食が恋しい人が、まともな寿司に手頃な値段でありつける現実的な方法です。スーパーの値引きシールも、店ごとに時刻がほぼ決まっています。`,
  description:
    "ロンドンで食品を安く買うための時間帯ガイド。Wasabiやitsuの閉店前半額、スーパーのyellow sticker（値引きシール）が貼られる時刻の目安、狙い方と注意点を解説します。日本食を安く食べたい人にも。",
  keywords: [
    "Wasabi 半額 ロンドン",
    "itsu 割引",
    "yellow sticker イギリス",
    "ロンドン 値引き 時間",
    "ロンドン 寿司 安い",
    "イギリス スーパー 値引きシール",
    "ロンドン 食費 節約",
  ],
  dataAsOf: FOOD_AS_OF,
  updatedAt: FOOD_UPDATED_AT,
  atAGlance: [
    {
      label: `${CLOSING_DISCOUNTS.wasabi.label}・${CLOSING_DISCOUNTS.itsu.label}`,
      value: `閉店${CLOSING_DISCOUNTS.wasabi.minutesBefore}分前を目安に${CLOSING_DISCOUNTS.wasabi.offMin}〜${CLOSING_DISCOUNTS.wasabi.offMax}%引き（店舗差あり）`,
    },
    {
      label: "スーパー1回目",
      value: `${CLOSING_DISCOUNTS.supermarketFirstRound}ごろに値引きシールが入り始める`,
    },
    {
      label: "スーパー最終",
      value: `${CLOSING_DISCOUNTS.supermarketFinalRound}が最も安い`,
    },
    { label: "狙い目の商品", value: "寿司・サラダ・総菜・パン（消費期限が当日）" },
    { label: "注意", value: "時刻と割引率は店舗ごとの裁量。断定できない" },
  ],
  mainText: `イギリスの食品小売は、**消費期限が当日の商品を閉店前に値引きして売り切る**のが一般的です。日本のスーパーと同じ発想ですが、割引の幅が大きく、対象になる商品の範囲も広いのが特徴です。

とくに ${CLOSING_DISCOUNTS.wasabi.label} のような日本食チェーンは、閉店前に寿司が半額近くまで下がります。**通常価格では手が出にくい日本食に、現実的な値段でありつける**という点で、日本から来た人には効果が大きい方法です。

ただし、この分野で断定は禁物です。**値引きの時刻も割引率も、最終的には店舗の裁量**で決まります。以下は目安として読んでください。`,
  sections: [
    {
      id: "japanese-chains",
      title: `${CLOSING_DISCOUNTS.wasabi.label} と ${CLOSING_DISCOUNTS.itsu.label} の閉店前`,
      subtitle: "日本食が恋しいときの最有力手段",
      body: `### ${CLOSING_DISCOUNTS.wasabi.label}

寿司・カツカレー・焼きそばなどを売る日本食チェーンで、ロンドン中心部に多数の店舗があります。**閉店${CLOSING_DISCOUNTS.wasabi.minutesBefore}分前を目安に、寿司パックなどが${CLOSING_DISCOUNTS.wasabi.offMin}〜${CLOSING_DISCOUNTS.wasabi.offMax}%引き**になります。

店舗によって運用が違い、半額になる店もあれば${CLOSING_DISCOUNTS.wasabi.offMin}%引きで止まる店もあります。また、閉店時刻自体が店舗ごとに違う（オフィス街は早く、観光地は遅い）ため、**通いたい店舗の閉店時刻を先に確認する**のが確実です。

### ${CLOSING_DISCOUNTS.itsu.label}

アジア系の総菜・寿司・スープを扱うチェーンです。こちらも閉店前に${CLOSING_DISCOUNTS.itsu.offMin}〜${CLOSING_DISCOUNTS.itsu.offMax}%引きになります。itsu は値引きのタイミングをアプリや店頭で告知していることがあり、比較的読みやすいです。

### 現実的な立ち回り

- 閉店${CLOSING_DISCOUNTS.wasabi.minutesBefore}分前より**少し早めに着く**。値引き開始と同時に人が集まるため、遅れると残っていない
- **オフィス街の店舗**が狙い目。夕方には客が引くため在庫が残りやすい
- 逆に観光地・主要駅の店舗は、値引き前に売り切れることが多い
- 寿司は当日中に食べる前提で買う`,
      tips: [
        "同じチェーンでも店舗ごとに閉店時刻が違う。Google マップの営業時間を先に見る",
        "金曜・土曜は客が多く在庫が残りにくい。平日の方が成功率が高い",
        "値引きシールを貼る作業を待っている人が数人いることも珍しくない。並んで待つ雰囲気の店もある",
      ],
      callout: {
        tone: "tip",
        title: "日本食を安く食べる現実的な手段",
        body: `ロンドンで日本食レストランに入ると高くつきますが、${CLOSING_DISCOUNTS.wasabi.label} の閉店前なら寿司パックが手頃な値段になります。「日本の味が恋しいが予算が厳しい」という状況で、最も費用対効果の高い選択肢です。`,
      },
    },
    {
      id: "yellow-sticker",
      title: "スーパーの値引きシール（yellow sticker）",
      subtitle: "店ごとに時刻がほぼ固定されている",
      body: `Tesco、Sainsbury's、Co-op、M&S Food などでは、消費期限が近い商品に**黄色い値引きシール**が貼られます。イギリスでは「yellow sticker」と呼ばれ、これを狙う人たちのことを yellow sticker hunter と呼ぶ表現まであります。

### 値引きは通常2段階

| 時間帯 | 値引きの目安 |
| --- | --- |
| ${CLOSING_DISCOUNTS.supermarketFirstRound} | 25〜50%引き。品揃えは広い |
| ${CLOSING_DISCOUNTS.supermarketFinalRound} | **最も安い**。ただし残り物のみ |

1回目は選べる量が多く、2回目は安いが選べません。**「安さ優先なら閉店前、品揃え優先なら夕方」**という切り分けになります。

### 店ごとの時刻を掴む

重要なのは、**同じチェーンでも店舗ごとに時刻が違う**ことです。作業を担当するスタッフのシフトで決まるため、いったん掴めば以後はほぼ同じ時刻に貼られます。

やり方は単純で、通いやすい店に何度か夕方に行き、シールが貼られた時刻を覚えるだけです。2〜3回行けば傾向が見えます。

### 狙い目の商品

- **寿司・サラダ・総菜** —— 消費期限が当日なので値引き幅が大きい
- **パン・ベーカリー** —— 閉店前に大きく下がる
- **肉・魚** —— 冷凍すれば期限を延ばせるため、実質的な得が最も大きい
- **カットフルーツ**

逆に日持ちする加工食品はほとんど対象になりません。`,
      tips: [
        "肉と魚はその日に冷凍すれば数週間使える。値引き品の中で最も投資効率が高い",
        "M&S Food は元の価格が高いため、値引き後の割安感が大きい",
        "「Reduced」の棚が独立して設けられている店舗もある。入店したらまずそこを見る",
        "消費期限（use by）と賞味期限（best before）は別物。肉・魚・乳製品の use by は必ず守る",
      ],
      callout: {
        tone: "warn",
        title: "use by は守る",
        body: "「best before（賞味期限）」は品質の目安なので多少過ぎても実用上問題ありませんが、「use by（消費期限）」は安全性の期限です。とくに肉・魚・調理済み総菜の use by を過ぎたものは食べないでください。値引き品はこの期限が近いからこそ安くなっています。",
      },
    },
    {
      id: "bakeries",
      title: "ベーカリーとカフェの閉店前",
      subtitle: "パンは翌日に残せない商品",
      body: `個人経営のベーカリーやカフェも、閉店前にパンやペストリーを値引きします。パンは翌日に持ち越せないため、**閉店間際は投げ売りに近い状態**になることがあります。

チェーンでは **Greggs** が閉店前に値引きすることがありますが、店舗の裁量が大きく安定はしません。

このジャンルは [Too Good To Go](/food/apps-and-coupons) との相性が非常に良く、アプリ経由の方が確実に確保できます。店頭で交渉するより、アプリで枠を取る方が現実的です。`,
      tips: [
        "パンは買った日に切って冷凍すると1〜2週間もつ。トースターで焼けば十分おいしい",
        "個人店は「閉店前に値引きするか」を一度聞いてみると教えてくれることが多い",
      ],
    },
  ],
  faq: [
    {
      question: `${CLOSING_DISCOUNTS.wasabi.label} は必ず半額になりますか。`,
      answer: `いいえ。${CLOSING_DISCOUNTS.wasabi.offMin}%引きで止まる店舗もあり、割引率と開始時刻は店舗ごとの裁量です。「閉店${CLOSING_DISCOUNTS.wasabi.minutesBefore}分前を目安に値引きが始まることが多い」という理解が正確で、確実な保証はありません。`,
    },
    {
      question: "値引きシールが貼られる正確な時刻を知る方法はありますか。",
      answer:
        "公表されていません。担当スタッフのシフトで決まるため、通いたい店に数回夕方に行って実際の時刻を覚えるのが唯一確実な方法です。いったん掴めば以後はほぼ同じ時刻になります。",
    },
    {
      question: "値引き品の品質は落ちますか。",
      answer:
        "消費期限が近いだけで、品質そのものは通常品と同じです。ただし use by（消費期限）が当日の商品が多いため、その日か翌日に食べる、または冷凍する前提で買ってください。",
    },
  ],
  relatedLinks: [
    { href: "/food/apps-and-coupons", label: "アプリとクーポンで削る" },
    { href: "/food/meal-deal", label: "Meal Deal を使い切る" },
    { href: "/food/where-to-buy", label: "買う場所を変える" },
  ],
  commentPrompt:
    "「この店舗は何時に値引きシールが入る」「ここは半額になる」といった具体的な情報があれば、店舗名とあわせて教えてください。同じエリアの人に役立ちます。",
};

export default discountTiming;
