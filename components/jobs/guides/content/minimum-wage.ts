import type { JobGuideArticle } from "../types";
import {
  JOBS_AS_OF,
  JOBS_UPDATED_AT,
  MINIMUM_WAGE_PENALTY,
  WAGE_BANDS,
  WAGE_RATES_EFFECTIVE_FROM,
  gbp,
  hourlyGbp,
} from "@/lib/jobs/rates";

const minimumWage: JobGuideArticle = {
  slug: "minimum-wage",
  dataAsOf: JOBS_AS_OF,
  updatedAt: JOBS_UPDATED_AT,
  title: "英国の最低賃金と給与明細の見方｜National Living Wageと不当な天引き",
  engTitle: "UK National Living Wage & How to Read Your Payslip",
  summary:
    "ロンドンで働く日本人向けに、National Living Wage / National Minimum Wageの最新レート、給与明細（payslip）で確認すべき項目、そして違法な天引きの見分け方と対処法をまとめました。",
  description:
    "英国のNational Living Wage・National Minimum Wageの最新レート（2026年4月〜）、給与明細のチェック方法、サービスチャージと最低賃金の関係、不当な天引きへの対処法をわかりやすく解説。",
  keywords: [
    "英国 最低賃金",
    "National Living Wage",
    "National Minimum Wage",
    "給与明細 イギリス",
    "payslip 見方",
    "最低賃金 違反",
    "HMRC 通報",
  ],
  mainText: `多くの日本人がロンドンでアルバイトや正社員として働き始める際、最初につまずきやすいのが「自分の時給・給料が法律どおりかどうか」の確認です。英国には日本の最低賃金にあたる法定制度があり、雇用形態や国籍に関係なく、英国内で働くほぼすべての労働者に適用されます。

この記事では、最新の法定レート、給与明細で確認すべきポイント、そして「サービスチャージは最低賃金に含まれるのか」といった実務上よくある疑問を整理します。`,
  sections: [
    {
      title: "法定最低賃金の種類とレート",
      body: `英国の法定最低賃金は年齢とステータスによって区分されており、毎年4月1日に改定されます。${WAGE_RATES_EFFECTIVE_FROM}からの適用レートは以下のとおりです（Low Pay Commissionの勧告にもとづき政府が決定）。

| 区分 | 対象 | 時給 |
| --- | --- | --- |
${WAGE_BANDS.map(
  (band) =>
    `| ${band.name} | ${band.appliesTo} | ${hourlyGbp(band.hourlyRate)} |`,
).join("\n")}

**ポイント**

- 学生ビザやYouth Mobility（旧Tier 5）ビザで働く場合も、年齢区分がそのまま適用されます。ビザの種類による最低賃金の差はありません。
- レートは毎年4月に改定されるため、「去年聞いた時給」が今も正しいとは限りません。最新レートは必ずgov.ukで確認してください。
- 見習い（apprentice）レートが適用されるのは、Apprenticeshipの1年目、または19歳以上でApprenticeshipの2年目以降ではない場合のみです。条件に該当しなければ通常の年齢区分のレートが適用されます。`,
    },
    {
      title: "サービスチャージ・チップは最低賃金に含まれない",
      body: `レストランやホテルで働く場合に特に誤解されやすいのが、チップやサービスチャージの扱いです。

**チップ・サービスチャージは、時給計算上の最低賃金には一切カウントできません。** これは2009年10月以降の法律で明確に定められており、Employment (Allocation of Tips) Act 2023（Tipping Act）が施行された現在も変わっていません。

つまり、「基本時給＋チップ分配で最低賃金を満たしている」という説明は法律上成り立ちません。基本時給そのものが、その年齢区分の最低賃金以上でなければ違法です。

チップ・サービスチャージ制度そのものについては、[サービスチャージ完全ガイド](/jobs/service-charges)で詳しく解説しています。`,
    },
    {
      title: "給与明細（payslip）で確認すべき項目",
      body: `給与明細を受け取る権利（itemised pay statement）は、雇用開始日から適用されるday oneの権利です（Employment Rights Act 1996 第8条）。毎回の給与明細には、少なくとも以下が明記されている必要があります。

1. **総支給額（gross pay）**
2. **天引き（deductions）の内訳と金額**（税金・National Insuranceなど法定のもの、それ以外のもの）
3. **差引支給額（net pay）**
4. **勤務時間に応じて支払われる場合は、その勤務時間数**

自分の給与明細をチェックする手順の目安:

- 総支給額 ÷ 実労働時間 が、自分の年齢区分の最低賃金以上になっているか計算する
- 「training fee」「uniform charge」「breakage（食器破損などの罰金）」といった名目の天引きがないか確認する
- 天引き後の実質時給が最低賃金を下回っていないか確認する（天引きが合法かどうかに関わらず、天引き後の金額が最低賃金を下回れば違法となるケースがあります）`,
    },
    {
      title: "違法になりやすい天引き・支払いパターン",
      body: `以下のようなケースは、最低賃金法違反の可能性が高いパターンとしてよく報告されています。

- **無給のトライアルシフト（unpaid trial shift）**：実質的に通常業務をこなしているのに「研修」「トライアル」を理由に賃金を支払わない
- **制服・道具の自己負担による天引き**：制服代を給与から天引きした結果、実質時給が最低賃金を下回る
- **レジ不足・破損の罰金天引き**：レジの現金不足や食器破損を理由に給与から天引きし、結果的に最低賃金を下回る
- **「現金払い」による過少支給**：現金払いを理由に、契約上の時給より低い額しか渡さない
- **サービス料込みの時給提示**：時給そのものにチップ分を上乗せして説明し、最低賃金を満たしているように見せかける

これらはいずれも、天引きや支払い方法の形式にかかわらず、**結果として実質時給が法定最低賃金を下回れば違法**という点が共通しています。`,
    },
    {
      title: "違反を見つけたときの相談先と手順",
      body: `最低賃金の未払いは、National Insurance番号やビザのステータスに関係なく、誰でも相談・請求できます。

1. **自分で計算する**：gov.ukの最低賃金計算ツール（National Minimum Wage calculator）を使い、実際の未払い額を試算します。
2. **Acasに相談する**：0300 123 1100（英語）で無料相談ができます。通訳が必要な場合はその旨を伝えると対応してもらえることがあります。
3. **HMRCに通報する**：最低賃金の執行はHMRC（歳入関税庁）が担当しています。ACASのPay and Work Rights Helplineを通じて、匿名での通報が可能です。雇用主に知られることを心配する必要はありません。
4. **未払い賃金として請求する**：会社が任意に是正しない場合、Employment Tribunalへの申立て（unlawful deduction from wages、または breach of contract）が選択肢になります。手続きの流れは[サービスチャージ未払いで審判所に申立てた記録](/jobs/service-charges/case-story)で、実際の申立て手順を公開しています。

HMRCが最低賃金違反を認定した場合、雇用主は未払い分の即時支払いに加え、最大で未払い額の${MINIMUM_WAGE_PENALTY.percentOfArrears}%（1人あたり上限${gbp(MINIMUM_WAGE_PENALTY.capPerWorker)}）のペナルティを科される可能性があります。`,
    },
    {
      title: "参考リンク",
      body: `- [gov.uk: National Minimum Wage and National Living Wage rates](https://www.gov.uk/national-minimum-wage-rates)
- [gov.uk: Pay and work rights (Acas経由の通報窓口)](https://www.gov.uk/pay-and-work-rights)
- [gov.uk: National Minimum Wage calculator for workers](https://www.gov.uk/am-i-getting-minimum-wage)
- [Acas: National Minimum Wage](https://www.acas.org.uk/national-minimum-wage)`,
    },
  ],
  relatedLinks: [
    {
      href: "/money/national-insurance-number",
      label: "National Insurance番号の取り方｜給与から引かれる前に",
    },
    {
      href: "/money/opening-an-account",
      label: "英国の銀行口座開設｜給与の振込先を用意する",
    },
    {
      href: "/money/choosing-a-bank",
      label: "銀行の選び方｜高街銀行とネット銀行の違い",
    },
  ],
};

export default minimumWage;
