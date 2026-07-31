import type { JobGuideArticle } from "../types";

const visaAndWork: JobGuideArticle = {
  slug: "visa-and-work",
  title: "ビザと就労の接点｜学生ビザ・Graduateビザで働ける範囲とSkilled Workerへの切り替え",
  engTitle: "UK Visas and the Right to Work: Student, Graduate & Skilled Worker",
  summary:
    "学生ビザ・Graduateビザでどこまで働けるのか、Skilled Workerスポンサーへの切り替えに必要な条件、そして就労制限に違反した場合のリスクを整理しました。",
  description:
    "学生ビザ・Graduateビザの就労時間制限、Skilled Worker visaの最新の給与要件（2026年）、ビザ切り替えの流れと違反した場合のリスクをわかりやすく解説。",
  keywords: [
    "学生ビザ 就労時間",
    "Graduate visa 働き方",
    "Skilled Worker visa 給与",
    "ビザ 切り替え イギリス",
    "就労制限 違反",
    "Certificate of Sponsorship",
  ],
  mainText: `ロンドンで働く日本人の多くは、学生ビザ（Student visa）、卒業後のGraduate visa、あるいは就労ビザ（Skilled Worker visa）のいずれかで滞在しています。それぞれのビザで「どこまで働いていいか」のルールは大きく異なり、違反すると本人の将来のビザ申請だけでなく、雇用主にも重い制裁が及びます。

この記事では、主要な3つのビザ区分の就労ルールと、ビザを切り替える際に押さえておくべきポイントを整理します。**ビザのルールは変更が多い分野です。申請・切り替えの前には必ずgov.ukの最新情報を確認してください。**`,
  sections: [
    {
      title: "学生ビザ（Student visa）で働ける範囲",
      body: `学生ビザで就労する場合の上限は、コースのレベルによって異なります。

- **学位レベル（degree-level）以上のコース**：学期中（term time）は**週20時間まで**
- **学位レベル未満のコース**：学期中は**週10時間まで**
- **公式の休暇期間（official vacation）中**：フルタイムでの就労が可能

**特に注意すべき点**

- 20時間・10時間の上限は「週ごと」の上限であり、**平均で守ればよいわけではありません**。ある週に30時間働き、別の週に10時間しか働かなかった、という調整はできません。
- 「学期中（term time）」は、自分の授業スケジュールではなく、**在籍する教育機関が公式に定める学期日程**にもとづきます。
- 学生ビザでは、**自営業（self-employment）やフリーランスとしての就労、プロスポーツ選手・エンターテイナーとしての活動は原則できません**。
- ボランティア活動は就労時間の上限にはカウントされません。

上限を超えて働くことは、単なる契約違反ではなく**ビザ条件違反**であり、その後のビザ申請（Graduate visa、Skilled Worker visaなど）に不利益が生じるリスクがあります。`,
    },
    {
      title: "Graduate visaで働ける範囲",
      body: `英国の大学を卒業した後に申請できるGraduate visaは、学生ビザと比べて就労の自由度が大きく異なります。

- 就労時間の上限は**ありません**（フルタイムでの就労が可能）
- **自営業・フリーランスとしての就労も可能**
- スポンサー（雇用主による certificate of sponsorship）は不要

標準的な学部卒業者・修士修了者は2年間、博士（PhD）取得者は3年間のGraduate visaが付与されます（申請時点のルールによる）。**2027年1月1日以降に申請する人については、標準の付与期間が18か月に短縮される予定**とされています（博士取得者の3年間は維持される見込み）。今後ビザを申請する予定がある場合は、申請時点の最新ルールを必ずgov.ukで確認してください。`,
    },
    {
      title: "Skilled Worker visaへの切り替え",
      body: `学生ビザ・Graduate visaから、雇用主のスポンサーを得て長期的に働き続けるための代表的な選択肢が**Skilled Worker visa**です。

**主な要件（2026年時点の目安）**

- 雇用主がHome Officeのスポンサーライセンスを保有し、**Certificate of Sponsorship（CoS）**を発行していること
- 職種がSkilled Worker visaの対象職種リストに含まれていること
- 給与が、**一般的な最低給与要件（£41,700/年）と、職種ごとの「going rate（相場賃金）」のいずれか高い方**を満たしていること

**給与要件の例外・割引**

| ケース | 目安の最低給与 |
| --- | --- |
| 一般的な最低給与要件 | £41,700/年 |
| New entrant（就業初期のキャリア）割引 | £33,400/年 |
| Shortage occupation（人材不足職種） | going rateから20%割引 |
| ヘルスケア関連職 | 職種により£25,000/年から |
| 関連分野の博士号（PhD）を持つ場合 | £37,500/年から |

上記はいずれも制度改定の対象になりやすい数値です。切り替えを検討する際は、必ず[gov.uk: Skilled Worker visa](https://www.gov.uk/skilled-worker-visa)で最新の閾値と対象職種を確認してください。

**切り替えの流れ**

1. スポンサーライセンスを持つ雇用主から内定・CoSの発行を受ける
2. 現在のビザが有効なうちに、英国内からSkilled Worker visaへの切り替え申請を行う
3. 審査結果が出るまでは、現在のビザの条件下で就労を続ける（申請中に自己判断で就労条件を変えない）`,
    },
    {
      title: "就労制限に違反した場合のリスク",
      body: `就労時間・就労内容の制限に違反した場合、以下のようなリスクがあります。

- **本人**：ビザの取消し（curtailment）、退去、将来の英国ビザ申請における拒否リスクの上昇
- **雇用主**：不法就労者を雇用したとして、**1人あたり最大£60,000の民事制裁金**、スポンサーライセンスの取消し、悪質な場合は刑事責任

雇用主には、雇用開始前に労働者の就労資格（right to work）を確認する法的義務があります。オンラインのright to workチェック（シェアコード発行）を求められた場合は、正規の手続きとして協力しましょう。逆に、**この確認を一切求めずに現金払いのみで働かせようとする求人は、リスクが高いサインの一つ**です。`,
    },
    {
      title: "参考リンク",
      body: `- [gov.uk: Student visa – Working while you study](https://www.gov.uk/student-visa/work)
- [gov.uk: Graduate visa](https://www.gov.uk/graduate-visa)
- [gov.uk: Skilled Worker visa](https://www.gov.uk/skilled-worker-visa)
- [gov.uk: Prove your right to work to an employer](https://www.gov.uk/prove-right-to-work)`,
    },
  ],
};

export default visaAndWork;
