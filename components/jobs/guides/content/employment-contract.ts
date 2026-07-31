import type { JobGuideArticle } from "../types";

const employmentContract: JobGuideArticle = {
  slug: "employment-contract",
  title: "英国の労働契約・就業規則の基本｜written statement・試用期間・解雇と退職",
  engTitle: "UK Employment Contracts: Written Statements, Probation & Dismissal",
  summary:
    "雇用開始時に受け取るべきwritten statementの中身、試用期間中に知っておくべきこと、解雇・退職時の通知期間や権利について、ロンドンで働く日本人向けに整理しました。",
  description:
    "英国の労働契約書（written statement）の必須記載事項、試用期間の注意点、解雇・退職時の通知期間、不当解雇・整理解雇の資格要件をわかりやすく解説。",
  keywords: [
    "イギリス 労働契約",
    "written statement",
    "試用期間 イギリス",
    "notice period UK",
    "unfair dismissal",
    "redundancy pay",
    "解雇 イギリス",
  ],
  mainText: `日本の雇用契約と大きく異なる点のひとつが、英国では口頭での合意やメールのやり取りだけで雇用がスタートすることも珍しくないことです。しかし、書面での契約内容の受け取りは法律上の権利であり、これを理解しておくことは、後々のトラブル（給与未払い、不当な解雇、シフトの一方的な変更など）から自分を守るうえで重要です。

この記事では、雇用契約に関する基本的な権利と、試用期間・解雇・退職の場面で確認すべきポイントを整理します。`,
  sections: [
    {
      title: "written statement（雇用条件の書面）を受け取る権利",
      body: `2020年4月6日以降、雇用主から**written statement of employment particulars**（雇用条件を記載した書面）を受け取る権利は、従業員（employee）だけでなく労働者（worker）にも適用される**day 1の権利**です。試用期間中であっても、雇用開始日、または開始日より前に交付されなければなりません。

**初日までに記載が必要な主な項目（principal statement）**

- 雇用主・労働者の氏名
- 雇用開始日、および継続勤務が始まった日
- 給与の金額・支払い頻度・支払い方法
- 労働時間、および曜日ごとの労働時間がどう変動しうるか
- 勤務地（複数拠点がある場合はその旨）
- 職務内容の簡単な説明
- 有給休暇の権利
- 試用期間の有無とその内容

**雇用開始から2か月以内に追加で提供が必要な項目**

- 病気休暇・傷病手当の取り扱い
- 年金制度に関する情報
- 通知期間（notice period）
- 苦情申し立て（grievance）・懲戒（disciplinary）手続きの案内先

書面が交付されないこと自体を理由に解雇された場合、勤続期間に関わらず**自動的に不当解雇（automatically unfair dismissal）**とみなされる可能性があります。`,
    },
    {
      title: "試用期間（probation period）の注意点",
      body: `試用期間は英国の制定法上の制度ではなく、**契約上の取り決め**です。つまり、試用期間の長さや条件は会社ごとに異なり、written statementに明記されているかどうかを必ず確認する必要があります。

一般的な実務慣行として押さえておきたい点:

- 試用期間の長さは3〜6か月程度が一般的ですが、法律上の上限・下限はありません
- 試用期間中は通知期間（notice period）が短く設定されていることが多く（例: 1週間）、必ず契約書で確認が必要です
- 試用期間中の解雇であっても、差別（Equality Act 2010が保護する事由によるもの）や、賃金請求権の行使を理由とする解雇は違法です。勤続期間の長さに関わらず主張できます
- 試用期間を延長する場合、契約書にその根拠となる条項があるか、または本人の同意があるかを確認しましょう`,
    },
    {
      title: "通知期間（notice period）の法定最低ライン",
      body: `雇用主・労働者のどちらが契約を終了する場合でも、一定の通知期間（notice）を置く必要があります。契約書に記載がない場合や、記載された期間が以下の法定最低ラインを下回る場合は、法定の最低ラインが適用されます。

| 継続勤務期間 | 雇用主から労働者への法定最低通知期間 |
| --- | --- |
| 1か月未満 | 通知不要 |
| 1か月〜2年未満 | 1週間 |
| 2年〜12年未満 | 勤続1年ごとに1週間（例: 5年なら5週間） |
| 12年以上 | 12週間（上限） |

労働者から雇用主への通知期間は、契約書に定めがなければ**最低1週間**が目安ですが、多くの契約では「1か月前通知」などより長い期間が定められています。必ず自分の契約書の該当条項を確認してください。`,
    },
    {
      title: "解雇・整理解雇（redundancy）で確認すべき権利",
      body: `**不当解雇（unfair dismissal）の申立て**は、原則として継続勤務2年以上でなければ資格を得られません（2026年時点の制度）。ただし、差別を理由とする解雇や、最低賃金・有給休暇などの法定権利を主張したことを理由とする解雇は、勤続期間に関わらず争うことができます。

> **制度変更の予定について**：Employment Rights Act（雇用主のセクハラ防止義務等を含む一連の法改正）により、不当解雇の申立て資格要件は**2027年1月1日から継続勤務6か月に短縮される予定**です。2026年時点ではまだ施行されていないため、現行の2年ルールが適用されます。最新の施行状況はgov.ukで確認してください。

**整理解雇（redundancy）の場合**は、継続勤務2年以上であれば法定整理解雇手当（statutory redundancy pay）を受け取る権利があります。金額は年齢・勤続年数・週給（上限あり）に応じて計算され、gov.ukの計算ツールで試算できます。

**退職する場合**は、契約書に定められた通知期間を守ったうえで書面（メールでも可）で意思表示するのが一般的です。有給休暇の未消化分は、退職時に金銭精算される権利があります。`,
    },
    {
      title: "契約内容に疑問があるときの相談先",
      body: `契約書の内容が不明確、または実際の労働条件と食い違っている場合は、以下の窓口が利用できます。

1. **Acas（0300 123 1100）**：契約・解雇・懲戒手続きなど、雇用に関するあらゆる相談を無料で受け付けています。
2. **Citizens Advice**：契約書の読み方や、次に取るべき手続きについて、対面・オンラインで相談できます。
3. **Employment Tribunal**：交渉で解決しない場合の最終手段。多くの請求はまずAcasのEarly Conciliationを経る必要があります。実際の申立て手順は[サービスチャージ未払いで審判所に申立てた記録](/jobs/service-charges/case-story)で公開しています。`,
    },
    {
      title: "参考リンク",
      body: `- [gov.uk: Employment contracts and conditions](https://www.gov.uk/browse/employing-people/contracts)
- [gov.uk: Statement of employment particulars](https://www.gov.uk/employment-contracts-and-conditions/written-statement-of-employment-particulars)
- [gov.uk: Redundancy pay calculator](https://www.gov.uk/calculate-your-redundancy-pay)
- [Acas: Notice periods](https://www.acas.org.uk/notice-periods)`,
    },
  ],
};

export default employmentContract;
