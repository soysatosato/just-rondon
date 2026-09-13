import type { BillsGuideArticle } from "../types";
import {
  BILLS_AS_OF,
  BILLS_SOURCES,
  BILLS_UPDATED_AT,
  ELECTRICITY_TO_GAS_UNIT_RATIO,
  ELECTRICITY_VAT_CUT,
  ENERGY_CAP,
  ENERGY_COMPLAINT_WEEKS,
  ENERGY_STANDING_PER_MONTH,
  WARM_HOME_DISCOUNT,
  gbp,
  monthlyEnergyCost,
  standingChargePerMonth,
} from "@/lib/bills/rates";

const { electricity, gas } = ENERGY_CAP;

const elecStandingMonth = standingChargePerMonth(electricity.standingPence);
const gasStandingMonth = standingChargePerMonth(gas.standingPence);

/*
  計算例の使用量は「ロンドンの1〜2人暮らしのフラット、ガス暖房」を想定した仮定。
  実測値ではないので、本文でも仮定だと明記している。単価は rates.ts から引く。
*/
const EXAMPLE = {
  summer: { electricityKwh: 150, gasKwh: 150 },
  winter: { electricityKwh: 180, gasKwh: 700 },
} as const;
const summer = monthlyEnergyCost(EXAMPLE.summer);
const winter = monthlyEnergyCost(EXAMPLE.winter);

const energy: BillsGuideArticle = {
  slug: "energy",
  title: "イギリスのガス・電気代｜入居日にやることと、price cap の本当の意味",
  engTitle: "Gas and Electricity When You Move In",
  audience:
    "入居したが、ガスと電気をどこと契約すればいいのか、毎月いくらかかるのか分からない人",
  summary: `入居した時点で、ガスと電気の契約はもう始まっています。最初にやるのは会社探しではなく、メーターの数値を撮ること。料金上限（price cap）は請求額ではなく単価の上限で、使っていなくても基本料金だけで毎月約${gbp(
    Math.round(ENERGY_STANDING_PER_MONTH * 100) / 100
  )}かかります。`,
  description: `イギリスのガス・電気代の仕組みを入居者向けに解説。入居日のメーター読み、今の供給会社の調べ方、price cap（${ENERGY_CAP.period}：電気 ${electricity.unitPence}p/kWh・ガス ${gas.unitPence}p/kWh）の本当の意味、基本料金、暖房方式による冬の差、支払い方法の選び方、困ったときの窓口まで。`,
  keywords: [
    "イギリス 光熱費",
    "イギリス ガス 電気 契約",
    "price cap とは",
    "イギリス 電気代 相場",
    "standing charge",
    "イギリス 引っ越し メーター",
    "ロンドン 光熱費 月",
  ],
  dataAsOf: BILLS_AS_OF,
  updatedAt: BILLS_UPDATED_AT,
  atAGlance: [
    {
      label: "入居時の契約",
      value: "**すでにある**。前の住人と同じ会社の標準料金（deemed contract）",
    },
    {
      label: "最初にやること",
      value: "ガスと電気のメーターを**入居日に撮影**し、会社に数値を伝える",
    },
    {
      label: `電気（${ENERGY_CAP.period}）`,
      value: `${electricity.unitPence}p/kWh ＋ 基本料金 ${electricity.standingPence}p/日`,
    },
    {
      label: `ガス（${ENERGY_CAP.period}）`,
      value: `${gas.unitPence}p/kWh ＋ 基本料金 ${gas.standingPence}p/日`,
    },
    {
      label: "基本料金だけで",
      value: `月約${gbp(Math.round(ENERGY_STANDING_PER_MONTH * 100) / 100)}（電気${gbp(
        Math.round(elecStandingMonth * 100) / 100
      )}＋ガス${gbp(Math.round(gasStandingMonth * 100) / 100)}）。使わなくても発生`,
    },
    {
      label: "電気の VAT",
      value: `${ELECTRICITY_VAT_CUT.from}〜${ELECTRICITY_VAT_CUT.until}は0%。手続き不要`,
    },
  ],
  mainText: `日本では、入居したら電力会社とガス会社に「使用開始」を申し込むのが普通です。イギリスでは順番が逆です。

**入居した時点で、その家のガスと電気はすでに誰かが供給していて、使った分は自動的にあなたの契約になります。** 前の住人が契約していた会社の標準料金（standard variable tariff）です。

だから入居日にやるべきことは、会社を選ぶことではありません。

1. **メーターの数値を撮影する**
2. **今の供給会社を調べて、入居日と数値を伝える**
3. 落ち着いてから、必要なら **支払い方法や会社を見直す**

この順番を守れば、前の住人が使った分を払わされることはありません。`,
  sections: [
    {
      id: "move-in-day",
      title: "入居日にメーターを撮る",
      navLabel: "入居日",
      subtitle: "これだけで前の住人の使用分と切り離せる",
      body: `ガスと電気の請求は、**メーターの数値の差** で計算されます。入居日の数値が分からないと、前の住人が最後に伝えた数値からの使用分がすべてあなたに請求されかねません。

### メーターの場所

- **フラット**：玄関横の収納、共用廊下のメーター室、キッチンの戸棚の中が多い
- **一軒家**：玄関の外の箱、階段下、地下の収納

見つからなければ大家か管理会社に聞いてください。建物の共用メーター室は鍵がかかっていることがあります。

### 撮るもの

- **数値全体**（小数点以下の赤い桁は不要）
- **メーターのシリアル番号**（同じ部屋に複数あるとき、どれが自分のか証明するため）
- 電気のメーターに数値が **2段** あるなら両方（昼夜で単価の違う Economy 7 という料金の家）

写真には撮影日時が残るので、そのまま証拠になります。**退去日にも同じことをしてください。**

### メーターの種類

| 種類 | 見分け方 | 注意 |
|---|---|---|
| 通常のメーター | 数字が並ぶだけ | 定期的に自分で数値を送る |
| スマートメーター | 液晶の表示、会社に自動送信 | 前の住人の会社のままなら、そのまま使える |
| プリペイドメーター | 鍵（key）やカードを差し込む | 事前にチャージした分しか使えない |

### プリペイドメーターの家だったら

鍵やカードが残っていれば、それを使ってチャージします。前の住人の **未払いの借金がメーターに残っていることがあります** が、それはあなたの借金ではありません。会社に入居日を伝え、切り離してもらってください。`,
      tips: [
        "撮影は入居したその日に。数日遅れると、その間の使用分をめぐって揉める余地が出る。",
        "シェアハウスで各部屋にメーターがあるときは、自分の部屋のシリアル番号を控えておく。",
        "退去日にも同じ写真を撮る。最終請求の根拠になる。",
      ],
    },
    {
      id: "find-supplier",
      title: "今の供給会社を調べて、入居を伝える",
      navLabel: "会社の調べ方",
      subtitle: "大家に聞くのが早いが、分からなくても調べられる",
      body: `まずは大家か管理会社に「ガスと電気の供給会社はどこか」を聞いてください。知っていることが多いです。

分からない場合は、自分で調べられます。

### ガス

- **Find My Supplier**（findmysupplier.energy）で郵便番号から検索する
- メーターの番号（MPRN）もここで分かる

### 電気

- **Energy Networks Association** のサイトで郵便番号から地域の配電会社を調べ、その会社に供給会社を問い合わせる

### 会社に伝えること

- 入居日
- 入居日のメーターの数値
- 自分の名前と連絡先、支払い方法

これで口座（account）があなたの名前で作られ、以後の請求が届くようになります。

### 最初の契約は割高なことがある

入居時に自動で乗る **標準料金（standard variable tariff）** は、ほとんどの会社で price cap の上限いっぱいの単価に設定されています。それ自体は違法でも不当でもありませんが、会社によっては固定料金のほうが安い時期もあります。

標準料金には **解約手数料がない** ので、落ち着いてから見直せば足ります。急いで乗り換える必要はありません。`,
      callout: {
        tone: "info",
        title: "大家が契約している物件もある",
        body: "bills included の物件や、大家が建物全体で契約しているフラットでは、自分で供給会社と契約しません。この場合は会社を変えられず、使用量の上限（fair usage）が設けられていることがあります。契約書の光熱費の条項を確認してください。",
      },
    },
    {
      id: "price-cap",
      title: "price cap は「請求額の上限」ではない",
      navLabel: "price cap",
      subtitle: `${ENERGY_CAP.period}の単価`,
      body: `ニュースで「price cap（料金上限）が年${gbp(
        ENERGY_CAP.typicalAnnual
      )}に」と報じられると、請求がそれ以上にならないように聞こえます。**そうではありません。**

Ofgem（エネルギー規制機関）が上限をかけているのは、次の2つです。

- **単価**（1kWh あたりいくら）
- **基本料金**（standing charge、1日あたりいくら）

使えば使うほど、請求は青天井で増えます。年${gbp(
        ENERGY_CAP.typicalAnnual
      )}という数字は、Ofgem が定めた「典型的な使用量」の世帯で計算した参考値にすぎません。

### ${ENERGY_CAP.period}の上限（Direct Debit 払い・平均）

| | 単価 | 基本料金（1日） | 基本料金（月換算） |
|---|---|---|---|
| 電気 | ${electricity.unitPence}p/kWh | ${electricity.standingPence}p | 約${gbp(
        Math.round(elecStandingMonth * 100) / 100
      )} |
| ガス | ${gas.unitPence}p/kWh | ${gas.standingPence}p | 約${gbp(
        Math.round(gasStandingMonth * 100) / 100
      )} |

- 典型的な世帯の年額は${gbp(ENERGY_CAP.typicalAnnual)}で、前の期間（${gbp(
        ENERGY_CAP.previousTypicalAnnual
      )}）から${ENERGY_CAP.changePercent}%上がりました
- 単価は地域と支払い方法で少しずつ違います。上の表は全国平均です
- 次の改定は **${ENERGY_CAP.nextChange}** です。3か月ごとに変わります

### 基本料金は使わなくても発生する

基本料金は **使用量ゼロでも毎日** かかります。ガスと電気の両方があれば、それだけで月約${gbp(
        Math.round(ENERGY_STANDING_PER_MONTH * 100) / 100
      )}です。長期の一時帰国で家を空けても、この分は請求されます。

### 電気の VAT は時限的に0%

${ELECTRICITY_VAT_CUT.from}から${ELECTRICITY_VAT_CUT.until}まで、家庭の電気代にかかる VAT（付加価値税）が${ELECTRICITY_VAT_CUT.previousRatePercent}%から0%になっています。上の電気の単価はこれを反映した額で、典型的な世帯で年${gbp(
        ELECTRICITY_VAT_CUT.typicalSaving
      )}ほど安くなる計算です。**手続きは要りません。** 固定料金の契約にも自動で適用されます。ガスには引き続き VAT ${
        ELECTRICITY_VAT_CUT.previousRatePercent
      }%がかかります。`,
    },
    {
      id: "monthly-cost",
      title: "毎月いくらになるか",
      navLabel: "月の目安",
      subtitle: "夏と冬で2倍近く変わる",
      body: `請求額は **基本料金 ＋ 使用量 × 単価** で決まります。使用量は家の広さ・断熱・暖房方式・在宅時間でまったく違うので、ここでは仮定を置いた計算例を示します。

### 計算例（ロンドンの小さなフラット、ガス暖房と仮定）

| | 電気の使用量 | ガスの使用量 | 月額の目安 |
|---|---|---|---|
| 夏 | ${EXAMPLE.summer.electricityKwh}kWh | ${EXAMPLE.summer.gasKwh}kWh（給湯だけ） | 約${gbp(
        Math.round(summer.total)
      )} |
| 冬 | ${EXAMPLE.winter.electricityKwh}kWh | ${EXAMPLE.winter.gasKwh}kWh（暖房＋給湯） | 約${gbp(
        Math.round(winter.total)
      )} |

使用量は **仮定** です。実際の数字に近づけるには、次の2つが役に立ちます。

- **EPC（エネルギー性能証明書）**：GOV.UK の Find an energy certificate で住所を検索すると、その物件の推定年間光熱費が載っている
- **前の住人の請求額**：大家や同居人に、冬の実績を聞く

### Direct Debit は「毎月定額」になる

Direct Debit を選ぶと、会社は **年間の使用量を見積もって、毎月同じ額** を引き落とします。夏は使用量より多く払い、その貯金（credit）を冬に使う仕組みです。

- 夏のあいだに残高がプラスに積み上がるのは正常です
- 見積もりは定期的に見直されます。**数値を定期的に送らないと、見積もりが実際とずれていきます**
- 残高が大きく積み上がりすぎたら、返金を求められます`,
      tips: [
        "数値は月に一度、アプリから送る。見積もりのままだと、冬に大きな不足額の請求が来ることがある。",
        "EPC は内見前でも調べられる。同じ家賃なら、推定光熱費の低い物件のほうが実質は安い。",
      ],
    },
    {
      id: "heating",
      title: "暖房方式で、冬の請求が決まる",
      navLabel: "暖房方式",
      subtitle: `電気の単価はガスの約${ELECTRICITY_TO_GAS_UNIT_RATIO.toFixed(1)}倍`,
      body: `イギリスの家の暖房は、大きく **ガス** と **電気** に分かれます。そして今の単価では、**電気は同じ熱量でガスの約${ELECTRICITY_TO_GAS_UNIT_RATIO.toFixed(
        1
      )}倍** 高くつきます。

### ガス暖房（gas central heating）

ボイラーでお湯を沸かし、各部屋のラジエーターに回す方式です。ロンドンの住宅で最も一般的で、ランニングコストは低めです。

### 電気暖房

- **storage heater（蓄熱暖房）**：夜間の安い電気で熱を貯め、昼に放出する。Economy 7 などの昼夜別料金と組み合わせる前提。料金プランが合っていないと非常に高くつく
- **panel heater / 電気ヒーター**：スイッチを入れた分だけ電気を使う。最も高い

フラット、特に古い建物や一部の新築では電気暖房のことがあります。**電気暖房の家は、家賃が安くても冬の総額で逆転することがあります。**

### 暖房を効かせる基本

- ボイラーのタイマーと、ラジエーターごとのつまみ（TRV）の使い方を入居時に大家に聞く
- 窓の結露とカビは、換気不足と暖房不足の両方が原因。断熱の悪い家ほど、少しずつ暖め続けるほうが結露しにくい

内見の段階で見るべき点は[内見チェックリスト](/housing/viewing)にまとめています。`,
    },
    {
      id: "paying-and-help",
      title: "支払い方法と、困ったときの窓口",
      navLabel: "支払いと相談先",
      subtitle: "Direct Debit が最も安く、苦情には期限がある",
      body: `### 支払い方法

- **Direct Debit（口座引き落とし）**：最も一般的。上の表の単価はこの払い方のもの
- **Standard credit（請求後に支払う）**：届いた請求を都度払う。単価が少し高い
- **Prepayment（プリペイド）**：チャージした分だけ使う。使いすぎは防げるが、残高が切れると止まる

### 固定料金（fixed tariff）に乗り換えるか

固定料金は、契約期間中の単価が変わりません。price cap が上がる局面では得になり、下がる局面では損になります。

- **解約手数料（exit fee）** があるかを確認する
- 短期滞在で途中解約の可能性があるなら、手数料のない標準料金のままでも構わない

### 支援制度

- **Warm Home Discount**：冬の電気代から${gbp(WARM_HOME_DISCOUNT.amount)}が差し引かれる制度。ただし対象は資力調査のある給付を受けている世帯なので、**ビザで滞在している人の多くは対象外** です
- **Priority Services Register**：障害や持病、医療機器を使うなどの事情がある人が、無料で登録できる。停電時の優先連絡などを受けられる

### 請求がおかしい・払えないとき

1. まず **供給会社に連絡** する。払えない場合は支払い計画に応じる義務がある
2. 解決しないまま **${ENERGY_COMPLAINT_WEEKS}週間** 経つか、会社が「これ以上対応しない」と回答したら、**Energy Ombudsman**（無料の第三者機関）に持ち込める
3. 何から手をつければいいか分からなければ、**Citizens Advice** に相談する（無料）`,
      callout: {
        tone: "warn",
        title: "「電気代が安くなる」訪問・電話勧誘に注意",
        body: "供給会社を名乗って口座情報を聞き出す電話や、「政府の補助金を受け取るため」と手数料を求めるメッセージがあります。本物の VAT の引き下げや Warm Home Discount は、手続きも手数料も不要か、会社からの正式な通知で届きます。怪しければ切って、請求書に書かれた番号にかけ直してください。",
      },
    },
  ],
  faq: [
    {
      question: "入居したら、ガスと電気の契約を申し込む必要がありますか。",
      answer:
        "申し込まなくても、入居した時点で前の住人と同じ会社の標準料金で供給が続いています。やるべきことは、入居日のメーターの数値を撮影し、その会社に入居日と数値を伝えて自分の名前の口座にすることです。会社の見直しは、落ち着いてからで構いません。",
    },
    {
      question: "price cap があるのに、なぜ請求が高いのですか。",
      answer: `price cap は請求額ではなく、1kWh あたりの単価と1日あたりの基本料金の上限だからです。使った分だけ請求は増えます。報じられる年${gbp(
        ENERGY_CAP.typicalAnnual
      )}という数字は、典型的な使用量の世帯で計算した参考値です。`,
    },
    {
      question: "ロンドンの光熱費は月いくらくらいですか。",
      answer: `家の広さ・断熱・暖房方式で大きく違います。ガス暖房の小さなフラットを仮定すると、${ENERGY_CAP.period}の単価で夏は月約${gbp(
        Math.round(summer.total)
      )}、冬は月約${gbp(
        Math.round(winter.total)
      )}が一つの目安です。物件の EPC に載っている推定年間光熱費を見ると、その家に近い数字が分かります。`,
    },
    {
      question: "前の住人の未払い分を払う必要がありますか。",
      answer:
        "ありません。入居日の数値を会社に伝えれば、それ以前の使用分は前の住人の請求になります。プリペイドメーターに前の住人の借金が残っていた場合も、会社に連絡して切り離してもらってください。",
    },
    {
      question: "一時帰国で家を空けても料金はかかりますか。",
      answer: `基本料金は使用量ゼロでも毎日かかります。ガスと電気の両方なら、${ENERGY_CAP.period}の単価で月約${gbp(
        Math.round(ENERGY_STANDING_PER_MONTH * 100) / 100
      )}です。`,
    },
  ],
  sources: [...BILLS_SOURCES.energy],
  relatedLinks: [
    { href: "/housing/viewing", label: "内見チェックリスト（暖房方式と冬の光熱費）" },
    { href: "/housing/moving-out", label: "退去とデポジット返還交渉" },
    { href: "/bills/water", label: "水道（Thames Water と請求の決まり方）" },
    { href: "/trouble/scams", label: "詐欺の手口と対処" },
  ],
};

export default energy;
