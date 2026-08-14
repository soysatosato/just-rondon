import type { TroubleGuideArticle } from "../types";
import {
  EMERGENCY_CONTACTS,
  FRAUD_REPORTING,
  POLICE_REPORT,
  TROUBLE_AS_OF,
  TROUBLE_SOURCES,
  TROUBLE_UPDATED_AT,
} from "@/lib/trouble/contacts";

const policeReport: TroubleGuideArticle = {
  slug: "police-report",
  title: "イギリスで警察に届け出る方法｜crime reference number の取り方",
  engTitle: "Reporting a Crime and Getting a Crime Reference Number",
  audience: "被害を届け出たい人。保険請求に受理番号が必要な人",
  summary: `物が戻ってこなくても、届け出る理由があります。保険の請求も、パスポートの再発給も、携帯会社への申告も、警察の受理番号（crime reference number）を前提に組まれているからです。${EMERGENCY_CONTACTS.emergency} と ${EMERGENCY_CONTACTS.nonEmergency} とオンラインの使い分けから説明します。`,
  description:
    "イギリスで警察に被害を届け出る方法を解説。999と101とオンライン通報の使い分け、crime reference numberの発行タイミングと使い道、通訳の依頼、Report Fraud（旧Action Fraud）への詐欺通報まで。通報は無料です。",
  keywords: [
    "イギリス 警察 通報",
    "crime reference number とは",
    "ロンドン 101 警察",
    "イギリス 盗難 届出",
    "Report Fraud 詐欺 通報",
    "Action Fraud 変更",
    "ロンドン 警察署 日本語",
  ],
  dataAsOf: TROUBLE_AS_OF,
  updatedAt: TROUBLE_UPDATED_AT,
  immediateSteps: [
    {
      timing: "まず",
      action: "いま危険があるかどうかを判断する",
      detail: `犯人がその場にいる、けがをした、暴力を受けている——このいずれかなら ${EMERGENCY_CONTACTS.emergency} です。迷ったらかけて構いません。`,
    },
    {
      timing: "危険がなければ",
      action: `${EMERGENCY_CONTACTS.nonEmergency} かオンラインで通報する`,
      detail:
        "すでに終わった盗難の届出はこちらです。オンラインは24時間受け付けていて、英語を話す必要がありません。",
    },
    {
      timing: "通報の前に",
      action: "被害の内容をメモにまとめる",
      detail:
        "いつ・どこで・何を・いくら分。聞かれることは決まっているので、先に書いておくと通報が早く終わります。",
    },
    {
      timing: `目安${POLICE_REPORT.responseHours}時間以内`,
      action: "警察からの連絡を待ち、受理番号を受け取る",
      detail:
        "crime reference number は、報告が正式に受理された段階で発行されます。届いたら必ず控えてください。",
    },
    {
      timing: "受け取ったら",
      action: "保険会社・携帯会社・大使館に番号を伝える",
      detail:
        "この番号が、あとの手続きすべての前提になります。写真に撮ってクラウドに保存しておくと安全です。",
    },
  ],
  atAGlance: [
    { label: "通報の費用", value: POLICE_REPORT.cost },
    {
      label: "危険が進行中",
      value: `${EMERGENCY_CONTACTS.emergency}（警察・救急・消防）`,
    },
    {
      label: "終わったことの通報",
      value: `${EMERGENCY_CONTACTS.nonEmergency} またはオンライン`,
    },
    {
      label: "詐欺の通報",
      value: `${FRAUD_REPORTING.serviceName}（${EMERGENCY_CONTACTS.reportFraud}）`,
    },
    {
      label: "銀行を名乗る不審な連絡",
      value: `切ってから ${EMERGENCY_CONTACTS.bankFraud} にかけ直す`,
    },
    {
      label: "受理番号の用途",
      value: "保険請求・パスポート再発給・携帯会社への申告",
    },
  ],
  mainText: `「届け出ても、どうせ戻ってこない」——これはある程度まで事実です。ロンドンで盗まれた物の回収率は高くありません。警察も、すべての窃盗を捜査できるわけではないと認めています。

それでも届け出る理由があります。**crime reference number（犯罪受理番号）** です。

この番号は、被害を受けたことの公的な記録です。そして英国の各種手続きは、この番号があることを前提に設計されています。

- **保険の請求**：これがない請求は受け付けられません
- **パスポートの再発給**：大使館が警察への届出を求めます
- **携帯電話の契約**：端末の盗難を申告する際に使います
- **銀行の不正利用の申立て**：求められることがあります

つまり届出は、**物を取り戻すための行為ではなく、そのあとの手続きを動かすための行為**です。ここを取り違えて「意味がない」と省いてしまうと、数日後に全部止まります。`,
  sections: [
    {
      id: "which-number",
      title: "999 と 101 とオンラインを使い分ける",
      subtitle: "終わったことを 999 にかけても、話が進まない",
      body: `日本語圏で最も知られていないのが **${EMERGENCY_CONTACTS.nonEmergency}** の存在です。「警察＝${EMERGENCY_CONTACTS.emergency}」だと思って電話し、緊急性がないと判断されて終わってしまう、という経験談をよく聞きます。

### 使い分けの基準は「いま危険か」

| 状況 | 連絡先 |
|---|---|
| 犯人がその場にいる／逃走中 | **${EMERGENCY_CONTACTS.emergency}** |
| けがをした、暴力を受けている | **${EMERGENCY_CONTACTS.emergency}** |
| 身に危険が迫っている | **${EMERGENCY_CONTACTS.emergency}** |
| 数時間前に盗まれた財布の届出 | **${EMERGENCY_CONTACTS.nonEmergency}** / オンライン |
| 帰宅したら部屋が荒らされていた（犯人はいない） | **${EMERGENCY_CONTACTS.nonEmergency}** / オンライン |
| 詐欺の被害に気づいた | **${FRAUD_REPORTING.serviceName}**（${EMERGENCY_CONTACTS.reportFraud}） |

判断の軸は被害の大きさではなく、**時間**です。「いま起きているか、もう終わったか」だけで決まります。100万円盗まれても、それが昨日のことなら ${EMERGENCY_CONTACTS.nonEmergency} です。

### 迷ったら 999 でいい

ただし、**判断に迷う状況で ${EMERGENCY_CONTACTS.emergency} にかけることを躊躇しないでください**。オペレーターが適切な窓口に振り分けてくれます。「緊急でなかったらどうしよう」と考えて通報をやめるほうが、はるかに悪い結果になります。

### オンラインが一番ラクなことが多い

英語での電話に不安があるなら、**オンライン通報を選んでください**。

- 24時間いつでも出せる
- 文章を推敲できる（翻訳ツールも使える）
- 聞き返される緊張がない
- 記録が手元に残る

すでに終わった盗難であれば、オンラインで十分です。ロンドン警視庁の[通報ページ](${POLICE_REPORT.metOnlineUrl})から手続きできます。`,
      callout: {
        tone: "info",
        title: "犯罪ではない落とし物は、窓口が違います",
        body: `置き忘れや紛失は犯罪ではないため、盗難の通報とは別の窓口になります。ロンドン警視庁の[落とし物の窓口](${POLICE_REPORT.metLostPropertyUrl})、あるいは交通機関の遺失物センターが担当です。

地下鉄やバスでの置き忘れは、警察ではなく TfL です。詳しくは[落とし物を探す](/trouble/lost-property)を参照してください。`,
      },
    },
    {
      id: "what-to-prepare",
      title: "通報の前に用意するもの",
      subtitle: "聞かれることは決まっている",
      body: `通報で聞かれる内容はほぼ定型です。**先にメモを作っておくと、通報そのものが短く終わります**。

### まとめておく情報

- **いつ**：日付と、おおよその時刻（「14時から14時半の間」で十分）
- **どこで**：通り名、駅名、店名。分からなければ最寄りの目印
- **何が**：盗まれた物のリスト
- **いくら分**：おおよその金額（正確でなくてよい）
- **どうやって**：気づいた経緯、犯人の特徴（見ていれば）

### 被害品リストの書き方

金額の大きい順に書いてください。保険請求のときに同じリストを使うので、**この時点で作り込んでおくと二度手間が減ります**。

| 品目 | 特徴 | おおよその価値 |
|---|---|---|
| スマートフォン | 機種、色、IMEI があれば | 購入時の価格 |
| 財布 | ブランド、色、中身 | |
| カード類 | 銀行名、枚数 | |
| 現金 | 通貨と金額 | |

**IMEI 番号**（端末固有の番号）が分かると、スマートフォンの照会に使えます。箱や購入時のメールに記載があります。

### 英語が不安な場合

**通訳を頼めます**。電話がつながったら「I need a Japanese interpreter」と伝えてください。費用は自己負担ではありません。

オンラインなら翻訳ツールを使って構いません。**完璧な英語である必要はなく、事実が伝われば十分**です。`,
      tips: [
        "被害に遭った場所の写真を撮っておくと、状況の説明が早い",
        "目撃者がいたら、連絡先を聞いておく",
        "防犯カメラがありそうな場所（店の軒先、駅構内）は、その旨を伝えると捜査の手がかりになる",
      ],
    },
    {
      id: "crime-reference-number",
      title: "crime reference number を受け取る",
      subtitle: "通報した瞬間には出ないことがある",
      body: `ここで多くの人がつまずきます。**通報した直後に番号がもらえるとは限りません。**

オンラインで通報した場合、まず出るのは「報告を受け付けた」という参照番号です。その報告が警察内部で審査され、**正式な犯罪報告（crime report）として受理された段階で crime reference number が発行されます**。

目安は**${POLICE_REPORT.responseHours}時間以内**に警察から連絡が来る、という運用です。番号は書面やメールで通知されます。

### 受け取ったらやること

1. **写真に撮る**（紙をなくすと面倒です）
2. **クラウドに保存する**（メールで自分に送るだけでも十分）
3. **保険会社に伝える**
4. **携帯会社に伝える**（端末を盗まれた場合）
5. **大使館に伝える**（パスポートを盗まれた場合）

### 連絡が来ない場合

${POLICE_REPORT.responseHours}時間を過ぎても連絡がないなら、**${EMERGENCY_CONTACTS.nonEmergency} に電話して確認してください**。オンライン通報の参照番号を伝えれば、状況を調べてもらえます。

保険には請求期限があるので、**待ちすぎないこと**が重要です。「連絡を待っていたら期限を過ぎた」は通用しません。

### 通報は無料です

念のため書いておくと、**警察への通報も、番号の発行も${POLICE_REPORT.cost}です**。オンライン・電話・窓口のどれでも変わりません。

「crime reference number の取得にお金がかかる」という誤解が流布していますが、事実ではありません。**費用を請求されたら、それ自体が詐欺を疑うべき状況です。**`,
      callout: {
        tone: "warn",
        title: "保険の請求期限に注意してください",
        body: `多くの保険が「被害から24時間以内に警察へ届け出ること」「一定日数以内に保険会社へ連絡すること」を条件にしています。

**警察の番号が出るのを待ってから保険会社に連絡する、という順番だと間に合わないことがあります**。先に保険会社へ「被害に遭い、警察に通報済み。受理番号は追って連絡する」と伝えておいてください。これで期限の問題はほぼ回避できます。`,
      },
    },
    {
      id: "fraud",
      title: "詐欺の場合は窓口が違う",
      subtitle: `${FRAUD_REPORTING.serviceName} と 159`,
      body: `**詐欺（fraud）は、通常の窃盗とは別の窓口**が担当します。${FRAUD_REPORTING.coverage}では **${FRAUD_REPORTING.serviceName}** が受け付けています。

電話：**${EMERGENCY_CONTACTS.reportFraud}**
サイト：[${FRAUD_REPORTING.url}](${FRAUD_REPORTING.url})

### 名称が変わっています（${FRAUD_REPORTING.formerName} → ${FRAUD_REPORTING.serviceName}）

${FRAUD_REPORTING.replacedOn}に、それまでの **${FRAUD_REPORTING.formerName}** が **${FRAUD_REPORTING.serviceName}** に置き換わりました（運営は ${FRAUD_REPORTING.operator}）。

日本語で書かれた情報はまだ旧名のものが大半なので、検索して ${FRAUD_REPORTING.formerName} にたどり着いても心配は要りません。**電話番号は変わっておらず**、旧サイトも新サイトに転送されます。

**スコットランドは対象外**です。スコットランドでの被害は **${FRAUD_REPORTING.scotland}** に通報してください。

### 159 という短縮番号

銀行を名乗る電話やSMSを受けたとき、**いったん切って ${EMERGENCY_CONTACTS.bankFraud} にかけ直してください**。これは主要銀行が参加する仕組みで、自分の銀行の詐欺対応窓口に安全につながります。

日本語圏ではほとんど知られていませんが、**知っているかどうかで結果が変わる番号**です。

### 覚えておく原則

- 銀行が**暗証番号やパスワードの全体を聞くことはありません**
- 銀行が「**安全な口座に資金を移してください**」と言うことはありません
- 警察が「**捜査協力のためにお金を引き出してください**」と言うことはありません

これらはすべて詐欺の典型的な文句です。ひとつでも当てはまったら、**その場で電話を切ってください**。失礼を気にする場面ではありません。

### かけ直すときの注意

**同じ端末でかけ直すと、相手が回線を保持していることがあります**（かけ直したつもりが同じ詐欺犯につながる、という手口）。可能なら別の端末を使い、それが無理なら**10分ほど待ってから**かけてください。`,
      tips: [
        "詐欺の被害に遭ったら、まず銀行に連絡して取引の停止を依頼する",
        "やり取りのSMS・メール・画面は消さずに保存する。証拠になる",
        `スコットランドでは、詐欺の通報先が ${FRAUD_REPORTING.scotland} になる`,
      ],
    },
    {
      id: "at-the-station",
      title: "警察署の窓口に行く場合",
      subtitle: "行く前に、開いているかを確認する",
      body: `対面で相談したい場合は警察署（police station）の窓口に行けますが、**注意点が2つあります**。

### すべての警察署に窓口があるわけではない

一般向けの受付（front counter）を持つ警察署は限られており、開いている時間も署によって違います。**行く前に必ず確認してください**。ロンドン警視庁のサイトで、窓口のある署と受付時間を調べられます。

### オンラインのほうが早いことが多い

窓口は待ち時間が長くなりがちです。**すでに終わった盗難の届出であれば、オンラインのほうが早く確実**です。対面が要るのは、相談が複雑な場合や、証拠物を渡す必要がある場合に限られます。

### 窓口に行く価値がある場面

- 身の安全に関わる相談をしたい
- 継続的な被害（つきまとい、嫌がらせ）について相談したい
- オンラインで通報したが対応が進まない
- 書面での証明が急ぎで必要

### 持っていくもの

- 身分証明書（パスポート、BRP など）
- 被害の内容をまとめたメモ
- すでに通報済みなら、その参照番号

**日本語の通訳が必要なら、窓口でもその旨を伝えてください**。手配されるまで時間がかかることがあるので、可能なら事前に電話で伝えておくとスムーズです。`,
    },
  ],
  faq: [
    {
      question: "警察に届け出るのにお金はかかりますか？",
      answer: `**かかりません**。オンライン・電話・窓口のいずれも${POLICE_REPORT.cost}で、crime reference number の発行にも費用はかかりません。手数料を請求されるようなことがあれば、それ自体が詐欺を疑うべき状況です。`,
    },
    {
      question: "crime reference number はいつもらえますか？",
      answer: `**通報した直後とは限りません**。オンライン通報ではまず受付の参照番号が出て、報告が正式な犯罪報告として受理された段階で crime reference number が発行されます。目安として${POLICE_REPORT.responseHours}時間以内に警察から連絡が来ます。過ぎても連絡がなければ、${EMERGENCY_CONTACTS.nonEmergency} に確認してください。`,
    },
    {
      question: "英語が話せません。通報できますか？",
      answer:
        "**できます**。電話では通訳を依頼でき、費用は自己負担ではありません。「I need a Japanese interpreter」と伝えてください。また、すでに終わった被害であればオンライン通報が使えます。文章を推敲でき、翻訳ツールも使えるので、電話より負担が小さいことが多いです。",
    },
    {
      question: "旅行者ですが、帰国後に保険を請求したい場合はどうしますか？",
      answer:
        "**滞在中に必ず届け出てください**。帰国後に英国の警察へ遡って届け出るのは非常に困難で、保険請求に必要な番号を取得できなくなる可能性があります。帰国日が迫っていても、オンラインなら数十分で出せます。",
    },
    {
      question: "届け出ても捜査してもらえないと聞きました。意味がありますか？",
      answer:
        "**手続きのために意味があります**。すべての窃盗が捜査されるわけではないのは事実ですが、crime reference number は保険請求・パスポート再発給・携帯会社への申告の前提になります。物の回収ではなく、そのあとの手続きを動かすために届け出ると考えてください。",
    },
    {
      question: "詐欺に遭いました。101 でいいですか？",
      answer: `**詐欺は ${FRAUD_REPORTING.serviceName}（${EMERGENCY_CONTACTS.reportFraud}）が窓口です**。${FRAUD_REPORTING.replacedOn}に ${FRAUD_REPORTING.formerName} から名称が変わりましたが、番号は同じで旧サイトも転送されます。対象は${FRAUD_REPORTING.coverage}で、スコットランドは ${FRAUD_REPORTING.scotland} です。また、銀行を名乗る不審な連絡を受けたら、いったん切って **${EMERGENCY_CONTACTS.bankFraud}** にかけ直してください。自分の銀行の詐欺対応窓口に安全につながります。`,
    },
  ],
  sources: [...TROUBLE_SOURCES],
  relatedLinks: [
    {
      href: "/trouble/pickpocket",
      label: "スリ・ひったくりに遭った直後にやること",
    },
    { href: "/trouble/lost-passport", label: "パスポートを失くした・盗まれた" },
    {
      href: "/trouble/lost-property",
      label: "落とし物を探す（地下鉄・バス・タクシー）",
    },
  ],
};

export default policeReport;
