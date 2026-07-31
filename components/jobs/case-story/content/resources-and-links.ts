import type { CaseStoryArticle } from "../types";

export const resourcesAndLinks: CaseStoryArticle = {
  slug: "resources-and-links",
  title: "参考リンク集",
  engTitle: "Resources and official links",
  summary:
    "実際に使った公式の情報源をまとめます。それぞれ何が書いてあり、どの段階で必要になるかを添えました。",
  description:
    "サービスチャージの未払いやEmployment Tribunalの手続きで参照した公式情報のリンク集です。Acas、gov.uk、Tipping Act、Companies House、公開判決検索など。",
  keywords: [
    "Acas 公式",
    "Employment Tribunal gov.uk",
    "Tipping Act 2023",
    "Companies House 検索",
    "employment tribunal decisions 検索",
  ],
  mainText: `実際に使った情報源をまとめます。

すべて公的機関または公式の窓口です。それぞれについて、**何が書いてあり、どの段階で必要になるか**を添えました。

なお、手続きの内容や期限は変わることがあります。**実際に動く前に、必ず公式サイトで最新の情報を確認してください。**`,
  sections: [
    {
      title: "まず相談する",
      subtitle: "無料で、どの段階でも使える",
      body: `**Acas（Advisory, Conciliation and Arbitration Service）**
[https://www.acas.org.uk](https://www.acas.org.uk)

雇用に関する英国の公的機関です。相談は無料で、雇用主・労働者のどちらの立場でも利用できます。

- 労働問題全般のガイダンス
- Early Conciliationの申請窓口
- 電話相談窓口（通訳の利用について相談できます）

**チップとサービスチャージの取り扱いに関するガイダンス**
[https://www.acas.org.uk/tips-and-service-charges](https://www.acas.org.uk/tips-and-service-charges)

サービスチャージの配分について、雇用主が何をすべきかが説明されています。**自分の職場の運用が適切かを判断する出発点**になります。

**Citizens Advice**
[https://www.citizensadvice.org.uk](https://www.citizensadvice.org.uk)

雇用問題を含む幅広い相談に対応する無料の窓口です。対面での相談も可能です。`,
    },
    {
      title: "チップ・サービスチャージの法律",
      subtitle: "何が違法で、雇用主に何が義務づけられているか",
      body: `**Employment (Allocation of Tips) Act 2023**
[https://www.legislation.gov.uk/ukpga/2023/13](https://www.legislation.gov.uk/ukpga/2023/13)

法律の本文です。要点は次のとおりです。

- 雇用主はチップやサービスチャージを**自分のために留保できない**
- **公正かつ透明**な方法で配分しなければならない
- チップの配分方針を**書面で定める**義務がある
- 配分の**記録を保持**し、従業員の求めに応じて開示する義務がある

**Code of Practice on fair and transparent distribution of tips**
[https://www.gov.uk/government/publications/distributing-tips-fairly-statutory-code-of-practice](https://www.gov.uk/government/publications/distributing-tips-fairly-statutory-code-of-practice)

法律を実務でどう運用すべきかを示した行動規範です。**「公正」が何を意味するか**が具体的に説明されています。

繰り返しになりますが、**「公正」は「全員同額」を意味しません**。勤続年数や役割に応じた傾斜配分は適法です。ただし、**その基準が定められ、書面化され、説明できること**が前提になります。`,
    },
    {
      title: "Employment Tribunalの手続き",
      subtitle: "申立てから判決まで",
      body: `**Employment Tribunalへの申立て（gov.uk）**
[https://www.gov.uk/employment-tribunals](https://www.gov.uk/employment-tribunals)

手続きの全体像、期限、申立ての流れが説明されています。**申立て手数料はありません。**

**ET1のオンライン提出**
[https://www.employmenttribunals.service.gov.uk](https://www.employmenttribunals.service.gov.uk)

実際の申立てフォームです。途中保存ができるので、一度に書き上げる必要はありません。

**審理と判決についてのガイド（T426）**
[https://www.gov.uk/government/publications/employment-tribunal-hearings-judgment-guide-t426](https://www.gov.uk/government/publications/employment-tribunal-hearings-judgment-guide-t426)

判決が出た後の扱い、利息、支払いについて説明されています。**判決の通知と一緒に案内される資料**です。

**公開されている判決の検索**
[https://www.gov.uk/employment-tribunal-decisions](https://www.gov.uk/employment-tribunal-decisions)

イングランド・ウェールズのEmployment Tribunalの判決は公開されており、誰でも検索できます。

会社名で検索できるので、**応募先や勤務先に過去の労働紛争があるかを調べる**のにも使えます。逆に言えば、**自分が申立てた場合、その記録も公開される**ということです。`,
    },
    {
      title: "相手方を特定する・状況を確認する",
      subtitle: "申立て前と、強制執行前に必ず見る",
      body: `**Companies House**
[https://find-and-update.company-information.service.gov.uk](https://find-and-update.company-information.service.gov.uk)

英国の法人登記を無料で検索できます。確認できるのは、

- 会社の**正式名称**と登記上の所在地
- 会社の**状態**（活動中、清算手続き中、解散済みなど）
- 取締役の情報
- 決算書類

**2つの場面で必ず確認してください。**

1. **ET1提出前** — 相手方の正式名称を特定するため。店名ではなく法人名で申立てる必要があります
2. **強制執行前** — 会社が清算手続きに入っていないかを確認するため。状況によって取れる手段が変わります

**The Insolvency Service**
[https://www.gov.uk/government/organisations/insolvency-service](https://www.gov.uk/government/organisations/insolvency-service)

会社が清算手続きに入った場合の窓口です。雇用主が支払不能となった場合、一定の未払い賃金について**国の基金から支払いを受けられる制度**があります。`,
    },
    {
      title: "判決が支払われないとき",
      subtitle: "回収のための手続き",
      body: `**判決が支払われなかったときの選択肢（gov.uk）**
[https://www.gov.uk/employment-tribunals/if-you-win-your-case](https://www.gov.uk/employment-tribunals/if-you-win-your-case)

審判所で勝った後、相手が支払わない場合に何ができるかが説明されています。

**Fast track scheme（様式EX727）**
[https://www.gov.uk/government/publications/form-ex727-i-have-an-employment-or-an-employment-appeal-tribunal-award-but-the-respondent-has-not-paid-how-do-i-enforce-it](https://www.gov.uk/government/publications/form-ex727-i-have-an-employment-or-an-employment-appeal-tribunal-award-but-the-respondent-has-not-paid-how-do-i-enforce-it)

**審判所の判決をHigh Court Enforcement Officerに直接引き渡すための様式**です。私が使った経路がこれにあたります。判決額を回収したい場合、まずここを見てください。

**審判所の判決の執行（gov.uk）**
[https://www.gov.uk/make-court-claim-for-money/enforce-a-judgment](https://www.gov.uk/make-court-claim-for-money/enforce-a-judgment)

執行手段全般（動産差押え、第三債務者命令など）の説明です。

**Employment Tribunal penalty enforcement and naming scheme**
[https://www.gov.uk/guidance/employment-tribunal-penalty-enforcement-and-naming-scheme](https://www.gov.uk/guidance/employment-tribunal-penalty-enforcement-and-naming-scheme)

**これは知っておく価値があります。** 判決が支払われない場合に使える、**無料の**公的な制度です。

- 判決から**42日後**に、無料で未払いを登録できる
- 執行官が確認したうえで、雇用主に**警告通知**が送られる
- それでも**28日**支払われない場合、**判決額の50%に相当する制裁金**と年8%の利息を科す通知が出る
- 支払わない雇用主は、**gov.uk上で公表（naming）される**場合がある（申立て時に公表の可否を選べます）

High Courtの執行と並行して、あるいはその代わりに検討できる選択肢です。費用がかからない点が大きな利点です。

覚えておくべき点を再掲します。

- **1,600ポンドを超える債権**なら、High Courtのwritに移行できます
- writの発行費用（**£80程度**）は立替になりますが、**債務者に加算されます**
- HCEOの手数料も**債務者負担**です
- 回収金は**14日間保持**されてから支払われます
- **「取消しを申し立てた」という相手の主張だけでは、執行は止まりません。** 止めるには裁判所の命令が必要です
- 費用をかけたくない場合は、まず上記の**penalty enforcement and naming scheme**を検討する`,
    },
    {
      title: "このサイト内の関連ページ",
      subtitle: "",
      body: `**[英国サービスチャージ完全ガイド](/jobs/service-charges)**
Tipping Act 2023の内容、強制と任意の違い、Tronc制度、最低賃金との関係を網羅的に解説しています。

**[ロンドン市内のサービスチャージ実態調査](/jobs/service-charges/dashboard)**
実際の店舗でサービスチャージがどう扱われているかの独自調査です。

**[自分の未払い額を計算する](/jobs/service-charges/case-story/check-your-service-charge)**
審判所で認容された計算方法の手順です。

**[申立ての進め方（まとめ）](/jobs/service-charges/case-story/how-to-file-a-claim)**
全体フロー、期限、費用、チェックリストをまとめています。`,
    },
  ],
};
