import type { JobGuideArticle } from "../types";
import { JOBS_AS_OF, JOBS_UPDATED_AT } from "@/lib/jobs/rates";

const workplaceHarassment: JobGuideArticle = {
  slug: "workplace-harassment",
  dataAsOf: JOBS_AS_OF,
  updatedAt: JOBS_UPDATED_AT,
  title: "職場のハラスメント・トラブルの相談先｜Equality Act 2010とAcasの使い方",
  engTitle: "Workplace Harassment in the UK: Your Rights and Where to Get Help",
  summary:
    "Equality Act 2010が守る範囲、2024年10月に始まった雇用主のセクハラ防止義務、社内での申し立て方法から、Acas・Citizens Adviceの使い方までを整理しました。",
  description:
    "英国の職場ハラスメントに関する法律（Equality Act 2010）、2024年施行の雇用主のセクハラ防止義務、社内グリーバンスの出し方、Acas・Employment Tribunalの相談窓口を解説。",
  keywords: [
    "職場 ハラスメント イギリス",
    "Equality Act 2010",
    "workplace harassment UK",
    "Acas 相談",
    "grievance procedure",
    "sexual harassment employer duty",
  ],
  mainText: `「これはハラスメントなのか、それとも自分の受け止め方の問題なのか」——言葉の壁や職場文化の違いもあり、海外で働く中でこの判断に迷う人は少なくありません。英国では、ハラスメントに関する保護と、それに対する雇用主の義務が法律で明確に定められています。

この記事では、法律が守る範囲、雇用主に課された義務、そして実際に何かがあったときの相談先と手順を整理します。`,
  sections: [
    {
      title: "Equality Act 2010が守る範囲",
      body: `英国の差別・ハラスメントに関する基本法である**Equality Act 2010**は、以下の「保護特性（protected characteristics）」に関連するハラスメント・差別を禁止しています。

- 年齢（age）
- 障害（disability）
- 性別適合（gender reassignment）
- 婚姻・シビルパートナーシップ（marriage and civil partnership）
- 妊娠・出産（pregnancy and maternity）
- 人種（race。国籍・民族的出身・肌の色を含む）
- 宗教・信条（religion or belief）
- 性別（sex）
- 性的指向（sexual orientation）

**ハラスメントの定義**は、上記の保護特性に関連する「望まない言動（unwanted conduct）」であって、それが当人の尊厳を傷つけたり、威圧的・敵対的・屈辱的・不快な環境を作り出したりする目的または効果を持つもの、とされています。行為者に悪意がなかったとしても、受け手にとってその効果があれば該当しうる点が重要です。`,
    },
    {
      title: "2024年10月〜：雇用主のセクハラ防止義務",
      body: `2024年10月26日、**Worker Protection (Amendment of Equality Act 2010) Act 2023**が施行され、雇用主には**セクシュアルハラスメントを防止するための「合理的な措置」を積極的に取る義務（positive duty）**が新たに課されました。

これは、実際にハラスメントの申し立てが起きてから対応する「事後対応型」から、**申し立てがなくても事前にリスクを評価し、予防策を講じる「予防型」への転換**を意味します。具体的には、ハラスメント防止ポリシーの整備、研修の実施、相談窓口の設置などが「合理的な措置」の例として挙げられています。

雇用主がこの義務を怠っていたとEmployment Tribunalが認定した場合、**ハラスメントに対する損害賠償額を最大25%増額**できる権限が審判所に与えられています。

会社に明確なハラスメント防止ポリシーや相談窓口が存在しない場合、それ自体が「合理的な措置を取っていない」ことの一つの兆候になり得ます。`,
    },
    {
      title: "社内での申し立て（grievance）の進め方",
      body: `多くの場合、いきなりEmployment Tribunalに申し立てるのではなく、まず社内の**grievance procedure（苦情申し立て手続き）**を利用することが推奨されます。

1. **記録を残す**：日時、場所、発言内容、居合わせた人をできるだけ具体的にメモしておく。可能であればメールやメッセージなど、時系列がわかる証拠を保存する。
2. **社内手続きを確認する**：written statementや従業員ハンドブックに記載されているgrievance procedureの手順（誰に、どの形式で申し立てるか）を確認する。
3. **書面で申し立てる**：口頭だけでなく、メールなど記録に残る形で申し立てる。何が起きたか、いつ・誰によるものか、どのような対応を求めるかを明記する。
4. **会社の対応を記録する**：調査の有無、結果、対応内容も含めて記録しておく。

社内手続きが機能しない、または申し立てたこと自体を理由に不利益な扱い（victimisation）を受けた場合は、それ自体が別の請求原因になり得ます。`,
    },
    {
      title: "Acas・Employment Tribunalへ進む場合",
      body: `社内での解決が難しい場合、以下のステップが選択肢になります。

1. **Acasに相談する**（0300 123 1100）：無料・秘密厳守で相談でき、会社との調停（conciliation）を仲介してもらうことも可能です。
2. **Acas Early Conciliation**：Employment Tribunalへの申し立て前に、原則として必ず通る手続きです。ここで和解に至るケースも少なくありません。
3. **Employment Tribunalへの申立て（ET1）**：多くのハラスメント・差別関連の請求には、**問題が発生した日からおおむね3か月マイナス1日**という厳しい期限があります。Acasへの通知を行った期間は、この期限計算から除外されるため、迷っている場合もできるだけ早くAcasに連絡することが重要です。

実際の申立て手続き（ET1の書き方、証拠提出、審理の流れ）については、[サービスチャージ未払いで審判所に申立てた記録](/jobs/service-charges/case-story)で、賃金請求のケースをもとに具体的な手順を公開しています。手続きの流れ自体はハラスメント・差別の請求でも共通する部分が多くあります。`,
    },
    {
      title: "Acas以外の相談先",
      body: `- **Citizens Advice**：契約書の読み方から、次に取るべき手続きまで、対面・電話・オンラインで無料相談ができます。
- **労働組合（trade union）**：加入している場合、団体としての交渉力や、代理人としてのサポートを受けられます。
- **Equality Advisory and Support Service（EASS）**：Equality Act 2010に関する専門的な相談窓口です。
- **在英日本国大使館・領事館**：法律的な代理人にはなれませんが、緊急時の情報提供や、必要に応じて専門機関の案内を受けられる場合があります。

どの窓口も、ビザのステータスや在留資格に関わらず利用できます。「ビザに影響するかもしれない」という不安から相談をためらう必要はありません。`,
    },
    {
      title: "参考リンク",
      body: `- [gov.uk: Discrimination and your rights](https://www.gov.uk/discrimination-your-rights)
- [Acas: Sexual harassment at work – new employer duty](https://www.acas.org.uk/sexual-harassment)
- [EHRC: Sexual harassment and harassment at work – technical guidance](https://www.equalityhumanrights.com/guidance/sexual-harassment-and-harassment-work-technical-guidance)
- [gov.uk: Make a claim to an employment tribunal](https://www.gov.uk/employment-tribunals)`,
    },
  ],
  relatedLinks: [
    {
      href: "/health/gp-registration",
      label: "GP登録｜心身の不調で受診したくなったとき",
    },
    {
      href: "/health/when-you-are-ill",
      label: "体調を崩したとき｜NHSのかかり方とsick note",
    },
    {
      href: "/visa/after-arrival",
      label: "入国後の手続き｜滞在資格と就労状況の確認",
    },
  ],
};

export default workplaceHarassment;
