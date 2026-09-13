import type { BillsGuideArticle } from "../types";
import {
  BILLS_AS_OF,
  BILLS_SOURCES,
  BILLS_UPDATED_AT,
  TV_LICENCE,
  gbp,
} from "@/lib/bills/rates";

const tvLicence: BillsGuideArticle = {
  slug: "tv-licence",
  title: "TV Licence（テレビ受信料）は必要か｜テレビがなくても要る人、要らない人",
  engTitle: "Do You Need a TV Licence?",
  audience:
    "テレビを持っていないのに TV Licensing から手紙が届いた人、Netflix や BBC iPlayer を見るなら必要か迷っている人",
  summary: `必要かどうかは、テレビを持っているかではなく、何を見るかで決まります。放送中の番組をリアルタイムで見るか、BBC iPlayer を使うなら必要で、年${gbp(
    TV_LICENCE.annual
  )}です。Netflix などのオンデマンド配信だけなら要りません。要らない人は、申告すれば手紙は止まります。`,
  description: `イギリスの TV Licence（テレビ受信料）が必要かを解説。年${gbp(
    TV_LICENCE.annual
  )}（${TV_LICENCE.since}〜）、必要になる視聴（ライブ放送・BBC iPlayer）と不要な視聴（Netflix 等のオンデマンド）、テレビがない人に届く手紙への対応、シェアハウスでの扱い、支払い方法、罰金の上限${gbp(
    TV_LICENCE.maxFine
  )}まで。`,
  keywords: [
    "TV Licence 必要",
    "イギリス テレビ受信料",
    "TV licence いくら",
    "TV licence Netflix",
    "BBC iPlayer licence",
    "TV Licensing 手紙",
    "no licence needed",
  ],
  dataAsOf: BILLS_AS_OF,
  updatedAt: BILLS_UPDATED_AT,
  atAGlance: [
    { label: "料金", value: `年${gbp(TV_LICENCE.annual)}（${TV_LICENCE.since}〜）` },
    {
      label: "必要になる",
      value: "放送中の番組を**リアルタイムで**見る・録画する（機器もチャンネルも問わない）／**BBC iPlayer** を使う",
    },
    {
      label: "要らない",
      value: "Netflix などの**オンデマンド配信だけ**（iPlayer 以外）",
    },
    {
      label: "テレビがない人",
      value: "手紙が届き続けるので、**要らないと申告**する",
    },
    { label: "無許可の視聴", value: `罰金は最大${gbp(TV_LICENCE.maxFine)}` },
  ],
  mainText: `TV Licence は、BBC などの公共放送を支える受信料です。日本の NHK の受信料と違うのは、**判定の基準が「受信機を置いているか」ではなく「何を見るか」** だという点です。

- テレビを持っていても、**放送を一切見ない** なら要りません
- テレビを持っていなくても、**スマホやパソコンでライブ放送や BBC iPlayer を見る** なら要ります

年額は${gbp(TV_LICENCE.annual)}です。1世帯（1つの住居）に1つが基本ですが、シェアハウスでは契約の形によって部屋ごとに必要になることがあります。`,
  sections: [
    {
      id: "do-you-need",
      title: "必要かどうかは「何を見るか」",
      navLabel: "必要か",
      subtitle: "機器は関係ない",
      body: `### 必要になる

- **放送中の番組をリアルタイムで見る・録画する。** どのチャンネルでも、どの機器（テレビ・パソコン・スマホ・タブレット・ゲーム機）でも
- **配信サービスでライブ放送を見る。** 地上波チャンネルのライブ視聴、スポーツ中継のライブ配信など。Netflix や Amazon Prime Video などでも、**ライブで配信されているもの** を見るなら該当する
- **BBC iPlayer を使う。** ライブでも見逃し配信でも必要

### 要らない

- **BBC iPlayer 以外のオンデマンド配信だけ** を見る（Netflix・Disney+ などの録画済みの作品、各局の見逃し配信）
- YouTube などの動画を見る（ライブのテレビ放送を流しているものを除く）
- テレビを DVD やゲームの画面としてだけ使う

### 判断の目安

**「いま放送・配信されているものを同時に見ているか」と「BBC iPlayer を開いているか」** の2つで判断してください。どちらもなければ、機器をいくつ持っていても不要です。`,
      tips: [
        "サッカーなどスポーツのライブ配信は、配信サービス経由でもライブ視聴にあたる。",
        "BBC iPlayer は見逃し配信だけでも必要。ここがいちばん誤解されやすい。",
      ],
    },
    {
      id: "letters",
      title: "テレビがない人に届く手紙",
      navLabel: "届く手紙",
      subtitle: "無視せず、要らないと申告する",
      body: `TV Licence が登録されていない住所には、**TV Licensing から手紙が繰り返し届きます。** 文面は回を追うごとに強くなり、「調査」「訪問」といった言葉が並びます。

必要のない人がやることは1つです。

### 「要らない」と申告する

TV Licensing のサイトから、**No Licence Needed** の申告をします。住所と名前を入れ、ライブ放送も iPlayer も見ていないことを申告すれば、手紙は止まります。

- 申告は無料で、数分で終わる
- しばらく経つと、状況が変わっていないかの確認が来ることがある。そのときは改めて申告する
- 申告の内容を確かめるために、担当者が訪問してくることがある

### 訪問を受けたら

訪問してくる担当者に、**令状なしで家に入る権限はありません。** 中に入れるかどうかは住人が決められます。見ていないのであれば、そのことを伝えれば足ります。

ただし、実際にライブ放送や iPlayer を見ているのに「見ていない」と申告するのは虚偽です。見るなら払ってください。`,
      callout: {
        tone: "warn",
        title: "受信料の支払いを装った詐欺メールに注意",
        body: "「TV Licence の支払いに失敗しました」「返金があります」とカード情報を入力させる偽メールや SMS が大量に出回っています。TV Licensing からのメールにあるリンクは押さず、自分で公式サイトを開いて確認してください。",
      },
    },
    {
      id: "shared-homes",
      title: "シェアハウスと学生寮",
      navLabel: "シェアの場合",
      subtitle: "契約の形で、1つで足りるかが変わる",
      body: `TV Licence は原則として **住居ごと** に必要です。シェアハウスでは契約の形で扱いが変わります。

### 1つの契約で1軒を借りている（joint tenancy）

住人全員で1軒を借りている場合、**1つの TV Licence で家全体をカバー** できます。誰の名義で払うか、どう割るかは住人同士で決めます。

### 部屋ごとに別々の契約（room-only）

部屋ごとに契約が分かれていて、**自分の部屋で** ライブ放送や iPlayer を見るなら、**その部屋の人が自分の TV Licence を持つ** 必要があります。共用のリビングで見るだけなら、家全体の1つで足ります。

### 学生寮

学生寮の自室で見るなら、**自分の TV Licence が必要** です。寮の共用ラウンジのテレビは、寮側が契約していることが多いです。`,
    },
    {
      id: "paying",
      title: "払い方と、引っ越し・帰国",
      navLabel: "払い方",
      subtitle: "月払いの初年度は割高に見える",
      body: `### 支払い方法

| 方法 | 内容 |
|---|---|
| 年払い | ${gbp(TV_LICENCE.annual)}を一括で払う |
| 月払い（Direct Debit） | **初年度は6か月で1年分を払う**ので月${gbp(
        TV_LICENCE.monthlyFirstYear
      )}。2年目からは月${gbp(TV_LICENCE.monthlyFromYearTwo)} |

月払いの初年度が高いのは、**1年分を前払いする仕組み** だからです。損をしているわけではありません。2年目以降は、有効期間と支払いが並走する形になります。

### 引っ越すとき

TV Licence は住所に紐づいています。引っ越したら **住所を変更** してください。そのまま新しい住所で有効になります。

### 帰国するとき・要らなくなったとき

解約を届け出てください。**使っていない期間が残っていれば、払い戻しを申請できます。** 帰国の日付と、今後英国で見る予定がないことを伝えます。`,
      tips: [
        "引っ越しのときは解約ではなく住所変更。新しい家で改めて買う必要はない。",
        "帰国時は解約と払い戻しの申請を忘れずに。年払いなら残りの期間分が戻る可能性がある。",
      ],
    },
    {
      id: "penalty",
      title: "払わずに見るとどうなるか",
      navLabel: "罰金",
      subtitle: `最大${gbp(TV_LICENCE.maxFine)}`,
      body: `TV Licence が必要な視聴を無許可で続けると、**刑事手続きの対象** になります。

- 罰金は **最大${gbp(TV_LICENCE.maxFine)}**（イングランド・ウェールズ）。これに裁判費用が加わることがある
- 罰金を払っても、**その後も見るなら TV Licence を買う必要** がある

「ばれない」と考える人がいますが、手紙と訪問は未登録の住所に機械的に届き続けます。見るなら払う、見ないなら申告する。どちらかにしておけば、何も起きません。`,
    },
  ],
  faq: [
    {
      question: "テレビを持っていなくても TV Licence は必要ですか。",
      answer:
        "スマホやパソコンでライブ放送を見たり、BBC iPlayer を使ったりするなら必要です。どちらもしないなら不要で、テレビの有無は関係ありません。不要な場合は TV Licensing のサイトで No Licence Needed の申告をしてください。",
    },
    {
      question: "Netflix だけ見るなら TV Licence は要りますか。",
      answer:
        "オンデマンドの作品を見るだけなら要りません。ただし Netflix や Amazon Prime Video でも、スポーツ中継などライブで配信されているものを見る場合は必要です。BBC iPlayer は見逃し配信だけでも必要です。",
    },
    {
      question: "TV Licence はいくらですか。",
      answer: `年${gbp(TV_LICENCE.annual)}です（${TV_LICENCE.since}から）。月払いにすると、初年度は6か月で1年分を払うため月${gbp(
        TV_LICENCE.monthlyFirstYear
      )}、2年目からは月${gbp(TV_LICENCE.monthlyFromYearTwo)}になります。`,
    },
    {
      question: "シェアハウスでは1人ずつ必要ですか。",
      answer:
        "1つの契約で1軒を借りているなら、1つで家全体をカバーできます。部屋ごとに別々の契約で借りていて、自分の部屋で見るなら、その部屋の人が自分の TV Licence を持つ必要があります。",
    },
    {
      question: "TV Licensing の担当者が家に来たら、入れないといけませんか。",
      answer:
        "令状なしで家に入る権限はないので、入れるかどうかは住人が決められます。見ていないならその旨を伝え、まだなら No Licence Needed の申告をしてください。",
    },
  ],
  sources: [...BILLS_SOURCES.tvLicence],
  relatedLinks: [
    { href: "/bills/bills-included", label: "「bills included」の中身と家賃の比べ方" },
    { href: "/bills/broadband", label: "ネット回線（入居前に申し込む理由）" },
    { href: "/trouble/scams", label: "詐欺の手口と対処" },
  ],
};

export default tvLicence;
