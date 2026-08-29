import { VISA_FEES, VISA_KEY_DATES, gbp, jpDate } from "@/lib/visa/rates";
import { TRAVEL_GUIDE_AS_OF, TRAVEL_GUIDE_UPDATED_AT } from "../guides";
import type { TravelGuideMetaSource } from "../guides";
import type { GuideFaqItem, GuideRelatedLink, GuideSourceLink } from "@/components/guides/types";

/**
 * ETA 記事の中身。
 *
 * ほかの旅行ガイドと違い、この記事は「読み物」ではなく「作業手順書」。
 * 読者はこのページを開いたまま片手でスマホを操作する。だから
 * TravelGuideLayout(markdown を9枚の同じカードに流す)には載せていない。
 * あの形だと、10秒で終わる判定(必要か否か)と、詰まったときだけ引く
 * 対訳表と、実際に手を動かす6ステップが、すべて同じ見た目になる。
 *
 * ここでは読み方の違う3種類を別々の型に分けている:
 *   verdict / transit … 一度読んで終わる判定
 *   checklist / steps … 手を動かしながら追う手順
 *   glossary / trouble … 詰まったときだけ引く参照
 * セクションの並びは実際の申請フロー順から動かさないこと。
 *
 * 手数料と改定日は lib/visa/rates.ts で一元管理している。
 * この記事は同じ金額を何箇所も繰り返すため、べた書きすると改定時に
 * 必ず取りこぼす(旧 /visa/uk-visa-guide-2025 で実際に起きた)。
 * 金額を書くときは gbp(VISA_FEES.eta) を使うこと。
 *
 * 数字の出所(2026年8月時点、すべて gov.uk で確認):
 * - 2026年2月25日に全面施行。猶予期間は終了済み。
 * - エアサイド乗継の免除は Home Office が「暫定・見直し対象」と明言。
 *   恒久措置ではないので、断定的に「不要」と書かない。
 *
 * アプリの画面文言は英語のみ(日本語表示なし)。glossary が
 * このページの存在意義なので、UI 文言を変える改修時は必ず実機で確認すること。
 */

/* ------------------------------------------------------------------ */
/* メタ情報                                                            */
/* ------------------------------------------------------------------ */

export const etaMeta: TravelGuideMetaSource & {
  engTitle: string;
  summary: string;
  dataAsOf: string;
} = {
  slug: "eta-uk-visa-guide",
  title:
    "イギリスETA申請ガイド｜アプリ画面の日本語対訳と6ステップの手順（2026年版）",
  engTitle: "UK Electronic Travel Authorisation (ETA)",
  summary:
    "日本のパスポートでイギリスに行くには ETA が必須です。2026年2月25日から全面施行され、ETA がないと空港で搭乗を断られます。このページは、公式アプリの英語画面を1画面ずつ日本語に訳しながら、申請を最後まで終わらせるための手順書です。",
  description: `イギリスETA（電子渡航認証）の申請方法を、公式アプリの英語画面の日本語対訳付きで解説。費用${gbp(VISA_FEES.eta)}、6ステップの申請手順、ICチップが読めない・自撮りが弾かれる・決済が通らないときの対処法、犯罪歴などの質問項目の答え方、乗り継ぎだけの場合の扱い、却下されたときの対応まで。2026年8月時点の最新情報。`,
  keywords: [
    "イギリス ETA",
    "ETA 申請方法",
    "英国 電子渡航認証",
    "ETA アプリ 日本語",
    "ETA 費用",
    "イギリス 入国",
    "ETA 乗り継ぎ",
    "ETA 却下",
    "UK ETA 申請",
  ],
  dataAsOf: TRAVEL_GUIDE_AS_OF,
  updatedAt: TRAVEL_GUIDE_UPDATED_AT,
};

/** 冒頭のリード。ここだけは markdown で持つ(強調が要るため)。 */
export const etaLead = `**日本国籍でイギリスを訪れるなら、出発前に ETA（電子渡航認証）が要ります**。無いと、イギリスに着く前に日本の空港で搭乗を断られます。${jpDate(VISA_KEY_DATES.etaFullyEnforcedFrom)}に猶予期間が終わり、「ETA がなければ乗せない」が航空会社に義務づけられました。「現地で何とかなる」「申請中でも乗れる」は、もう通用しません。

ただし申請自体は難しくありません。詰まるとしたら、いつも同じ5箇所です。`;

/** リード直後に出す「躓きどころ」。それぞれ対処の節へ飛ばす。 */
export const etaSnags: { label: string; href: string }[] = [
  { label: "アプリが英語だけ", href: "#glossary" },
  { label: "ICチップが読めない", href: "#trouble" },
  { label: "自撮りが弾かれる", href: "#trouble" },
  { label: "カード決済が通らない", href: "#trouble" },
  { label: "途中保存されない", href: "#checklist" },
];

/* ------------------------------------------------------------------ */
/* 数字4つ                                                             */
/* ------------------------------------------------------------------ */

export type EtaFact = { label: string; value: string; note: string };

/**
 * 本文を読む前に目に入れる4つ。
 * 「いくら・どのくらいかかる・いつまで使える・いつまでに出す」で、
 * 読者が最初に検索する4項目に対応させている。
 */
export const etaFacts: EtaFact[] = [
  { label: "費用", value: gbp(VISA_FEES.eta), note: "1人1件・返金不可" },
  { label: "所要", value: "約10分", note: "公式アプリの場合" },
  { label: "有効", value: "2年間", note: "1回の滞在は最長6ヶ月" },
  { label: "結果", value: "数分〜3営業日", note: "航空券を取ったらすぐ" },
];

/* ------------------------------------------------------------------ */
/* 1. 必要かどうか                                                     */
/* ------------------------------------------------------------------ */

export const etaVerdict = {
  /** 大多数の読者はここで終わる。だから断定形で1行に畳んである。 */
  headline: "日本のパスポートで6ヶ月以内の観光・出張・親族訪問なら、必要です",
  conditions: [
    "目的が観光・短期の学習・商用（就労は不可）・親族や友人の訪問",
    "滞在が6ヶ月以内",
    "赤ちゃんも子どもも1人ずつ必要（家族でまとめて1件にはできない）",
  ],
  scope: "使えるのは、イギリス本土・ジャージー島・ガーンジー島・マン島。",

  /** 不要な人。「代わりに何が要るか」まで書かないと結局迷う。 */
  exempt: [
    { who: "英国のビザ・滞在許可を持っている", instead: "そのビザ／滞在許可" },
    { who: "英国市民・アイルランド市民", instead: "各国のパスポート" },
    { who: "英国の永住権（ILR）を持っている", instead: "永住を証明する書類" },
    {
      who: "アイルランド居住者で、アイルランド・ジャージー・ガーンジー・マン島から入国",
      instead: "居住を証明する書類",
    },
  ],

  /** ETA では行けないケース。ここを外すと読者が別ビザに気づかない。 */
  outOfScope: {
    title: "ETA では行けないもの",
    items: ["働く", "6ヶ月を超えて滞在する", "正規の学位課程に通う"],
    body: "これらは ETA の対象外で、それぞれのビザが要ります。",
    linkHref: "/visa/uk-visa-guide",
    linkLabel: "渡航目的別のビザの選び方",
  },

  notes: [
    "ETA はビザではありません。渡航の事前許可であって、入国を保証するものではない。最終的な可否は現地の入国審査官が判断します。",
    "有効期間が2年でも、1回の入国で滞在できるのは最長6ヶ月です。2年続けて滞在できるという意味ではありません。",
    "日本国籍は入国時に eGate（自動化ゲート）を使えます。ETA があれば審査の列に並ばず通過できます。",
  ],

  callout: {
    tone: "warn" as const,
    title: "英国との二重国籍の方は、2026年2月からルールが変わりました",
    body: `英国市民に ETA は要りませんが、**それを証明する必要があります**。${jpDate(VISA_KEY_DATES.etaFullyEnforcedFrom)}以降、**有効な英国パスポート、または Certificate of Entitlement（居住権証明）** の提示が求められ、非英国パスポートだけでは入国できなくなりました。

失効した英国パスポート（1989年以降発行）と有効な第三国パスポートの組み合わせが暫定的に認められる場合がありますが、条件が細かく、恒久措置でもありません。該当する方は渡航前に必ず GOV.UK で最新の条件を確認してください。`,
  },
};

/* ------------------------------------------------------------------ */
/* 2. 乗り継ぎ                                                         */
/* ------------------------------------------------------------------ */

export type TransitCase = { situation: string; needed: boolean };

/**
 * 表ではなく判定カードで出す。
 * 読者が知りたいのは一覧の比較ではなく「自分はどっちか」だけなので、
 * 必要/不要のバッジを行頭に置いて、目で拾えるようにしている。
 */
export const etaTransit = {
  rule: "イギリスの入国審査（border control）を通るかどうか。それだけで決まります。",
  cases: [
    { situation: "入国審査を通らず、制限エリア（エアサイド）内だけで乗り継ぐ", needed: false },
    { situation: "入国審査を通る（パスポートを審査官に見せる）", needed: true },
    { situation: "預け荷物を一度受け取る", needed: true },
    { situation: "航空券が別発券で、荷物をスルーできない", needed: true },
    { situation: "ターミナル移動などで、いったん制限エリアの外に出る", needed: true },
  ] as TransitCase[],
  exemptionScope:
    "免除が使えるのは、ヒースローとマンチェスターで、かつ同じ空港からその日のうちに出発する便に乗り継ぐ場合です。",
  notes: [
    "別発券（例：日本→ロンドンとロンドン→パリを別々に予約）は、荷物を受け取り直すため入国審査を通ることが多く、必要になります。",
    `迷ったら取ってしまうのが安全です。${gbp(VISA_FEES.eta)}で2年間有効なので、乗り継ぎで使わなくても次の旅行に使えます。`,
    "航空会社によって案内が違うことがあります。不安なら予約した航空会社に「airside transit で border control を通るか」を直接確認してください。",
  ],
  callout: {
    tone: "warn" as const,
    title: "この免除は「暫定措置」です",
    body: "英国内務省はエアサイド乗り継ぎの免除について、**暫定的なもので見直しの対象**だと明言しています。数ヶ月先の旅行を準備している場合、この免除が続いている前提で計画しないでください。渡航直前に GOV.UK で再確認するか、最初から取得しておくのが安全です。",
  },
};

/* ------------------------------------------------------------------ */
/* 3. チェックリスト                                                   */
/* ------------------------------------------------------------------ */

export type ChecklistItem = { id: string; label: string; hint?: string };
export type ChecklistGroup = { id: string; label: string; items: ChecklistItem[] };

/**
 * markdown の `- [ ]` をやめて、実際に押せるチェックボックスにした。
 * remark-gfm のタスクリストは disabled のチェックボックスを吐くだけで、
 * 「出発前に手元を揃える」という本来の用途に使えなかった。
 */
export const etaChecklistWhy =
  "アプリは入力途中の内容を保存しません。パスポートが読めない、写真が撮れない、カードが通らない——どれで止まっても最初からやり直しです。始める前に全部揃えてください。";

export const etaChecklist: ChecklistGroup[] = [
  {
    id: "hand",
    label: "手元に用意するもの",
    items: [
      { id: "passport", label: "渡航に使う本物のパスポート", hint: "コピー・写真・データは不可" },
      { id: "email", label: "メールアドレス", hint: "その場で受信を確認できるもの" },
      {
        id: "pay",
        label: "支払い手段",
        hint: "Apple Pay / Google Pay / Visa / Mastercard / American Express / JCB",
      },
      { id: "room", label: "明るい部屋と、無地の壁", hint: "自撮り撮影に使います" },
    ],
  },
  {
    id: "phone",
    label: "スマホ側の準備",
    items: [
      { id: "os", label: "iPhone、または Android 12 以上" },
      { id: "nfc", label: "NFC がオンになっている", hint: "ICチップの読み取りに必須" },
      { id: "case", label: "スマホケースを外せる状態", hint: "厚いケースは読み取りを妨げます" },
      { id: "cover", label: "パスポートのカバーを外す" },
      { id: "signal", label: "通信が安定した場所にいる" },
    ],
  },
  {
    id: "time",
    label: "時間の余裕",
    items: [
      {
        id: "lead",
        label: "出発の3営業日前までに申請を済ませる",
        hint: "結果は数分で届くことがほとんどですが、最大3営業日かかる場合があります",
      },
    ],
  },
];

export const etaChecklistNotes = [
  "Android で NFC が見つからない場合は「設定 → 接続 → NFC と非接触型決済」を確認してください。一度も使ったことがないとオフのままのことがあります。",
  "家族全員分を申請するなら、全員のパスポートを先に集めておいてください。1人分ずつ最初からやり直すことになります。",
  "旅程や滞在先ホテルの情報は不要です。航空券やホテルが未確定でも申請できます。",
];

/* ------------------------------------------------------------------ */
/* 4. 6ステップ                                                        */
/* ------------------------------------------------------------------ */

export type EtaStep = {
  title: string;
  /** その画面に出る英語。読者が実機と照合するための見出し。 */
  screen: string;
  body: string;
  dos?: string[];
  /** 詰まりやすいステップだけ、対処の節へ直接飛ばす。 */
  link?: { href: string; label: string };
};

/**
 * このページの主役。
 * 以前は markdown の ### 見出しとしてカードの中に埋まっていて、
 * 一番手を動かす部分が一番目立たなかった。番号を振った独立カードにする。
 */
export const etaSteps: EtaStep[] = [
  {
    title: "パスポートの顔写真ページを撮影",
    screen: "Scan the photo page",
    body: "見開きの顔写真ページ全体が入るように撮ります。四隅、下部の機械読み取り部分（MRZ）、顔写真がすべて鮮明に写っている必要があります。",
    dos: [
      "反射を避けるため、真上からの照明は外す",
      "ページをしっかり開いて押さえる",
      "ぼやけていたら撮り直す",
    ],
  },
  {
    title: "ICチップの読み取り",
    screen: "Hold still / Chip detected",
    body: "パスポートにICチップのマーク（金色の四角い記号）があれば、この工程に進みます。",
    dos: [
      "スマホケースとパスポートカバーを外す",
      "パスポートを平らな机に置く",
      "スマホの上端をパスポートの中央あたりに当てる",
      "5〜10秒動かさずに待つ（音が鳴れば成功）",
    ],
    link: { href: "#trouble-chip", label: "読み取れないときの対処" },
  },
  {
    title: "顔スキャン",
    screen: "Scan your face",
    body: "スマホのカメラを自分の顔に向けたまま、スキャンが終わるまで待ちます。写真ではなく実在する人物であることの確認です。10歳未満の子どもはこの工程がありません。",
  },
  {
    title: "顔写真の撮影",
    screen: "Take a photo of your face",
    body: "申請者本人の写真を撮ります。何度でも撮り直せるので、納得できるまでやり直してください。",
    dos: [
      "無地の背景の前に立つ",
      "メガネ・帽子・マスクを外す",
      "口を閉じる（開いていると弾かれます）",
      "顔に影がかからないようにする",
    ],
    link: { href: "#trouble-selfie", label: "何度も弾かれるときの対処" },
  },
  {
    title: "質問への回答",
    screen: "Check your answers",
    body: "住所、職業、他に持っている国籍、犯罪歴などを聞かれます。18歳未満なら親または保護者の連絡先も。",
    link: { href: "#questions", label: "質問項目の答え方" },
  },
  {
    title: "支払い",
    screen: "Pay and submit",
    body: `${gbp(VISA_FEES.eta)}を支払います。金額は日本円換算でも表示されます。支払い後の返金はできません。`,
    link: { href: "#trouble-payment", label: "決済が通らないときの対処" },
  },
];

export const etaStepsIntro = {
  body: "申請方法は公式アプリと GOV.UK のウェブフォームの2つですが、アプリを強くおすすめします。パスポートのICチップを読み取って自動入力してくれるので、入力ミスによる却下リスクが下がります。",
  appName: "UK ETA",
  appPublisher: "UK Home Office",
};

export const etaStepsCallout = {
  tone: "tip" as const,
  title: "他人の分を申請することもできます",
  body: "子どもや、スマホ操作が苦手な家族の分を、あなたのスマホから申請できます。その場合、**顔スキャンと顔写真はその人本人のもの**を撮ってください。自分の顔で代用することはできません。",
};

/* ------------------------------------------------------------------ */
/* 5. 質問項目の答え方                                                 */
/* ------------------------------------------------------------------ */

export const etaQuestions = {
  asked: [
    "自宅の住所（日本の住所をローマ字で）",
    "職業・就業状況",
    "他に持っている国籍（ない場合は「なし」）",
    "犯罪歴（該当する場合は、罪状・判決日・受けた刑罰）",
    "18歳未満の場合は、親または保護者の連絡先",
  ],
  criminal: {
    title: "犯罪歴の質問",
    body: `該当がある場合は、隠さずに正確に申告してください。

虚偽の申告は、それ自体が却下の理由になります。さらに後から発覚した場合は、入国拒否や将来の英国渡航への影響につながります。**正直に申告したうえで却下される**より、**虚偽が発覚する**方がはるかに重い結果になります。

軽微な違反であれば、申告しても承認されることは珍しくありません。判断するのは申請者ではなく英国側です。`,
  },
  address: {
    title: "住所の書き方",
    body: "日本の住所は、英語式に小さい単位から書きます。",
    exampleJa: "東京都渋谷区神南1-2-3 ジャストマンション101",
    exampleEn: "101 Just Mansion, 1-2-3 Jinnan, Shibuya-ku, Tokyo",
  },
  notes: [
    "パスポート記載のローマ字表記と、入力する氏名の綴りを必ず一致させてください。ヘボン式の違い（例: OH と O）でも不一致になります。",
    "職業欄は正確に。学生なのに会社員と書くような食い違いは、後の入国審査で説明を求められる原因になります。",
    "回答に迷う項目があっても、空欄のまま進めないでください。判断できない場合は GOV.UK の該当ページを確認してから入力しましょう。",
  ],
};

/* ------------------------------------------------------------------ */
/* 6. 英語画面の対訳                                                   */
/* ------------------------------------------------------------------ */

export type GlossaryEntry = { en: string; ja: string };
export type GlossaryGroup = { id: string; label: string; entries: GlossaryEntry[] };

/**
 * このページの存在意義。
 *
 * 以前は GFM テーブル3枚で、MarkdownBody が min-w-[32rem] を掛けるため
 * スマホでは横スクロールしないと日本語側が読めなかった。アプリの前で
 * 詰まっている人が横スクロールしながら目的の行を探すことになる。
 * 検索できる縦積みのリストに変える。
 */
export const etaGlossary: GlossaryGroup[] = [
  {
    id: "passport",
    label: "パスポート・本人確認",
    entries: [
      { en: "Scan the photo page", ja: "顔写真ページを撮影" },
      { en: "Hold still", ja: "動かさないでください" },
      { en: "Chip detected", ja: "ICチップを認識しました" },
      { en: "We could not read your chip", ja: "チップを読み取れませんでした" },
      { en: "Enter details manually", ja: "手入力で進む" },
      { en: "Scan your face", ja: "顔をスキャン" },
      { en: "Take a photo of your face", ja: "顔写真を撮影" },
      { en: "Retake", ja: "撮り直す" },
      { en: "Photo does not meet requirements", ja: "写真が条件を満たしていません" },
    ],
  },
  {
    id: "form",
    label: "質問画面",
    entries: [
      { en: "Home address", ja: "自宅の住所" },
      { en: "Occupation / Employment status", ja: "職業／就業状況" },
      { en: "Employed", ja: "被雇用（会社員など）" },
      { en: "Self-employed", ja: "自営業" },
      { en: "Student", ja: "学生" },
      { en: "Retired", ja: "退職・年金生活" },
      { en: "Unemployed", ja: "無職" },
      { en: "Do you have any other nationalities?", ja: "他に国籍を持っていますか" },
      {
        en: "Have you ever been convicted of a criminal offence?",
        ja: "犯罪で有罪判決を受けたことがありますか",
      },
      { en: "Offence", ja: "罪状" },
      { en: "Date of conviction", ja: "有罪判決の日付" },
      { en: "Sentence received", ja: "受けた刑罰" },
      { en: "Parent or guardian details", ja: "親または保護者の情報（18歳未満）" },
    ],
  },
  {
    id: "common",
    label: "ボタン・確認画面",
    entries: [
      { en: "Continue", ja: "次へ" },
      { en: "Back", ja: "戻る" },
      { en: "Check your answers", ja: "回答内容の確認" },
      { en: "Change", ja: "修正する" },
      { en: "Declaration", ja: "申告（内容が真実であることの宣誓）" },
      { en: "I confirm the information is correct", ja: "記載内容が正しいことを確認します" },
      { en: "Pay and submit", ja: "支払って申請する" },
      { en: "Application submitted", ja: "申請が完了しました" },
      { en: "ETA reference number", ja: "ETA 参照番号（16桁）" },
    ],
  },
];

export const etaGlossaryCallout = {
  tone: "warn" as const,
  title: "「Continue」を押す前に必ず確認",
  body: "写真の品質が基準に届いていなくても、アプリは**そのまま先に進めてしまいます**。「Photo does not meet requirements」と出たら、押し切らずに **Retake（撮り直す）** を選んでください。ここで妥協すると、審査の遅れや却下につながります。",
};

/* ------------------------------------------------------------------ */
/* 7. つまずいたときの対処                                             */
/* ------------------------------------------------------------------ */

export type EtaSymptom = {
  /** ステップ側からアンカーで飛ばすので、id は変えないこと。 */
  id: string;
  symptom: string;
  /** 原因が1つに絞れるものだけ。憶測は書かない。 */
  cause?: string;
  fixes: string[];
  note?: string;
};

export const etaTrouble: EtaSymptom[] = [
  {
    id: "trouble-chip",
    symptom: "ICチップが読み取れない",
    cause: "ほとんどはスマホケースかパスポートカバーです",
    fixes: [
      "スマホケースを外す（最も多い原因）",
      "パスポートカバーを外す",
      "NFC がオンになっているか確認（設定 → 接続 → NFC）",
      "パスポートを平らな机に置く（手に持たない）",
      "スマホの上端をパスポートの中央に当てる",
      "5〜10秒、完全に静止させる",
      "表紙側でだめなら、顔写真ページに直接当ててみる",
      "それでもだめなら裏表紙の内側に当てる",
    ],
    note: "どうしても読めない場合、アプリはステップ1で撮影した写真から情報を読み取って先に進めます。読み取れなくても申請自体はできるので、諦めなくて大丈夫です。",
  },
  {
    id: "trouble-selfie",
    symptom: "自撮り写真が何度も弾かれる",
    cause: "原因はほぼ影です",
    fixes: [
      "自撮り用のフラッシュをオンにする（これで解決することが多い）",
      "口を閉じる（開いていると弾かれます）",
      "窓を背にしない（逆光になります）",
      "天井の照明の真下を避ける（顔に影が落ちます）",
      "無地の壁の前に立つ",
      "メガネ・帽子・マスクを外す",
    ],
    note: "納得できる写真が撮れるまで、何度でも撮り直せます。",
  },
  {
    id: "trouble-payment",
    symptom: "カード決済が通らない",
    fixes: [
      "Apple Pay または Google Pay に切り替える（これで通ることが多い）",
      "別のカードを試す",
      "カード会社の海外利用制限・不正検知を確認する",
      "JCB も使えます",
    ],
  },
  {
    id: "trouble-crash",
    symptom: "アプリが落ちた・固まった",
    cause: "入力内容は保存されていません",
    fixes: [
      "二重に課金されていないか確認する",
      "支払い完了メールが届いていないか確認する",
      "そのうえで、最初から申請し直す",
    ],
  },
];

export const etaTroubleCallout = {
  tone: "tip" as const,
  title: "アプリがどうしても動かないとき",
  body: "NFC 非対応の古い端末などでアプリが使えない場合は、**GOV.UK のウェブフォーム**からブラウザで申請できます。ICチップの自動読み取りがないぶん手入力が増えますが、申請自体は問題なく完了します。",
};

/* ------------------------------------------------------------------ */
/* 8. 申請したあと                                                     */
/* ------------------------------------------------------------------ */

export const etaAfter = {
  emails: [
    { when: "すぐ", what: "申請受付の確認メール" },
    { when: "数分〜最大3営業日", what: "審査結果のメール" },
  ],
  emailNote: "どちらにも16桁の ETA 参照番号が記載されています。",
  approved: [
    "ETA はパスポートに電子的に紐づきます。紙のビザやシールは発行されません",
    "入国審査や航空会社のシステムから自動的に照会されます",
    "結果メールは印刷するかスマホに保存して持参してください。システム照会がうまくいかない場合の備えになります",
  ],
  validity: [
    { label: "有効期間", value: "2年間、またはパスポートの有効期限までの短い方" },
    { label: "渡航回数", value: "有効期間中は何度でも" },
    { label: "1回の滞在", value: "最長6ヶ月" },
  ],
  bring: [
    { item: "申請に使ったのと同じパスポート", note: "これが最重要" },
    { item: "結果メールの控え" },
    { item: "復路の航空券、滞在先の情報", note: "求められることがあります" },
  ],
  callout: {
    tone: "warn" as const,
    title: "パスポートを更新したら、ETA を取り直してください",
    body: `**ETA は1つのパスポートにのみ紐づきます**。申請後にパスポートを更新した場合、古いパスポートの ETA は新しいパスポートでは使えず、${gbp(VISA_FEES.eta)}を払って取り直すことになります。複数の国籍・パスポートをお持ちの方は、**航空券の予約に使い、実際に渡航時に持参するパスポート**で申請してください。`,
  },
  nextLinks: [
    {
      href: "/visa/uk-visa-guide",
      label: "渡航目的別のビザの選び方",
      blurb: "就労・就学・6ヶ月を超える滞在は ETA の対象外です",
    },
    {
      href: "/visa/after-arrival",
      label: "入国後の手続きガイド",
      blurb: "eVisa アカウントの作成、BRP からの移行、住所登録の順序",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 9. 却下されたら                                                     */
/* ------------------------------------------------------------------ */

export const etaRejected = {
  first: "結果メールに却下の理由が記載されます。まずそこを読んでください。",
  reasons: [
    "入力内容の誤り（氏名の綴り、パスポート番号、生年月日）",
    "パスポートの有効期限切れ",
    "写真が要件を満たしていない",
    "申告内容と渡航目的の食い違い",
    "過去の入国拒否・強制退去・虚偽申告の履歴",
    "犯罪歴の内容",
  ],
  options: [
    {
      title: "再申請する",
      when: "入力ミスや写真の不備が原因なら",
      body: `修正して再申請できます。ただし${gbp(VISA_FEES.eta)}を再度支払う必要があり（最初の分は返金されません）、過去に ETA を却下されたことを申告する必要もあります。`,
    },
    {
      title: "Standard Visitor visa を申請する",
      when: "犯罪歴や過去の渡航履歴が理由なら",
      body: "ETA での承認は難しいことがあります。その場合は通常の訪問者ビザを申請することになります。費用も審査期間も ETA より大きくなるため、渡航予定に十分な余裕を持って動いてください。",
    },
  ],
  notes: [
    "手数料は審査に対する対価なので、却下されても返金されません。だからこそ、送信前に入力内容を必ず見直してください。",
    "却下理由が理解できない場合、UKVI の ETA サポート（ウェブチャット）に問い合わせられます。",
    "出発が近い状況で却下された場合は、航空券の変更・キャンセル規定も早めに確認しておきましょう。",
  ],
};

/* ------------------------------------------------------------------ */
/* 10. 公式サイト                                                      */
/* ------------------------------------------------------------------ */

export const etaOfficial = {
  warning: `「イギリス ETA 申請」で検索すると、公式ではない代行サイトが多数表示されます。見た目は公式そっくりですが、${gbp(VISA_FEES.eta)}に数十ポンドの手数料を上乗せして請求してきます。`,
  channels: [
    { label: "公式サイト", value: "gov.uk/eta", href: "https://www.gov.uk/eta" },
    {
      label: "公式アプリ",
      value: "UK ETA",
      note: "App Store / Google Play・提供元は UK Home Office",
    },
  ],
  redFlags: [
    "URL が gov.uk で終わっていない（.com、.org、uk-eta-… など）",
    `${gbp(VISA_FEES.eta)}より高い金額が表示される`,
    "「至急対応」「特急手配」などの追加オプションを勧めてくる",
    "アプリストアの提供元が UK Home Office ではない",
  ],
  closing: "手続き自体は自分で10分で終わります。代行にお金を払う理由はありません。",
  callout: {
    tone: "warn" as const,
    title: `料金が${gbp(VISA_FEES.eta)}でなければ、そこは公式ではありません`,
    body: `2026年8月時点の正規の手数料は **${gbp(VISA_FEES.eta)}ちょうど** です（${jpDate(VISA_KEY_DATES.feeRevision)}に${gbp(VISA_FEES.etaPrevious)}から改定されました）。それ以外の金額を請求された時点で、公式ではないと判断して問題ありません。`,
  },
};

/* ------------------------------------------------------------------ */
/* セクション一覧（目次・スクロール追従ナビ・アンカー）                */
/* ------------------------------------------------------------------ */

/**
 * ページ内ナビの並び。id は各セクションの DOM id と一致させること。
 * navLabel はスマホの追従ナビに出すので、必ず短くする。
 */
export const etaSections = [
  { id: "who-needs", label: "あなたに ETA は必要か", navLabel: "必要か" },
  { id: "transit", label: "乗り継ぎだけの場合", navLabel: "乗り継ぎ" },
  { id: "checklist", label: "申請前チェックリスト", navLabel: "準備" },
  { id: "steps", label: "申請6ステップ", navLabel: "6ステップ" },
  { id: "questions", label: "質問項目の答え方", navLabel: "質問" },
  { id: "glossary", label: "アプリの英語画面 日本語対訳", navLabel: "英語対訳" },
  { id: "trouble", label: "つまずいたときの対処", navLabel: "対処" },
  { id: "after", label: "申請したあと", navLabel: "申請後" },
  { id: "rejected", label: "却下されたら", navLabel: "却下" },
  { id: "official-only", label: "申請は必ず公式から", navLabel: "公式" },
] as const;

/* ------------------------------------------------------------------ */
/* FAQ・出典・関連                                                     */
/* ------------------------------------------------------------------ */

export const etaFaq: GuideFaqItem[] = [
  {
    question: "ETA はいつまでに申請すればいいですか？",
    answer: `**航空券を予約したらすぐ**が最も安全です。結果は数分で届くことが多いものの、**最大3営業日**かかる場合があります。${jpDate(VISA_KEY_DATES.etaFullyEnforcedFrom)}から「ETA がなければ搭乗させない」が航空会社に義務づけられているため、申請中の状態では飛行機に乗れません。`,
  },
  {
    question: "費用はいくらですか？子どもも必要ですか？",
    answer: `**${gbp(VISA_FEES.eta)}**です（2026年8月時点）。${jpDate(VISA_KEY_DATES.feeRevision)}に${gbp(VISA_FEES.etaPrevious)}から改定されました。**年齢に関係なく1人1件必要**で、赤ちゃんも同額です。家族4人なら${gbp(VISA_FEES.eta * 4)}になります。支払い後の**返金はできません**。`,
  },
  {
    question: "ヒースローで乗り継ぐだけでも ETA は必要ですか？",
    answer:
      "**イギリスの入国審査を通るかどうか**で決まります。制限エリア（エアサイド）から出ずに乗り継ぐなら当面は不要ですが、入国審査を通る、預け荷物を受け取る、別発券である、ターミナル移動で外に出る——いずれかに当てはまれば**必要**です。なおこの免除は英国内務省が**暫定措置**としており、見直される可能性があります。迷ったら取得しておくのが安全です。詳しくは[乗り継ぎの項](#transit)をご覧ください。",
  },
  {
    question: "申請アプリは日本語で使えますか？",
    answer:
      "**いいえ、英語のみです**。日本語表示への切り替えはできません。ただし入力する内容は住所・職業・国籍など定型的なもので、英語力そのものはほとんど問われません。このページの[英語画面 日本語対訳](#glossary)を見ながら進めれば完了できます。",
  },
  {
    question: "パスポートのICチップが読み取れません",
    answer:
      "**スマホケースとパスポートカバーを外す**のが最も効果的です。次に NFC がオンかを確認し、パスポートを平らな机に置いて、スマホの上端を中央に当てて5〜10秒静止させてください。それでも読めない場合、アプリは撮影した写真から情報を読み取って先に進めるので、申請自体は完了できます。",
  },
  {
    question: "ETA を取れば必ず入国できますか？",
    answer:
      "**いいえ**。ETA は渡航のための事前許可であって、入国を保証するものではありません。最終的な判断は現地の入国審査官が行います。復路の航空券や滞在先の情報を求められることがあるため、すぐ提示できるようにしておきましょう。",
  },
  {
    question: "ETA を取ったあとにパスポートを更新しました。使えますか？",
    answer: `**使えません**。ETA は1つのパスポートに紐づいているため、${gbp(VISA_FEES.eta)}を払って取り直す必要があります。渡航前にパスポートを更新する予定があるなら、**更新後の新しいパスポートで申請**してください。`,
  },
  {
    question: "有効期間の2年間、ずっとイギリスに滞在できますか？",
    answer:
      "**できません**。有効期間は「2年間、またはパスポートの有効期限までの短い方」で、その間**何度でも渡航できる**という意味です。**1回の入国で滞在できるのは最長6ヶ月**までです。",
  },
  {
    question: "英国との二重国籍ですが、日本のパスポートで入国できますか？",
    answer: `**${jpDate(VISA_KEY_DATES.etaFullyEnforcedFrom)}以降はできません**。英国市民は ETA が不要ですが、それを証明するために**有効な英国パスポート、または Certificate of Entitlement** の提示が必要です。以前は非英国パスポートでの入国が認められていましたが、その猶予は終了しました。該当する方は渡航前に GOV.UK で条件を確認してください。`,
  },
  {
    question: "却下されたらどうすればいいですか？",
    answer: `結果メールに**却下理由が書かれています**。入力ミスや写真の不備であれば、修正して**再申請**できます（${gbp(VISA_FEES.eta)}の再支払いが必要で、過去の却下歴の申告も求められます）。犯罪歴や渡航履歴が理由の場合は、**Standard Visitor visa** の申請を検討することになります。詳しくは[却下されたら](#rejected)をご覧ください。`,
  },
];

export const etaSources: GuideSourceLink[] = [
  {
    label: "GOV.UK｜Electronic Travel Authorisation (ETA)（公式・申請はここから）",
    url: "https://www.gov.uk/eta",
  },
  {
    label: "GOV.UK｜Using the UK ETA app（アプリの使い方・公式）",
    url: "https://www.gov.uk/guidance/using-the-uk-eta-app",
  },
  { label: "GOV.UK｜Apply for an ETA（申請ページ）", url: "https://www.gov.uk/eta/apply" },
  {
    label: "Home Office｜ETA factsheet（制度の最新解説）",
    url: "https://homeofficemedia.blog.gov.uk/electronic-travel-authorisation-eta-factsheet-april-2026/",
  },
  {
    label: "在英国日本国大使館｜ETA（電子渡航認証）",
    url: "https://www.uk.emb-japan.go.jp/itpr_ja/ETA.html",
  },
  {
    label: "GOV.UK｜Standard Visitor visa（ETA 対象外・却下時の選択肢）",
    url: "https://www.gov.uk/standard-visitor",
  },
];

export const etaRelatedLinks: GuideRelatedLink[] = [
  {
    href: "/sightseeing/travel-tips",
    label: "ロンドン旅行の実用情報｜両替・カード・チップ・治安・eSIM・電源・服装",
  },
  { href: "/sightseeing/transport", label: "ロンドンの交通ガイド｜地下鉄・Oyster・空港アクセス" },
  { href: "/sightseeing/itinerary", label: "ロンドン モデルコース（1〜5日）" },
  { href: "/visa/uk-visa-guide", label: "英国ビザの選び方｜6ヶ月を超えて滞在する場合" },
  { href: "/visa/after-arrival", label: "入国後の手続き｜eVisa・BRP・住所登録" },
];
