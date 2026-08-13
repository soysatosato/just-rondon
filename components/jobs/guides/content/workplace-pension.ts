import type { JobGuideArticle } from "../types";
import {
  JOBS_AS_OF,
  JOBS_UPDATED_AT,
  PENSION,
  gbp,
  pensionContribution,
} from "@/lib/jobs/rates";

/**
 * 拠出額の計算例で使う年収。キリのよい額なら何でもよいが、
 * qualifying earnings の上限を超えない額にすること(超えると
 * 「年収 − 下限」という本文の説明と合わなくなる)。
 */
const PENSION_EXAMPLE_SALARY = 20000;
const pensionExample = pensionContribution(PENSION_EXAMPLE_SALARY);

const workplacePension: JobGuideArticle = {
  slug: "workplace-pension",
  dataAsOf: JOBS_AS_OF,
  updatedAt: JOBS_UPDATED_AT,
  title:
    "英国の職場年金（Nest）の仕組みと脱退方法｜ワーホリで知らずに天引きされていた話",
  engTitle: "UK Workplace Pension (Nest) & How to Opt Out",
  summary:
    "ワーホリでロンドンのお店で働いていたとき、Payslipから「Nest」の名目で年金が天引きされていることに、しばらく気づきませんでした。雇用主からの説明も一切なし。この記事では自動加入（auto-enrolment）の仕組み、1か月の脱退期間を過ぎると返金されない理由、そして今まさに払っている人のための脱退手順を、実体験を踏まえて具体的に書きます。",
  description:
    "英国の職場年金の自動加入（auto-enrolment）とNest Pensionの仕組み、Payslipでの見分け方、1か月の opt-out 期間と返金ルール、電話・オンラインでの具体的な脱退手順、期間経過後に取れる選択肢、帰国後の年金の扱いまで解説。",
  keywords: [
    "イギリス 年金 脱退",
    "Nest Pension 解約",
    "auto-enrolment オプトアウト",
    "ワーホリ 年金 天引き",
    "英国 職場年金",
    "payslip pension 天引き",
    "Nest 返金",
  ],
  mainText: `ワーホリでロンドンのお店で働いていたとき、あるときPayslipをよく見たら、見覚えのない「Nest」という項目で毎月お金が引かれていました。雇用主から事前の説明は一切ありません。何かの手数料だろうかと思いながら、しばらくそのままにしていました。

これは英国の職場年金（workplace pension）の自動加入制度によるものです。違法でも詐欺でもなく、雇用主が法律にもとづいて実行している正規の手続きです。ただし**加入から1か月以内に手続きすれば、払った分は全額返ってきます**。そしてその1か月を過ぎると、もう返ってきません。

私はこの「1か月」を知らないまま超過しました。あとから脱退（opt out）はできましたが、それまでに払った分は戻らず、いまも英国の年金口座に残ったままです。55歳になるまで引き出せません。

この記事は、同じ思いをする人を減らすために書いています。前半で仕組みを説明し、後半で「今まさに払っている人」が今日できる脱退手順を、手取り足取りまとめます。`,
  sections: [
    {
      title: "そもそも何が起きているのか：自動加入（auto-enrolment）",
      body: `英国では2012年から、雇用主に対して「条件を満たす従業員を職場年金に自動的に加入させる」義務が課されています。これがauto-enrolment（自動加入）です。

重要なのは、**従業員の同意も、申し込みも不要**だという点です。条件を満たした瞬間、雇用主が勝手に加入手続きを進めます。これは雇用主の親切でも怠慢でもなく、法律上の義務です（やらないと雇用主が罰則を受けます）。

自動加入の対象になる条件は以下のすべてを満たす場合です。

| 条件 | 内容 |
| --- | --- |
| 年齢 | ${PENSION.autoEnrolmentMinAge}歳以上、State Pension ageまで |
| 年収 | ${gbp(PENSION.autoEnrolmentEarnings)}以上 |
| 就労地 | 通常英国内で働いている |
| 区分 | 「worker」に該当する |

**ワーホリ（Youth Mobility Scheme）や学生ビザでも、この条件を満たせば対象です。** ビザの種類や滞在予定期間は関係ありません。「どうせ2年で帰国するから」という事情は、制度上いっさい考慮されません。

年齢が${PENSION.autoEnrolmentMinAge}歳未満、または年収が${gbp(PENSION.autoEnrolmentEarnings)}未満の場合は自動加入の対象外ですが、それでも一定の条件下では自分から加入を申し出る権利があります（逆に言えば、自動では入れられません）。`,
    },
    {
      title: "Nestとは何か：勝手に決められる年金の受け皿",
      body: `Nest（National Employment Savings Trust）は、auto-enrolmentのために政府が設立した年金基金です。運営しているのはNEST Corporationという公的機関で、怪しい民間業者ではありません。

雇用主は年金の受け皿となる制度を自分で選ぶ必要がありますが、**中小企業やホスピタリティ業界では、手続きが簡単で受け入れ拒否のないNestが選ばれることが非常に多い**です。ロンドンの飲食店・小売店で働く日本人がPayslipで目にする年金名は、体感としてほとんどがNestです。

Nest以外にも、Smart Pension、The People's Pension、NOW: Pensionsなどが同じ役割で使われます。名前が違っても、この記事で説明する自動加入・脱退期間・返金のルールは**法律で決まっているため全社共通**です。手続きの窓口が変わるだけです。

なお、Nestに入れられたこと自体は、必ずしも損ではありません。あなたが払った分に加えて、**雇用主も別途お金を出しています**（後述）。長く英国に住む予定なら、むしろ脱退しないほうが合理的なケースが多いです。この記事は「脱退を勧める記事」ではなく、「知らないまま決められるのをやめよう」という記事です。`,
    },
    {
      title: "Payslipのどこを見ればいいか",
      body: `自分が払っているかどうかは、Payslip（給与明細）の**deductions（天引き）欄**を見ればわかります。

探すべき項目名の例:

- \`Pension\`
- \`Nest\`
- \`NEST Pension\`
- \`EE Pension\` / \`Employee Pension\`（EE = Employee の略）
- \`AE\` / \`Auto Enrolment\`

金額の目安を知っておくと見つけやすくなります。法定の最低拠出率は以下のとおりです。

| 拠出者 | 最低率 |
| --- | --- |
| 従業員（あなた） | ${PENSION.employeePercent}% |
| 雇用主 | ${PENSION.employerPercent}% |
| **合計** | **${PENSION.totalPercent}%** |

ただしこの%は、給料の全額にかかるわけではありません。**qualifying earnings（対象所得）と呼ばれる、年収${gbp(PENSION.qualifyingEarningsLower)}超〜${gbp(PENSION.qualifyingEarningsUpper)}までの部分**にのみかかります。たとえば年収${gbp(PENSION_EXAMPLE_SALARY)}なら、対象となるのは ${gbp(PENSION_EXAMPLE_SALARY)} − ${gbp(PENSION.qualifyingEarningsLower)} = ${gbp(pensionExample.qualifying)} の部分で、あなたの負担は年間その${PENSION.employeePercent}%＝約${gbp(Math.round(pensionExample.yearly))}、月あたり${gbp(Math.round(pensionExample.monthly))}前後という計算になります。

Payslipに \`ER Pension\` や \`Employer Pension\` という項目があれば、それは雇用主が出している分です。**これはあなたの給料から引かれているお金ではなく、雇用主が上乗せで払っているお金**です。脱退すると、この上乗せ分ももらえなくなります。

Payslipそのものの読み方は[最低賃金・給与明細の見方](/jobs/minimum-wage)で詳しく解説しています。`,
    },
    {
      title: "【最重要】1か月の脱退期間と、返金されるかどうかの分かれ目",
      subtitle: "私が知らずに超過してしまったのが、ここです",
      body: `脱退（opt out）の扱いは、**タイミングによって結果が180度変わります**。ここがこの記事でいちばん大事な部分です。

**opt-out period（脱退期間）**
- 開始：加入手続きの日から**3営業日後**
- 長さ：そこから**1か月（1 calendar month）**

この期間内に手続きすれば、**それまでに払った分は全額返金されます**。加入自体が最初からなかったものとして扱われるためです。

この期間を1日でも過ぎると、**払った分は一切返金されません**。脱退（正確にはその後の「拠出停止」）はいつでもできますが、すでに入れたお金は年金口座に残り続けます。引き出せるのは**55歳から**（2028年4月以降は57歳から）です。

| | 1か月以内に手続き | 1か月経過後 |
| --- | --- | --- |
| 今後の天引き | 止まる | 止まる |
| 払った分の返金 | **全額返ってくる** | **返ってこない** |
| お金の行き先 | 手元に戻る | 55歳（2028年4月以降は57歳）まで英国の年金口座 |

Nestからは加入時に、**脱退期間の正確な開始日と終了日を明記した手紙（enrolment letter）**が届きます。私の場合、この手紙が職場の住所に届いていたのか、引っ越し前の住所だったのか、そもそも目にした記憶がありません。**この手紙を見た記憶がなくても、期間は淡々と進行します。**

なので実務上の結論はシンプルです。**Payslipに年金の天引きを見つけたら、その日のうちに動いてください。** 「今月の給料日にもう一度確認してから」では、間に合わない可能性があります。`,
    },
    {
      title: "脱退の具体的な手順（1か月以内の場合）",
      subtitle: "電話が最速。オンラインでも可。郵送は間に合わないことがある",
      body: `**まず大前提：雇用主に相談する必要はありません。** 脱退はあなたとNestの間で完結します。店長に「辞めたいんですけど」と切り出す必要も、許可をもらう必要もありません。むしろ雇用主が脱退を勧誘することは法律で禁止されています（inducementといいます）。

**方法1：電話（最速・おすすめ）**

- 番号：**0300 020 0090**
- 24時間対応の自動音声サービス
- 所要時間：約6分
- 完了確認をメールで受け取るか、郵送で受け取るかを選べます

英語での自動音声になりますが、聞かれるのは本人確認のための基本情報（氏名・生年月日・住所・National Insurance番号など）が中心です。事前にPayslipとNI番号を手元に用意してから電話してください。

**方法2：オンライン**

- Nestのウェブサイトの脱退ページから手続きします
- **アカウントを有効化（activate）していなくても手続き可能**です。「アカウントを作っていないから無理」ということはありません
- すでにアカウントがある人はログインしてから、「Learn more about opting out」を選んで進みます

**方法3：郵送（非推奨）**

- 0300 020 0090に電話して紙のフォームを取り寄せ、記入して雇用主に渡します
- 取り寄せに時間がかかるため、**期限が近い場合は間に合いません**。急ぐなら電話かオンラインを使ってください

**手続き後の流れ**

あなたが払った分と雇用主が払った分は、まずNestから**雇用主の口座に**返金されます（最大10営業日）。そこからあなたに渡すのは**雇用主の責任**です。つまり、次回以降の給与に上乗せされる形で戻ってくるのが一般的です。

ここが要注意ポイントで、**雇用主が返金を忘れる・処理が漏れるケースがあります。** 手続きしたら日付を記録しておき、2回分くらいの給料日を過ぎても返金が反映されなければ、Payslipを根拠に雇用主へ書面（メールで可）で請求してください。それでも支払われない場合は、賃金の不当天引き（unlawful deduction from wages）の問題として扱えます。`,
    },
    {
      title: "1か月を過ぎてしまった人へ：それでも今日やるべきこと",
      subtitle: "返金は諦める。ただし今後の流出は止められる",
      body: `私と同じ状況の人向けです。返金されないのは残念ながら覆りません。**ただし、これ以上払い続けるかどうかは今日決められます。**

**やること：拠出の停止（stop contributions）**

脱退期間が終わったあとの手続きは、正確には「opt out」ではなく「**contributionsを止める**」という扱いになります。窓口は同じです。

- Nestのオンラインアカウントから停止手続きができます
- 電話 **0300 020 0090** でも可能です
- アカウントを有効化していない場合は、まずアカウントの有効化が必要になることがあります。加入時の手紙に記載のNEST IDが必要ですが、紛失していても電話で本人確認から再発行してもらえます

**すでに入っているお金はどうなるか**

- 年金口座にそのまま残り、運用され続けます
- 引き出せるのは55歳から（2028年4月以降は57歳から）
- 口座は維持され、手数料はNestの場合は残高に対する年率のみです（拠出時手数料は拠出をやめれば発生しません）
- 将来別の英国年金に移す（transfer）ことも、逆に他の年金をここにまとめることも可能です

**「少額だから諦める」の前に**

金額が${gbp(PENSION.smallPotLimit)}以下の場合、**small potルール**という制度により、55歳（2028年4月以降は57歳）到達時に一時金としてまとめて受け取れる可能性があります。ワーホリ期間中の拠出額なら、まず確実にこの範囲です。つまり「消えた」わけではなく、「受け取りが数十年後になった」というのが正確な理解です。

**やってはいけないこと**

「どうせ帰国するから」とアカウント情報を捨ててしまうことです。将来受け取るには、Nest側があなたに連絡できる状態である必要があります。**帰国後もアクセスできるメールアドレスを登録し、NEST IDと加入時の情報は保管しておいてください。** Nestはオンライン制度なので、日本からでもアカウントにアクセスできます。`,
    },
    {
      title: "3年ごとに「また入れられる」ことを知っておく",
      body: `脱退したあと安心していると、数年後にまた同じことが起きます。

法律上、**雇用主は3年ごとに、条件を満たす従業員を年金制度に再加入させる義務**があります（cyclical re-enrolment）。過去に脱退した人も対象に戻ります。「一度断ったから永久に対象外」ではありません。

再加入されたときも、**あらためて1か月の脱退期間が与えられます**。そのタイミングで再度手続きすれば、また返金されます。

つまり同じ職場に長く勤める場合、**3年に一度、Payslipの年金欄を確認するタイミングがある**ということです。再加入の通知は届きますが、それを見落とす前提で、自分で気づける状態にしておくのが安全です。

また、**転職すると新しい雇用主のもとで最初から自動加入の対象になります。** 前の職場で脱退した記録は引き継がれません。ロンドンで職場を変えるたびに、この判断が発生すると考えてください。`,
    },
    {
      title: "そもそも脱退すべきか：判断の軸",
      subtitle: "この記事は脱退を勧めるものではありません",
      body: `ここまで脱退方法を詳しく書きましたが、**脱退が正解とは限りません。** 私が悔しかったのは「お金を取られたこと」ではなく、「知らないまま決められたこと」です。判断材料を並べます。

**脱退しないほうがいい場合**

- **英国に長く住む予定がある**：雇用主が3%を上乗せしてくれるうえ、税制優遇もあります。自分の5%に対して合計8%が積み上がるので、単純な貯金より有利です
- **年収が高め**：拠出額は税引き前の所得から引かれるため、実質的な負担は額面の5%より小さくなります
- **他に貯蓄手段を持っていない**：強制的に貯まる仕組みとして機能します

**脱退を検討していい場合**

- **数か月〜1年程度で帰国が確定している**：受け取りが数十年後になるお金より、手元の現金の価値が高い局面です
- **今の生活が明確に苦しい**：家賃や生活費を削っている状況で、55歳まで動かせないお金を積むのは合理的とは言えません

ワーホリで1〜2年の滞在という前提なら、**脱退する判断にも十分な理があります**。私自身、内容を理解したうえで選べていたなら、たぶん脱退を選んでいました。問題は、選ぶ機会があることすら知らされなかったことです。

雇用主には本来、加入時に制度の内容を書面で通知する義務があります。それが機能していない職場は実際に存在します。だからこそ、**自分でPayslipを見る習慣**が最後の防衛線になります。`,
    },
    {
      title: "帰国する前にやっておくこと",
      body: `英国を離れる前に、以下を済ませておくと将来困りません。

1. **Nestアカウントを有効化し、ログインできる状態にする**
2. **登録メールアドレスを、帰国後も使えるものに変更する**（職場のメールや英国限定のアドレスは避ける）
3. **NEST ID・National Insurance番号を控えて保管する**
4. **住所変更の方法を確認しておく**（日本の住所も登録可能です）

Nestはオンラインで完結する制度なので、**日本に帰国してもアカウントにアクセスでき、55歳（2028年4月以降は57歳）以降に受け取れます。** 「帰国したら消える」ものではありません。

なお、**帰国後に英国の年金を日本の年金や海外の制度へ移す（QROPS移管）のは、基本的におすすめしません。** 2024年10月以降、英国外の制度への移管の多くに25%の課税が発生するようになりました。少額の年金であれば、英国に置いたまま将来一時金として受け取るほうがシンプルで有利なケースがほとんどです。

金額が大きい場合や個別事情がある場合は、規制を受けた financial adviser への相談を検討してください。`,
    },
    {
      title: "参考リンク",
      body: `- [gov.uk: Workplace pensions](https://www.gov.uk/workplace-pensions)
- [gov.uk: What you, your employer and the government pay](https://www.gov.uk/workplace-pensions/what-you-your-employer-and-the-government-pay)
- [Nest: How do I opt out?](https://www.nestpensions.org.uk/schemeweb/memberhelpcentre/opting-out/how-to-opt-out.html)
- [Nest: Refunded contributions after opt out](https://www.nestpensions.org.uk/schemeweb/memberhelpcentre/opting-out/opt-out-refund.html)
- [Nest: How do I stop contributions?](https://www.nestpensions.org.uk/schemeweb/memberhelpcentre/contributions/stop-contributions.html)
- [Nest: What happens to my pot if I'm moving abroad?](https://www.nestpensions.org.uk/schemeweb/memberhelpcentre/changes-in-circumstances/moving-abroad.html)
- [The Pensions Regulator: Automatic re-enrolment](https://www.thepensionsregulator.gov.uk/en/document-library/automatic-enrolment-detailed-guidance/11-automatic-re-enrolment-putting-workers-back-into-pension-scheme-membership)
- [MoneyHelper: Automatic enrolment](https://www.moneyhelper.org.uk/en/pensions-and-retirement/auto-enrolment)`,
    },
  ],
  relatedLinks: [
    {
      href: "/money/national-insurance-number",
      label: "National Insurance番号｜年金記録が紐づく番号",
    },
    {
      href: "/money/sending-money-from-japan",
      label: "日本への送金・日本からの送金｜帰国時に年金をどうするか",
    },
    {
      href: "/visa/after-arrival",
      label: "入国後の手続き｜就労開始までに済ませること",
    },
  ],
};

export default workplacePension;
