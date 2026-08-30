import type { HealthGuideArticle } from "../types";
import {
  HEALTH_AS_OF,
  HEALTH_CHARGE_REVISION,
  HEALTH_SOURCES,
  HEALTH_UPDATED_AT,
  NHS_CHARGES,
  NHS_CONTACTS,
  gbp,
  ppc12MonthsSaving,
} from "@/lib/health/rates";

const prescriptionCosts: HealthGuideArticle = {
  slug: "prescription-costs",
  title: `イギリスの処方箋料を下げる方法｜1品目${gbp(
    NHS_CHARGES.prescriptionItem
  )}を頭打ちにする`,
  engTitle: "Cutting NHS Prescription Costs with a PPC",
  audience: "薬局で請求された金額が思ったより高かった人",
  summary: `イングランドの処方箋は1品目 ${gbp(
    NHS_CHARGES.prescriptionItem
  )}。「1回」ではなく「1品目」なので、3種類出れば3倍です。年に${
    NHS_CHARGES.ppc12MonthsBreakEvenItems
  }品目を超えるなら、前払い証（PPC）で年${gbp(
    NHS_CHARGES.ppc12Months
  )}に頭打ちにできます。そして無料になる条件も、思っているより広い。`,
  description:
    "イギリス（イングランド）の処方箋自己負担を下げる方法を解説。1品目あたりの金額、PPC（前払い証）3ヶ月・12ヶ月の損益分岐、処方箋が無料になる条件、スコットランドやウェールズとの違いまで。",
  keywords: [
    "イギリス 処方箋 料金",
    "NHS 処方箋 いくら",
    "PPC 処方箋",
    "prescription prepayment certificate",
    "イギリス 薬代",
    "処方箋 無料 イギリス",
  ],
  dataAsOf: HEALTH_AS_OF,
  updatedAt: HEALTH_UPDATED_AT,
  atAGlance: [
    { label: "1品目あたり", value: `${gbp(NHS_CHARGES.prescriptionItem)}（イングランド）` },
    {
      label: "PPC 3ヶ月",
      value: `${gbp(NHS_CHARGES.ppc3Months)}／${
        NHS_CHARGES.ppc3MonthsBreakEvenItems
      }品目以上で得`,
    },
    {
      label: "PPC 12ヶ月",
      value: `${gbp(NHS_CHARGES.ppc12Months)}／${
        NHS_CHARGES.ppc12MonthsBreakEvenItems
      }品目以上で得`,
    },
    { label: "改定時期", value: HEALTH_CHARGE_REVISION },
    { label: "スコットランド等", value: "処方箋は全面的に無料" },
    { label: "電話窓口", value: NHS_CONTACTS.ppcPhone },
  ],
  mainText: `英国の医療は診察が無料である一方、処方箋には定額の自己負担があります。イングランドでは **1品目 ${gbp(
    NHS_CHARGES.prescriptionItem
  )}**。

ここで最初につまずくのが、これが「処方箋1枚あたり」ではなく **「薬1品目あたり」** だという点です。GP が3種類の薬を出せば ${gbp(
    NHS_CHARGES.prescriptionItem * 3
  )}。薬局の窓口で提示された金額に驚くのは、たいていこの誤解が原因です。

ただし、この負担には **上限を設ける仕組み** が用意されています。PPC（前払い証）です。年に${
    NHS_CHARGES.ppc12MonthsBreakEvenItems
  }品目を超える人なら、確実に得をします。

そして、そもそも **無料になる条件** も日本語圏ではあまり知られていません。順に見ていきます。`,
  sections: [
    {
      id: "how-charging-works",
      navLabel: "課金の仕組み",
      title: "課金の仕組み",
      subtitle: "「1回」ではなく「1品目」",
      body: `処方された薬の **品目数 × ${gbp(
        NHS_CHARGES.prescriptionItem
      )}** が窓口での支払額です。

| 処方内容 | 支払額 |
|---|---|
| 抗生物質のみ | ${gbp(NHS_CHARGES.prescriptionItem)} |
| 抗生物質＋鎮痛剤 | ${gbp(NHS_CHARGES.prescriptionItem * 2)} |
| 血圧薬＋コレステロール薬＋胃薬 | ${gbp(NHS_CHARGES.prescriptionItem * 3)} |

薬の種類や実際の薬価は関係ありません。**安い薬でも高価な薬でも同額**です。月に£300する薬でも ${gbp(
        NHS_CHARGES.prescriptionItem
      )}、£2の薬でも ${gbp(NHS_CHARGES.prescriptionItem)}。

つまり高価な薬を常用している人ほど、この制度の恩恵は大きくなります。

### 市販薬のほうが安いことがある

逆に、安い薬では **薬局で普通に買ったほうが安い** ケースが生じます。パラセタモールは市販だと数十ペンスで買えるので、処方箋で ${gbp(
        NHS_CHARGES.prescriptionItem
      )} 払うのは損です。

処方された品目の中に市販で安く買えるものが混じっていたら、薬局で「これは市販で買います」と伝えて構いません。薬剤師も普通にそう案内してくれます。

### 改定時期

患者負担額は ${HEALTH_CHARGE_REVISION} に改定されます。${gbp(
        NHS_CHARGES.prescriptionItem
      )} という金額は2025年・2026年と2年連続で据え置かれましたが、これは政治判断による例外で、恒久的なものではありません。`,
      tips: [
        "薬局で金額を提示されたら、品目数を確認する。市販で安く買える品目が混じっていることがある。",
        "高価な薬ほど定額制の恩恵は大きい。薬価と自己負担額は無関係。",
        "毎年4月に改定される。年度替わりに金額が変わっていないか確認する。",
      ],
    },
    {
      id: "ppc",
      navLabel: "PPC",
      title: "PPC（前払い証）で頭打ちにする",
      subtitle: "常用薬があるなら、ほぼ確実に得",
      body: `**Prescription Prepayment Certificate（PPC）** は、期間中の処方箋が何品目でも定額になる前払い証です。

| 種類 | 金額 | 損益分岐 |
|---|---|---|
| 3ヶ月 | ${gbp(NHS_CHARGES.ppc3Months)} | ${
        NHS_CHARGES.ppc3MonthsBreakEvenItems
      }品目以上で得 |
| 12ヶ月 | ${gbp(NHS_CHARGES.ppc12Months)} | ${
        NHS_CHARGES.ppc12MonthsBreakEvenItems
      }品目以上で得 |

12ヶ月版は **10回の分割払い（Direct Debit）** にもできます。一括で払えない場合でも使えます。

### 具体的にいくら得か

毎月1品目を受け取る人（年12品目）なら、通常 ${gbp(
        NHS_CHARGES.prescriptionItem * 12
      )}。PPC なら ${gbp(NHS_CHARGES.ppc12Months)} なので、ほぼ同額です。

毎月2品目なら年24品目で ${gbp(NHS_CHARGES.prescriptionItem * 24)}。PPC との差は **${gbp(
        ppc12MonthsSaving(24)
      )}** の節約になります。

毎月3品目なら年36品目で ${gbp(NHS_CHARGES.prescriptionItem * 36)}。差額は **${gbp(
        ppc12MonthsSaving(36)
      )}**。

**常用薬が2種類以上ある時点で、PPC を買わない理由はありません。**

### 買い方

- オンライン（最も速い。即日から有効にできます）
- 電話 ${NHS_CONTACTS.ppcPhone}
- 一部の薬局の窓口

購入時に開始日を指定できます。**過去に遡って適用することも可能**（申請から一定期間内）なので、最近まとめて払った覚えがある人は確認する価値があります。

### 注意

PPC はイングランドでのみ意味を持ちます。スコットランド・ウェールズ・北アイルランドは処方箋が無料なので、そもそも不要です。`,
      callout: {
        tone: "tip",
        title: "HRT を使っている人には専用の PPC があります",
        body: "更年期障害のホルモン補充療法（HRT）については、通常の PPC とは別の専用証明書があり、年間で1回分の処方箋料程度の負担で済みます。対象の薬を継続している場合、通常の PPC より圧倒的に安くなります。GP か薬剤師に確認してください。",
      },
    },
    {
      id: "free-prescriptions",
      navLabel: "無料になる条件",
      title: "無料になる条件",
      subtitle: "思っているより範囲が広い",
      body: `以下に該当する人は、処方箋料が **全額無料** です。PPC も必要ありません。

### 年齢

- 16歳未満
- 16〜18歳で全日制の教育を受けている
- 60歳以上

### 状態

- **妊娠中、または過去12ヶ月以内に出産した**（要 maternity exemption certificate）
- 特定の慢性疾患がある（糖尿病、甲状腺機能低下症、てんかん、がんの治療中など。要 medical exemption certificate）
- 継続的な身体障害により外出が困難

### 所得・給付

- Universal Credit を受給していて一定の所得要件を満たす
- Income Support、Pension Credit などの受給者
- NHS Low Income Scheme（HC2証明書）の対象

### 学生・低所得者は確認する価値がある

**NHS Low Income Scheme** は見落とされがちです。所得と貯蓄が一定以下であれば、処方箋・歯科・眼科の費用が全額または一部免除されます。留学生も対象になり得ます。

HC1 という申請書を提出すると、全額免除の HC2 か一部免除の HC3 が発行されます。学生で収入が限られている人は、一度計算してみる価値があります。

### 免除証明書は必ず取得する

妊娠中や対象の慢性疾患があっても、**証明書を持っていないと窓口では請求されます**。GP に申請書をもらって手続きしてください。自動では発行されません。`,
      tips: [
        "妊娠したら maternity exemption certificate を GP で申請する。出産後12ヶ月まで有効。",
        "糖尿病や甲状腺疾患などは medical exemption certificate の対象。該当するなら必ず申請する。",
        "留学生でも NHS Low Income Scheme の対象になり得る。HC1 で申請できる。",
      ],
      callout: {
        tone: "warn",
        title: "免除の虚偽申告には罰金があります",
        body: "窓口で「免除対象です」と申告して薬を受け取ると、後日 NHSBSA が資格を照合します。対象でなかった場合、処方箋料に加えて最大£100の追加負担が課されます。悪意がなくても対象になるため、**自分が免除に該当するか不確かなときは、正直に払うか、事前に確認してください**。",
      },
    },
    {
      id: "nations",
      navLabel: "イングランド以外",
      title: "イングランド以外は無料",
      subtitle: "同じ英国でも制度が違う",
      body: `処方箋料は英国全体で統一されていません。

| 地域 | 処方箋料 |
|---|---|
| イングランド | ${gbp(NHS_CHARGES.prescriptionItem)}／品目 |
| スコットランド | 無料 |
| ウェールズ | 無料 |
| 北アイルランド | 無料 |

**イングランドだけが有料**です。この差は政治的な選択の結果で、他の3地域は自治政府の判断で自己負担を廃止しています。

### 判定されるのは「どこで受け取るか」ではない

登録している GP がどこにあるかで決まります。イングランドの GP に登録している人は、スコットランドの薬局で受け取っても支払いが必要です。

逆にスコットランドの GP に登録していれば、イングランドで受け取る場合も無料になる扱いがあります（薬局によっては説明が必要になります）。

旅行のついでに無料の地域で薬をもらう、という抜け道は成立しません。

### 引っ越したら変わる

エディンバラやカーディフに引っ越して現地の GP に登録すれば、その時点から処方箋は無料になります。ロンドンから移る人にとっては、地味に効く生活費の差です。`,
      tips: [
        "処方箋料の有無は、登録している GP の所在地で決まる。受け取る薬局の場所ではない。",
        "スコットランド・ウェールズ・北アイルランドに引っ越すと処方箋は無料になる。",
      ],
    },
  ],
  faq: [
    {
      question: `処方箋料の ${gbp(NHS_CHARGES.prescriptionItem)} は1回分ですか。`,
      answer: `薬1品目あたりの金額です。3種類の薬が処方されれば ${gbp(
        NHS_CHARGES.prescriptionItem * 3
      )} かかります。薬の実際の価格や種類には関係なく、品目数だけで決まります。`,
    },
    {
      question: "PPC はどのくらいの薬をもらう人が買うべきですか。",
      answer: `12ヶ月の PPC は年${
        NHS_CHARGES.ppc12MonthsBreakEvenItems
      }品目、3ヶ月の PPC は3ヶ月で${
        NHS_CHARGES.ppc3MonthsBreakEvenItems
      }品目を超えると元が取れます。常用薬が2種類以上ある人はほぼ確実に得をします。`,
    },
    {
      question: "PPC は旅行者でも買えますか。",
      answer:
        "購入自体は可能ですが、そもそも短期の旅行者が処方箋を継続的に受け取る場面は限られます。IHS を払っていない短期滞在者は、処方薬を受け取る前提の医療アクセス自体が制限されるため、海外旅行保険で対応するのが一般的です。",
    },
    {
      question: "妊娠中の処方箋が有料と言われました。",
      answer:
        "maternity exemption certificate（MatEx）を取得していない可能性があります。妊娠の確認後、GP か助産師に申請書をもらって手続きしてください。証明書がないと窓口では通常どおり請求されます。出産後12ヶ月まで有効です。",
    },
    {
      question: "スコットランドで薬をもらえば無料になりますか。",
      answer:
        "なりません。判定は登録している GP の所在地によります。イングランドの GP に登録している限り、どこの薬局で受け取っても自己負担が発生します。",
    },
  ],
  sources: [...HEALTH_SOURCES],
  relatedLinks: [
    {
      href: "/health/pharmacy-and-prescriptions",
      label: "薬局で買う・処方箋を受け取る",
    },
    { href: "/health/ihs-and-entitlement", label: "IHS と、自分がどこまで無料か" },
    { href: "/food", label: "食費を抑えるコツ" },
  ],
};

export default prescriptionCosts;
