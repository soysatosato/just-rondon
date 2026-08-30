import {
  ADMISSIONS,
  EDINBURGH_LEVY,
  RAIL_AS_OF,
  RAIL_UPDATED_AT,
  gbpRange,
  jpDate,
} from "@/lib/beyond-london/rates";
import type { DestinationArticle } from "../types";

const edinburgh: DestinationArticle = {
  kind: "destination",
  slug: "edinburgh",
  tier: "weekender",
  title: "エディンバラ1泊2日｜行き方・宿泊税・旧市街の歩き方",
  engTitle: "Edinburgh",
  county: "スコットランド",
  summary: `このセクションで唯一の「別の国」。片道4時間20分で、紙幣も法律も教育制度も変わります。2026年7月に英国初の宿泊税が始まったので、予算の立て方も他の行き先とは違います。`,
  description:
    "ロンドンからエディンバラへの1泊2日ガイド。LNERの所要時間と運賃、2026年7月開始の宿泊税（5%）、エディンバラ城とロイヤルマイル、旧市街と新市街の違い、スコットランド紙幣の扱い、8月のフェスティバル期の注意まで。",
  keywords: [
    "エディンバラ 行き方",
    "エディンバラ 1泊2日",
    "ロンドン エディンバラ 電車",
    "エディンバラ 宿泊税",
    "エディンバラ城",
    "ロイヤルマイル",
    "スコットランド 紙幣",
  ],
  dataAsOf: RAIL_AS_OF,
  updatedAt: RAIL_UPDATED_AT,
  verdict: {
    stayLength: "1泊2日で市内は回れます。2泊あると余裕",
    watchOut:
      "8月のフェスティバル期は宿が取れず高騰します。宿泊税も予約サイトの表示価格に含まれないことがあるので、総額で見積もってください",
    suitedTo: "英国の中の「別の国」を、紙幣や制度の違いごと見たい人",
  },
  gettingThere: {
    fromStation: "キングス・クロス",
    operator: "LNER（ほかに Lumo・Avanti West Coast の経路もあります）",
    journeyTime: "最速で約4時間20分",
    frequency: "毎時1〜2本",
    fareGuide:
      "Advance なら片道£30台から取れることがあります。当日券は£150を超えることもあり、このセクションで最も価格差の大きい区間です",
    oysterValid: false,
    oysterNote:
      "スコットランドです。ロンドンのゾーンとは何の関係もありません。市内のバス・トラムもロンドンとは別の運賃制度なので、現地で改めて支払い方法を確認してください。",
    bookingAdvice:
      "この距離では Advance と当日券の差が3〜4倍になります。日程が決まっているなら、発売開始（原則12週間前）にできるだけ近いタイミングで買ってください。ここを押さえるかどうかで旅費が大きく変わります。",
    railcardNote:
      "1/3引きの効果が最も大きい区間です。往復1回でRailcardの年会費を回収できます。",
  },
  onArrival: {
    fromStationToCentre:
      "エディンバラ・ウェイヴァリー駅は旧市街と新市街のちょうど谷間にあります。どちらへも徒歩数分ですが、旧市街側へは上り坂（または階段）です。",
    halfDay:
      "エディンバラ城とロイヤルマイル。城だけで2時間かかります。",
    fullDay:
      "旧市街に加えて、新市街のジョージ王朝様式の街並み、またはアーサーズ・シート（丘）へ。",
  },
  stayAndNight: {
    whereToStay:
      "**旧市街（Old Town）** はロイヤルマイル沿いで、観光には最も便利ですが夜も賑やかです。**新市街（New Town）** は落ち着いていて、ジョージ王朝様式の街並みが美しく、駅からも徒歩圏。1泊なら**駅から徒歩圏**であればどちらでも成立します。**リース（Leith）** は港側で相場が下がりますが、中心部へはバスかトラムが必要です。",
    priceBand:
      "1泊£90〜180程度が目安。ただし**8月のフェスティバル期は3〜4倍になり、しかも数ヶ月前に埋まります**。8月に行くなら宿を最優先で確保してください。",
    atNight:
      "パブで**スコッチ・ウイスキー**を飲むのが順当です。イングランドのパブとは品揃えが違い、シングルモルトが並びます。ライブ音楽（トラディショナル・ミュージック）をやる店も多い。夏は22時過ぎまで明るく、**日没後の旧市街は石畳と街灯で雰囲気が変わります**。冬は逆に15時台から暗くなります。",
    gettingBack:
      "午前中の列車なら昼過ぎ、午後の列車なら夜にロンドン着です。最終は20時台まであります。**日曜の午後の便は混みます**——週末旅行の帰りが集中するので、指定席を取っておくと安心です。",
    levyNote: `**${jpDate(EDINBURGH_LEVY.startedOn)}から、宿泊費の${
      EDINBURGH_LEVY.rate
    }が宿泊税として上乗せされます**（英国初の制度）。${
      EDINBURGH_LEVY.appliesTo
    }にかかり、連泊は最初の${
      EDINBURGH_LEVY.cappedAtNights
    }泊までが対象です。予約サイトの表示価格に含まれていないことがあるので、**現地で請求される前提**で予算を組んでください。`,
  },
  highlights: [
    {
      name: "エディンバラ城",
      engName: "Edinburgh Castle",
      body: "街のどこからでも見える岩山の上の城。12世紀から続く軍事拠点で、スコットランド王権の象徴です。スコットランドの王冠（Honours of Scotland）と、歴代の王が戴冠した「運命の石」が収められています。",
      admission: `${gbpRange(
        ADMISSIONS.edinburghCastle
      )} 程度。**事前予約制の時間枠**があるので公式で確認を`,
      mapQuery: "Edinburgh Castle",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/City_of_Edinburgh_-_Edinburgh_Castle_-_20140421004403.jpg/1280px-City_of_Edinburgh_-_Edinburgh_Castle_-_20140421004403.jpg",
      imageSource: "commons",
      imageCredit: "Enric (CC BY-SA 4.0)",
      imageLink:
        "https://commons.wikimedia.org/wiki/File:City_of_Edinburgh_-_Edinburgh_Castle_-_20140421004403.jpg",
    },
    {
      name: "ロイヤルマイル",
      engName: "The Royal Mile",
      body: "城からホリールード宮殿まで、旧市街の背骨を成す約1.6kmの通り。両側から細い路地（クローズ）が枝分かれし、その一本一本に中世からの歴史があります。歩くこと自体が観光になります。",
      admission: "無料",
      mapQuery: "Royal Mile Edinburgh",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/High_Street%2C_Edinburgh.JPG/1280px-High_Street%2C_Edinburgh.JPG",
      imageSource: "commons",
      imageCredit: "Kim Traynor (CC BY-SA 3.0)",
      imageLink:
        "https://commons.wikimedia.org/wiki/File:High_Street,_Edinburgh.JPG",
    },
    {
      name: "ホリールードハウス宮殿",
      engName: "Palace of Holyroodhouse",
      body: "ロイヤルマイルの東端にある、英国王のスコットランドにおける公式宮殿。メアリー・スチュアートが暮らした部屋が残っています。王室が滞在中は閉まります。",
      admission: "有料。王室行事による休館があります",
      mapQuery: "Palace of Holyroodhouse",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Holyrood_Palace_-_aerial_-_2025-04-19_01_%28cropped%29.jpg/1280px-Holyrood_Palace_-_aerial_-_2025-04-19_01_%28cropped%29.jpg",
      imageSource: "commons",
      imageCredit: "瑞丽江的河水 (CC BY-SA 4.0)",
      imageLink:
        "https://commons.wikimedia.org/wiki/File:Holyrood_Palace_-_aerial_-_2025-04-19_01_(cropped).jpg",
      internalLink: {
        href: "/sightseeing/royal-london",
        label: "ロイヤル・ロンドン｜ロンドンの王室施設と比べる",
      },
    },
    {
      name: "アーサーズ・シート",
      engName: "Arthur's Seat",
      body: "市街地のすぐ隣にそびえる死火山。頂上まで往復2時間ほどで、街と海を一望できます。登山装備は不要ですが、それなりの傾斜と風があります。",
      admission: "無料",
      mapQuery: "Arthur's Seat Edinburgh",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Arthur%27s_Seat%2C_Edinburgh.JPG/1280px-Arthur%27s_Seat%2C_Edinburgh.JPG",
      imageSource: "commons",
      imageCredit: "Kim Traynor (CC BY-SA 3.0)",
      imageLink:
        "https://commons.wikimedia.org/wiki/File:Arthur%27s_Seat,_Edinburgh.JPG",
    },
  ],
  mainText: `エディンバラは、このセクションで唯一の **「別の国」** です。

同じ United Kingdom ではありますが、スコットランドは**独自の法体系・教育制度・国教会**を持ち、議会も別にあります。紙幣もスコットランドの銀行が独自に発行しています。国境を越えたという実感が、街の造りからも制度からも伝わってきます。

そして街そのものが劇的です。**岩山の上に城**が建ち、そこから東へ**ロイヤルマイル**が伸び、谷を挟んだ北側には整然としたジョージ王朝様式の**新市街**が広がる。旧市街と新市街の対比がそのまま世界遺産に登録されています。

片道**約4時間20分**。日帰りは理論上できますが、往復8時間半で現地4時間では意味がありません。**1泊2日が最低線**です。

ひとつ、他の行き先にない実務があります。**2026年7月から宿泊税が始まりました。**`,
  sections: [
    {
      id: "visitor-levy",
      navLabel: "宿泊税",
      title: "宿泊税が始まりました",
      subtitle: "英国初の制度です",
      body: `**${jpDate(EDINBURGH_LEVY.startedOn)}から、エディンバラで宿泊する人は宿泊税（Visitor Levy）を払います**。英国で初めて導入された都市です。

| | |
|---|---|
| **税率** | 宿泊費の **${EDINBURGH_LEVY.rate}**（VAT 計算前の金額に対して） |
| **対象** | ${EDINBURGH_LEVY.appliesTo} |
| **上限** | 連泊の場合、**最初の${EDINBURGH_LEVY.cappedAtNights}泊まで** |
| **対象施設** | ホテル、B&B、ホステル、民泊、キャンプ場など |

**なぜこれを書くか**。予約サイトの表示価格に含まれていないことがあり、**現地で別途請求される**場合があるからです。1泊£150の宿なら£7.5程度で、金額としては小さいものの、知らずにいると「話が違う」と感じます。

**ロンドンにはまだありません。**[宿泊エリアの選び方](/sightseeing/hotels)でも触れていますが、イングランドでは導入に向けた法整備が進んでいる段階です。**英国内を周遊するなら、都市ごとに違う**と考えてください。

観光客だけでなく、**英国在住者・スコットランド在住者にもかかります**。「外国人観光客向けの税」ではありません。`,
      callout: {
        tone: "warn",
        title: "予約時の表示価格を確認する",
        body: `宿泊税は予約サイトの表示に**含まれている場合と、現地で別途請求される場合**があります。予約時に総額の内訳を確認してください。金額は大きくありませんが、複数泊すると積み上がります（対象は最初の${EDINBURGH_LEVY.cappedAtNights}泊まで）。`,
      },
    },
    {
      id: "getting-there",
      navLabel: "鉄道か飛行機か",
      title: "鉄道か、飛行機か",
      body: `**鉄道**はキングス・クロスから**最速4時間20分**。毎時1〜2本走っています。運行はLNERが中心ですが、Lumo という格安事業者も同じ区間を走っており、こちらは安いかわりに設備が簡素です。

**飛行機**なら約1時間30分ですが、空港までの移動と保安検査を足すと**実質的な差は縮まります**。ロンドン市内 → 空港 → 保安検査 → 搭乗 → エディンバラ空港 → 市内、で4時間前後になることも珍しくありません。しかも鉄道は**街の中心に直接着きます**。

**運賃差が極端な区間です。**

- **Advance（早期購入）**：片道£30台から取れることがあります
- **当日券（Anytime）**：£150を超えることがあります

**3〜4倍の差**です。[BritRail Pass の記事](/beyond-london/britrail-pass)でこの区間を例に出しているのは、この差がパスの損得判定の核心になるからです。

日程が決まっているなら、**発売開始（原則12週間前）にできるだけ近いタイミングで買ってください**。ここを押さえられるかどうかで、旅費が£100以上変わります。`,
      tips: [
        "Lumo は同区間の格安事業者。設備は簡素だが運賃が安いことがある",
        "夜行バスもあるが、8時間以上かかるうえ翌日が潰れる。積極的には勧めない",
        "駅（ウェイヴァリー）は街のど真ん中。空港からのアクセスを考える必要がない",
      ],
    },
    {
      id: "old-and-new",
      navLabel: "旧市街と新市街",
      title: "旧市街と新市街は、別の時代の街",
      body: `エディンバラの世界遺産登録は、**旧市街と新市街の対比**に対してなされています。両方を歩くと、その意味が分かります。

**旧市街（Old Town）**

城からホリールード宮殿まで伸びる**ロイヤルマイル**が背骨です。中世の都市構造がそのまま残っており、細い路地（**クローズ**）が両側に枝分かれしています。城壁に囲まれた狭い土地に人口が集中したため、**上へ上へと建て増しされた**歴史があり、当時としては世界有数の高層都市でした。

**新市街（New Town）**

18世紀、旧市街の過密を解消するために計画された地区です。**碁盤目状の街路と、統一されたジョージ王朝様式**の建物。旧市街の混沌とは対照的に、徹底して整然としています。

**この2つが谷を挟んで隣り合っている**のがエディンバラの特徴です。谷は今は公園（プリンシズ・ストリート・ガーデンズ）になっていて、そこから旧市街の岩山を見上げる構図が、この街を代表する眺めになります。

**1泊2日の配分**としては、初日に旧市街（城＋ロイヤルマイル）、翌日に新市街かアーサーズ・シート、というのが素直です。`,
      tips: [
        "旧市街は坂と階段が多い。歩きやすい靴で",
        "クローズ（路地）は入っていいものと私有地が混ざる。表示を確認する",
        "プリンシズ・ストリート・ガーデンズから城を見上げる構図が定番",
      ],
    },
    {
      id: "scottish-differences",
      navLabel: "スコットランドの違い",
      title: "スコットランドで戸惑うこと",
      body: `同じ国のようで、いくつか違います。**知らないと現地で戸惑う**ものを挙げます。

**紙幣が違う**

スコットランドの銀行（Bank of Scotland、Royal Bank of Scotland、Clydesdale Bank）が**独自のデザインの紙幣を発行**しています。イングランド銀行券と等価で、スコットランド国内では普通に使えます。

問題は逆で、**スコットランド紙幣をイングランドで使おうとすると断られることがあります**。法的には有効ですが、見慣れていない店員が受け取りを拒むことがある。**カード決済にしておけば、この問題は起きません。**

**市内交通が別制度**

Oyster もタッチ決済の上限額も**関係ありません**。エディンバラのバスとトラムは独自の運賃体系です。バスは**おつりが出ない**ことがあるので、現金なら小銭を用意するかカードで払ってください。

**8月は別の街になる**

8月は**エディンバラ・フェスティバル**（フリンジを含む）の期間で、街全体が劇場と化します。世界中から人が集まり、**宿は3〜4倍に高騰し、数ヶ月前に埋まります**。

フェスティバル目当てなら最高の時期ですが、**そうでないなら8月は避ける**のが賢明です。同じ街とは思えないほど混みます。`,
      callout: {
        tone: "warn",
        title: "8月に行くなら、宿を最初に取る",
        body: "フェスティバル期（8月）は**宿泊費が3〜4倍になり、しかも数ヶ月前に売り切れます**。この時期に行くなら、列車より先に宿を押さえてください。逆に、フェスティバルに興味がないなら**8月を外す**だけで旅費が大きく下がります。",
      },
    },
    {
      id: "one-night-plan",
      navLabel: "1泊2日の組み立て",
      title: "1泊2日の組み立て",
      body: `**初日**

1. 朝の列車でロンドンを発つ（8時台なら13時前に着きます）
2. 宿に荷物を預け、**ロイヤルマイル**を歩きながら旧市街へ
3. **エディンバラ城**（2時間）。時間枠を予約しておくこと
4. 夕方、旧市街の路地を歩く
5. パブで夕食。スコッチを試す

**2日目**

6. 午前に**アーサーズ・シート**（往復2時間）か、**新市街**の散策
7. 昼食後、午後の列車でロンドンへ

これで**1泊2日**です。城とロイヤルマイルで初日が埋まり、2日目に一つ足す形になります。

**2泊できるなら**、ホリールードハウス宮殿、スコットランド国立博物館（無料）、あるいはウイスキー蒸溜所の見学が入ります。エディンバラは**見どころが徒歩圏に密集している**ので、日数を足した分だけ確実に増えます。

**帰りの列車**は、日曜午後が最も混みます。週末旅行の帰りが集中するので、指定席を取っておくと確実です。`,
      tips: [
        "スコットランド国立博物館は無料。雨の日の避難先にもなる",
        "城は朝いちばんが空いている。開場時刻の枠を取ると人が少ない",
        "日曜午後のロンドン行きは混雑する。座席指定を取っておく",
      ],
    },
  ],
  faq: [
    {
      question: "エディンバラに宿泊税はかかりますか？",
      answer: `**かかります**。${jpDate(
        EDINBURGH_LEVY.startedOn
      )}から、宿泊費の${EDINBURGH_LEVY.rate}が上乗せされます（英国初の制度）。連泊の場合は最初の${
        EDINBURGH_LEVY.cappedAtNights
      }泊までが対象で、駐車場や食事にはかかりません。予約サイトの表示価格に含まれていないことがあるため、現地で請求される前提で予算を組んでください。観光客だけでなく英国在住者にもかかります。`,
    },
    {
      question: "日帰りはできますか？",
      answer:
        "**理論上は可能ですが、勧めません**。片道4時間20分なので往復8時間半、現地に4時間ほどしか残りません。エディンバラ城だけで2時間かかります。**1泊2日が最低線**です。",
    },
    {
      question: "鉄道と飛行機、どちらがいいですか？",
      answer:
        "**鉄道を勧めます。**飛行機は所要1時間30分ですが、空港までの移動と保安検査を足すと実質4時間前後になり、鉄道の4時間20分と大差ありません。しかも鉄道は**街の中心（ウェイヴァリー駅）に直接着きます**。ただし当日券は£150を超えることがあるので、早期に Advance を取るのが前提です。",
    },
    {
      question: "スコットランドの紙幣はロンドンで使えますか？",
      answer:
        "**法的には有効ですが、断られることがあります**。スコットランドの銀行が発行する紙幣はイングランド銀行券と等価ですが、イングランドでは見慣れていない店員が受け取りを拒むことがあります。**カード決済にしておけばこの問題は起きません。**",
    },
    {
      question: "Oyster やタッチ決済は使えますか？",
      answer:
        "**使えません**。エディンバラはスコットランドで、ロンドンのゾーン制とは無関係です。市内のバスとトラムも独自の運賃体系なので、現地で改めて支払い方法を確認してください。バスは現金だとおつりが出ないことがあります。",
    },
    {
      question: "8月に行くのはどうですか？",
      answer:
        "**フェスティバル目当てなら最高、そうでなければ避けてください。**8月はエディンバラ・フェスティバル（フリンジを含む）の期間で、街全体が劇場になります。ただし**宿泊費が3〜4倍に高騰し、数ヶ月前に売り切れます**。フェスティバルに関心がないなら、8月を外すだけで旅費が大きく下がります。",
    },
  ],
  sources: [
    {
      label: "City of Edinburgh Council – Visitor Levy（宿泊税の公式）",
      url: EDINBURGH_LEVY.official,
    },
    {
      label: "Edinburgh Castle – 公式（入場料・予約）",
      url: ADMISSIONS.edinburghCastle.official,
    },
    {
      label: "Forever Edinburgh – 公式観光情報",
      url: "https://edinburgh.org/",
    },
    {
      label: "National Rail – Buying a ticket（券種の公式説明）",
      url: "https://www.nationalrail.co.uk/tickets-railcards-and-offers/buying-a-ticket/",
    },
  ],
  relatedLinks: [
    {
      href: "/beyond-london/york",
      label: "ヨーク｜エディンバラへの途中にある街",
    },
    {
      href: "/beyond-london/britrail-pass",
      label: "BritRail Pass は元が取れるのか｜この区間が判定の基準",
    },
    {
      href: "/sightseeing/transport/national-rail",
      label: "英国の鉄道切符の買い方｜Advanceを安く取る",
    },
    {
      href: "/sightseeing/hotels",
      label: "宿泊エリアの選び方｜ロンドンには宿泊税がない",
    },
  ],
};

export default edinburgh;
