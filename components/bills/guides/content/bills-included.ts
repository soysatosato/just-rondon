import type { BillsGuideArticle } from "../types";
import {
  BILLS_AS_OF,
  BILLS_SOURCES,
  BILLS_UPDATED_AT,
  COUNCIL_TAX,
  ENERGY_CAP,
  TV_LICENCE,
  WATER,
  gbp,
  gbpRound,
  londonCouncilTaxForBand,
} from "@/lib/bills/rates";

/*
  比較の計算例。3人でフラットをシェアし、住人が請求を分担する前提。

  ネット回線だけは公的な基準値がないので、ここで仮定を置く
  (rates.ts は事業者のプラン価格を持たない方針)。
  ガス・電気は Ofgem の「典型的な使用量の世帯」の年額を使う。
  3人世帯の実際の使用量はこれより多いことが多いので、控えめな見積もりになる。
*/
const SHARERS = 3;
const ASSUMED_BROADBAND_MONTHLY = 30;
const EXAMPLE_BAND = "C" as const;

const rows = [
  {
    item: "Council Tax",
    basis: `ロンドン平均の Band ${EXAMPLE_BAND}`,
    monthly: londonCouncilTaxForBand(EXAMPLE_BAND) / 12,
  },
  {
    item: "ガス・電気",
    basis: "Ofgem の典型的な世帯の年額",
    monthly: ENERGY_CAP.typicalAnnual / 12,
  },
  {
    item: "水道",
    basis: `${WATER.company} の典型的な年額`,
    monthly: WATER.typicalAnnual / 12,
  },
  {
    item: "ネット回線",
    basis: `月${gbp(ASSUMED_BROADBAND_MONTHLY)}と仮定`,
    monthly: ASSUMED_BROADBAND_MONTHLY,
  },
  {
    item: "TV Licence",
    basis: `年${gbp(TV_LICENCE.annual)}`,
    monthly: TV_LICENCE.annual / 12,
  },
];

const householdMonthly = rows.reduce((sum, r) => sum + r.monthly, 0);
const perPersonMonthly = householdMonthly / SHARERS;

const costTable = rows
  .map(
    (r) =>
      `| ${r.item} | ${r.basis} | ${gbpRound(r.monthly)} | ${gbpRound(
        r.monthly / SHARERS
      )} |`
  )
  .join("\n");

const EXAMPLE_EXCLUDED_RENT = 850;
const EXAMPLE_INCLUDED_RENT = 950;

const billsIncluded: BillsGuideArticle = {
  slug: "bills-included",
  title: "「bills included」の意味と中身｜家賃込みの光熱費に何が入っているか",
  engTitle: "What 'Bills Included' Really Means",
  audience:
    "部屋探し中で、bills included と bills excluded の家賃をどう比べればいいか分からない人",
  summary: `「bills included」に法律上の定義はなく、何が含まれるかは物件ごとに違います。council tax・ガス電気・水道・ネット・TV licence の5項目を1つずつ確かめてください。3人シェアのフラットなら、含まれない分は1人あたり月${gbpRound(
    perPersonMonthly
  )}前後になります。`,
  description: `ロンドンの物件広告にある「bills included」の意味と中身を解説。含まれうる5項目（council tax・ガス電気・水道・ネット・TV licence）、含まれない場合に1人あたり月いくら足せばいいか、fair usage（使用量の上限）の条件、シェアで請求を分担するときの名義の注意、契約前に聞く英語の質問まで。`,
  keywords: [
    "bills included 意味",
    "bills included 何が含まれる",
    "ロンドン 家賃 光熱費込み",
    "bills excluded",
    "フラットシェア 光熱費",
    "fair usage policy 家賃",
    "イギリス 家賃 相場 光熱費",
  ],
  dataAsOf: BILLS_AS_OF,
  updatedAt: BILLS_UPDATED_AT,
  atAGlance: [
    {
      label: "定義",
      value: "**決まった意味はない**。物件ごとに中身が違う",
    },
    {
      label: "確かめる5項目",
      value: "Council Tax・ガス電気・水道・ネット回線・TV Licence",
    },
    {
      label: "含まれない分の目安",
      value: `3人シェアなら1人あたり月${gbpRound(perPersonMonthly)}前後（計算の前提は本文）`,
    },
    {
      label: "よくある落とし穴",
      value: "**使用量の上限**（fair usage）つき。超えた分は別に請求される",
    },
    {
      label: "証拠の残し方",
      value: "含まれる項目と上限額を**メールで**答えてもらう",
    },
  ],
  mainText: `ロンドンの物件広告、とくに SpareRoom のようなフラットシェアの広告では、家賃の横に **「bills included」** か **「bills excluded」** が書かれています。

「光熱費込み」と訳されますが、**この言葉に法律上の定義はありません。** ある物件ではネット回線まで含み、別の物件では council tax が含まれていない。同じ「bills included」でも、中身は物件ごとに違います。

そのため、家賃の数字だけで比べると判断を誤ります。やることは2つです。

1. **含まれる項目を1つずつ確かめる**
2. **含まれない項目の額を足してから、家賃を比べる**`,
  sections: [
    {
      id: "five-items",
      title: "確かめるのは5項目",
      navLabel: "5つの項目",
      subtitle: "「bills」が指しうるもの",
      body: `「bills」が指しうるのは、次の5つです。

| 項目 | 何か | 含まれないと |
|---|---|---|
| **Council Tax** | 区に払う地方税 | 5項目の中で最も額が大きい |
| **ガス・電気** | 暖房・給湯・調理・照明 | 冬に大きく増える |
| **水道** | 上下水道 | ロンドンの大半は Thames Water |
| **ネット回線** | broadband（Wi-Fi） | 自分たちで契約し、開通まで待つ |
| **TV Licence** | テレビ受信料 | 見ないなら不要なこともある |

とくに注意したいのは **Council Tax** です。額が大きいのに、「bills」という言葉からは連想されにくく、「ガス・電気・水道・ネットは込み、council tax は別」という物件が珍しくありません。

### 「部屋ごとの契約」なら council tax は大家の負担

部屋ごとに別々の契約で貸すシェアハウス（HMO）では、Council Tax の納税義務者は **大家** です。この形なら council tax は家賃に含まれているのが普通で、住人に別途請求されることはありません。

逆に、1軒をまとめて借りる契約に住人全員が名前を連ねている場合は、住人が払う側です。どちらの契約なのかは、[Council Tax の記事](/bills/council-tax)で見分け方を説明しています。`,
    },
    {
      id: "how-much",
      title: "含まれない分は、いくら足せばいいか",
      navLabel: "足す額の目安",
      subtitle: `3人シェアで1人あたり月${gbpRound(perPersonMonthly)}前後`,
      body: `ロンドンのフラットを3人でシェアし、5項目すべてを住人で分担する場合の目安です。

| 項目 | 計算の前提 | 世帯の月額 | 1人あたり |
|---|---|---|---|
${costTable}
| **合計** | | **${gbpRound(householdMonthly)}** | **${gbpRound(
        perPersonMonthly
      )}** |

前提について。

- **Council Tax** はロンドン全体の平均で換算しています。区によって半分以下にも、それ以上にもなります
- **ガス・電気** は Ofgem が定める「典型的な使用量の世帯」の年額（${ENERGY_CAP.period}の単価）を月割りにしています。3人暮らしは典型より多く使うことが多いので、**実際はこれより高くなりがち** です。しかも冬に偏ります
- **ネット回線** だけは公的な基準がないので、月${gbp(ASSUMED_BROADBAND_MONTHLY)}と仮定しています
- **TV Licence** はテレビやライブ配信を見ないなら不要です

### 比べてみる

| 物件 | 家賃 | 足す額 | 実質の月額 |
|---|---|---|---|
| A：bills excluded | ${gbp(EXAMPLE_EXCLUDED_RENT)} | ＋${gbpRound(
        perPersonMonthly
      )} | **${gbpRound(EXAMPLE_EXCLUDED_RENT + perPersonMonthly)}** |
| B：bills included（5項目すべて） | ${gbp(EXAMPLE_INCLUDED_RENT)} | ＋£0 | **${gbp(EXAMPLE_INCLUDED_RENT)}** |

家賃の表示では A が${gbp(
        EXAMPLE_INCLUDED_RENT - EXAMPLE_EXCLUDED_RENT
      )}安く見えますが、実質は B のほうが安くなります。ただし B に次の節の「上限」がついていれば、冬に逆転することもあります。`,
      tips: [
        "Council Tax は物件の住所で band と区の額を調べれば、推測ではなく実額で足せる。",
        "ガス・電気は、物件の EPC に載っている推定年間光熱費を使うと、典型値より物件に近い数字になる。",
        "一人暮らしなら Council Tax は25%引きになるので、足す額の計算も変わる。",
      ],
    },
    {
      id: "fair-usage",
      title: "「込み」でも上限がついていることがある",
      navLabel: "使用量の上限",
      subtitle: "fair usage policy",
      body: `bills included の物件でも、契約書に **使用量の上限（fair usage policy / cap）** が書かれていることがあります。

> ガス・電気は月£◯◯まで家賃に含む。超えた分は住人で均等に負担する

というような条項です。上限は夏には気にならず、**暖房を使う冬に超えます。**

### 契約前に確かめること

- 上限は **いくらか**（ガス・電気・水道・ネットのどれに、月額か年額か）
- 超えたかどうかを **何で判定するか**（メーターの数値か、請求書か）
- 超えた分を **いつ、どう分けて** 請求されるか（頭割りか、部屋の広さか）
- **請求書の写しを見せてもらえるか**

### 大家が上乗せして請求するのは認められていない

大家が供給会社から買ったガスや電気を、使用量に応じて住人に請求する（転売する）場合、**請求できるのは大家が実際に払った額まで** です（基本料金を含む）。これは Ofgem の再販価格の上限（maximum resale price）という規則で、利益を乗せることは認められていません。

上限を超えたとして請求されたら、**元の請求書を見せてもらう** のが正当な求めです。`,
      callout: {
        tone: "warn",
        title: "口頭の「全部込み」は証拠にならない",
        body: "内見で「全部込みだよ」と言われても、契約書に上限の条項があれば条項が優先されます。含まれる項目と上限の有無は、契約前にメールで質問し、文面で答えてもらってください。",
      },
    },
    {
      id: "sharing",
      title: "自分たちで払うシェアの場合",
      navLabel: "シェアで分担",
      subtitle: "名義を持つ人がリスクを持つ",
      body: `bills excluded のフラットをシェアすると、ガス・電気・水道・ネットの契約は **誰か1人の名義** になるのが普通です。

### 名義人が背負うもの

- 請求は名義人に届き、**払えなければ名義人の債務** になる
- 同居人が分担金を払わずに出ていっても、会社への支払い義務は名義人に残る

一方、Council Tax は1軒をまとめて借りている住人全員が **連帯して** 責任を負います。こちらは名義人1人の問題ではありません。

### 揉めないための決めごと

- **名義を分散する**：ガス電気はAさん、ネットはBさん、というように1人に集中させない
- **分け方を最初に決める**：頭割りか、部屋の広さか、在宅時間か
- **分担の記録を残す**：割り勘アプリや共有のスプレッドシートを使い、口約束にしない
- **退去時の精算を決めておく**：出ていく人の最終分をどう計算するか（退去日のメーターの数値で区切るのが公平）

### 同居人が入れ替わるとき

出ていく人の名義の契約は、**名義変更か解約・新規契約** が必要です。放置すると、出ていった人に請求が届き続けるか、残った人がサービスを止められます。`,
    },
    {
      id: "questions",
      title: "契約前に聞く質問（英語つき）",
      navLabel: "聞く質問",
      subtitle: "メールでそのまま送れる形",
      body: `次の質問をメールで送り、答えを文面で残してください。

1. **含まれる項目は何ですか。**
   Which bills are included in the rent? Council tax, gas, electricity, water, broadband and TV licence?

2. **使用量の上限はありますか。**
   Is there a cap or fair usage policy on any of the bills? If so, how much is it, and how are charges above the cap split?

3. **Council Tax は誰が払いますか。**
   Who is liable for council tax at this property, the landlord or the tenants?

4. **自分たちで払う場合、今の供給会社はどこですか。**
   If bills are not included, which companies currently supply gas, electricity, water and broadband?

5. **冬の光熱費の実績はいくらでしたか。**
   Roughly how much were the gas and electricity bills last winter?

5番目にはっきり答えられない場合、それ自体が判断材料になります。`,
    },
  ],
  faq: [
    {
      question: "bills included にはネット回線も含まれますか。",
      answer:
        "物件によります。bills included に法律上の定義はないため、ネット回線を含む物件もあれば含まない物件もあります。Council Tax・ガス電気・水道・ネット回線・TV Licence の5項目を1つずつ確認し、答えをメールで残してください。",
    },
    {
      question: "bills excluded の物件は、家賃にいくら足して考えればいいですか。",
      answer: `3人でシェアし5項目すべてを分担する場合、1人あたり月${gbpRound(
        perPersonMonthly
      )}前後が目安です（ロンドン平均の Council Tax、Ofgem の典型的な世帯の光熱費、Thames Water の典型的な水道代、ネット回線月${gbp(
        ASSUMED_BROADBAND_MONTHLY
      )}と仮定）。冬は光熱費が増え、区によって Council Tax は大きく違います。`,
    },
    {
      question: "bills included なのに追加で請求されました。払う必要がありますか。",
      answer:
        "契約書に使用量の上限（fair usage）の条項があれば、超えた分の請求は契約上認められます。ただし大家が実際に払った額を超えて請求することは Ofgem の規則で認められていないので、元の請求書を見せてもらってください。上限の条項がないのに請求された場合は、契約書を根拠に支払いを拒めます。",
    },
    {
      question: `Council Tax は bills に含まれますか。`,
      answer: `含まれないことが多い項目です。額が大きいので必ず個別に確認してください。なお部屋ごとに別々の契約で貸すシェアハウスでは大家が納税義務者で、家賃に含まれているのが普通です。ロンドン平均の Band D は年${gbp(
        COUNCIL_TAX.londonBandD
      )}です。`,
    },
  ],
  sources: [...BILLS_SOURCES.billsIncluded],
  relatedLinks: [
    { href: "/housing/spareroom", label: "SpareRoom でフラットシェアを探す" },
    { href: "/housing/viewing", label: "内見チェックリスト" },
    { href: "/housing/deposits-and-fees", label: "初期費用と、払ってはいけない金" },
    { href: "/bills/council-tax", label: "Council Tax とは（払う人・金額・割引）" },
  ],
};

export default billsIncluded;
