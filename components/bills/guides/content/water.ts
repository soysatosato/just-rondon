import type { BillsGuideArticle } from "../types";
import {
  BILLS_AS_OF,
  BILLS_SOURCES,
  BILLS_UPDATED_AT,
  WATER,
  gbp,
  gbpRound,
} from "@/lib/bills/rates";

const water: BillsGuideArticle = {
  slug: "water",
  title: "イギリスの水道代｜Thames Water への届け出と、メーターの有無で変わる請求",
  engTitle: "Water Bills in London",
  audience:
    "入居したが、水道の請求がどこから来るのか、自分で届け出る必要があるのか分からない人",
  summary: `水道会社は選べません。ロンドンの大半は ${WATER.company} で、典型的な上下水道の年額は${gbp(
    WATER.typicalAnnual
  )}（${WATER.year}）です。請求の決まり方はメーターの有無で変わり、一人暮らしでメーターのない家は、使っていない分まで払っていることがあります。`,
  description: `ロンドンの水道代を入居者向けに解説。水道会社は地域で決まり選べないこと、${WATER.company} の典型的な年額${gbp(
    WATER.typicalAnnual
  )}（${WATER.year}）、メーター・rateable value・assessed charge の3つの請求方式、入居時の届け出、一人暮らしがメーターを付けると得をする理由、払えないときの扱いまで。`,
  keywords: [
    "イギリス 水道代",
    "Thames Water 引っ越し",
    "ロンドン 水道 料金",
    "water meter イギリス",
    "rateable value 水道",
    "イギリス 水道 契約",
  ],
  dataAsOf: BILLS_AS_OF,
  updatedAt: BILLS_UPDATED_AT,
  atAGlance: [
    { label: "会社", value: `**選べない**。ロンドンの大半は ${WATER.company}` },
    {
      label: "典型的な年額",
      value: `${gbp(WATER.typicalAnnual)}（上下水道、${WATER.year}）。月にすると約${gbpRound(
        WATER.typicalAnnual / 12
      )}`,
    },
    {
      label: "請求の決まり方",
      value: "メーターがあれば使用量、なければ物件の古い評価額（rateable value）",
    },
    {
      label: "入居の届け出",
      value: `オンラインで。入居の${WATER.notifyDaysBefore}日前からできる`,
    },
    {
      label: "一人暮らしなら",
      value: "メーターを付けると安くなることがある（設置は無料で申し込める）",
    },
  ],
  mainText: `ガスと電気は会社を選べますが、**水道は選べません。** 上下水道は地域ごとの独占事業で、住所によって会社が決まっています。

ロンドンの大半は **${WATER.company}** です。${WATER.year}の典型的な上下水道の請求は年${gbp(
    WATER.typicalAnnual
  )}で、前年度から月${gbp(WATER.monthlyIncrease)}ほど上がりました。

会社を選べないぶん、入居者にできることは3つだけです。

1. **入居を届け出て、自分の名前の口座にする**
2. **自分の家の請求がどの方式で決まっているか知る**
3. **一人暮らしなら、メーターを付けたほうが安くならないか考える**`,
  sections: [
    {
      id: "company",
      title: "水道会社は住所で決まる",
      navLabel: "会社",
      subtitle: `ロンドンの大半は ${WATER.company}`,
      body: `上下水道は、地域ごとに1社が担う独占事業です。ガスや電気のように比較サイトで乗り換えることはできません。

- **ロンドンの大半**：給水も下水も ${WATER.company}
- **ロンドンの外縁部の一部**：給水だけ別の会社（Affinity Water など）で、下水は ${WATER.company}、という分かれ方をする

後者の場合、**請求が2社から別々に届く** か、1社がまとめて請求するかは地域によります。自分の家がどちらかは、大家に聞くか、郵便番号で水道会社のサイトを検索すれば分かります。

### 大家が払っている物件もある

bills included の物件や、建物全体で水道を一括契約しているフラットでは、住人は届け出も支払いもしません。契約書の光熱費の条項を確認してください。`,
    },
    {
      id: "how-billed",
      title: "請求の決まり方は3つ",
      navLabel: "請求の方式",
      subtitle: "メーターがあるかどうかで大きく変わる",
      body: `水道の請求は、家に **メーターがあるかどうか** で方式が変わります。

| 方式 | 決まり方 | 向いている家 |
|---|---|---|
| **メーター（metered）** | 使った水の量（㎥）に応じて、給水と下水の両方を請求 | 住人が少ない、在宅時間が短い |
| **rateable value（unmetered）** | 物件の古い評価額に一定の率を掛ける。**使用量も人数も関係ない** | 住人が多い大きな家 |
| **assessed charge** | メーターを付けられない家に、同じ寝室数の家の平均的な使用量で請求 | メーターを申し込んだが設置できなかった家 |

### rateable value 方式の家に一人で住むと

rateable value は、昔の制度で物件ごとに付けられた評価額です。この方式では、**1人で住んでも5人で住んでも請求は同じ** です。

つまり、大きめの古い家に1〜2人で住んでいると、**使っていない水の分まで払っている** ことがあります。この場合はメーターの設置を申し込むと、請求が下がる可能性があります。

### メーターを付けるか考える

- 設置は水道会社に申し込める。借家なら、念のため大家にも伝える
- 物理的に付けられない家では、assessed charge に切り替わる
- **住人が多く、よく水を使う家** は、メーターにするとかえって高くなることがある

自分の家の方式は、届いた請求書に書かれています。`,
      tips: [
        "請求書に「rateable value」とあれば、使用量に関係なく決まる方式。一人暮らしならメーターを検討する価値がある。",
        "メーターのある家なら、入居日と退去日にメーターの数値を撮っておく。ガス・電気と同じ理由。",
      ],
    },
    {
      id: "move-in",
      title: "入居時の届け出",
      navLabel: "届け出",
      subtitle: `入居の${WATER.notifyDaysBefore}日前からできる`,
      body: `${WATER.company} の場合、入居はオンラインの口座（account）から届け出ます。入居の **${WATER.notifyDaysBefore}日前** から手続きできます。

### 伝えること

- 入居日
- 住所（部屋番号まで）
- メーターがあれば、入居日の数値
- 住人の名前と連絡先

### 届け出を忘れると

水は止まりませんが、請求も消えません。住人の名前が分からない住所には「The Occupier（居住者様）」宛ての請求が届き、**入居日に遡って** 請求されます。

### 支払い

- 口座引き落とし（Direct Debit）で、月払いか分割払いにできる
- メーター方式なら、使用量に応じて定期的に請求される

### 退去するとき

退去日を届け出てください。メーターがあれば退去日の数値も伝えます。最終請求で精算されます。`,
    },
    {
      id: "struggling",
      title: "払えないとき",
      navLabel: "払えないとき",
      subtitle: "水は止められないが、借金は残る",
      body: `イングランドとウェールズでは、**家庭の水道を料金の未払いを理由に止めることは法律で禁じられています。** 払えなくなっても、水が出なくなることはありません。

ただし、それは払わなくていいという意味ではありません。未払いは借金として残り、督促や債権回収会社への委託、裁判手続きに進むことがあります。

### 困ったら水道会社に連絡する

- **支払い計画の変更**：分割の回数や額を相談できる
- **収入基準のある割引制度**：${WATER.company} には、所得が一定以下の世帯の請求を下げる制度（WaterHelp など）がある。条件と申請方法は会社のサイトで確認する

どこから手をつければいいか分からなければ、Citizens Advice に無料で相談できます。`,
      callout: {
        tone: "info",
        title: "水道の請求が高すぎると感じたら",
        body: "メーター方式で急に請求が増えたら、漏水の可能性があります。家中の蛇口を閉めた状態でメーターの数字が動いていないか確認し、動いていれば水道会社に連絡してください。建物側の漏水であれば、請求の調整に応じてもらえることがあります。",
      },
    },
  ],
  faq: [
    {
      question: "ロンドンの水道代は月いくらですか。",
      answer: `${WATER.company} の${WATER.year}の典型的な上下水道の請求は年${gbp(
        WATER.typicalAnnual
      )}、月にすると約${gbpRound(
        WATER.typicalAnnual / 12
      )}です。メーターがある家は使用量で、ない家は物件の評価額（rateable value）で決まるので、家によって差があります。`,
    },
    {
      question: "水道会社を乗り換えられますか。",
      answer:
        "家庭用の水道は乗り換えられません。地域ごとに1社が担う独占事業で、ロンドンの大半は Thames Water です。外縁部の一部では給水と下水で会社が分かれています。",
    },
    {
      question: "一人暮らしでも水道代は同じですか。",
      answer:
        "メーターのない家（rateable value 方式）では、人数に関係なく同じ額です。一人暮らしなら、メーターの設置を申し込むと使用量に応じた請求になり、安くなる可能性があります。",
    },
    {
      question: "水道代を払わないと水を止められますか。",
      answer:
        "イングランドとウェールズでは、家庭の水道を未払いで止めることは法律で禁じられています。ただし未払いは借金として残り、督促や回収手続きに進むので、払えないときは早めに水道会社に支払い計画を相談してください。",
    },
  ],
  sources: [...BILLS_SOURCES.water],
  relatedLinks: [
    { href: "/bills/energy", label: "ガス・電気（入居日のメーターと price cap）" },
    { href: "/bills/bills-included", label: "「bills included」の中身と家賃の比べ方" },
    { href: "/housing/moving-out", label: "退去とデポジット返還交渉" },
  ],
};

export default water;
