import { TRAVEL_GUIDE_AS_OF, TRAVEL_GUIDE_UPDATED_AT } from "../../guides";
import type { VariantSection } from "../blocks";
import type { VariantMeta } from "../VariantLayout";
import type { GuideFaqItem, GuideRelatedLink, GuideSourceLink } from "@/components/guides/types";

/**
 * 子連れ版。
 *
 * 親記事(itinerary)の variants にあった数行を独立させたもの。
 *
 * 「どこが楽しいか」より「どこで詰むか」に紙幅を割いている。
 * ベビーカーで地下鉄に乗れない駅、オムツ替えの場所、早すぎる夕食難民——
 * このあたりが実際に旅程を壊す要因なので、見どころの紹介より先に置く。
 *
 * 年齢帯は「0〜2 / 3〜6 / 7〜11 / 12歳以上」で切っている。
 * 交通の無料枠(11歳以下)と施設の料金区分がこの境目で変わるため。
 *
 * 以前は年齢別プランが markdown の引用ブロック、運賃とスポットが
 * GFM テーブルだった。年齢別は「自分の子はどれか」を1つ選ぶ形なので、
 * 4帯を並べて読ませるのではなく年齢帯のカードにして時間割を付ける。
 */

export const withKidsMeta: VariantMeta = {
  slug: "itinerary/with-kids",
  title: "子連れのロンドン モデルコース｜年齢別プランと詰まないための実務",
  engTitle: "London with Kids",
  summary:
    "子連れのロンドンで旅程が壊れるのは、見どころ選びを間違えたときではありません。移動で消耗し、食事の時間を外し、オムツ替えの場所が見つからないときです。この記事では年齢別のプランに加えて、ベビーカーで乗れる路線や子ども料金の仕組みまで含めてまとめます。",
  description:
    "子ども連れのロンドン観光モデルコース。年齢別の1日プラン、恐竜と体験展示を軸にしたルート、ベビーカーでの地下鉄移動、11歳以下の交通無料ルール、オムツ替えと授乳の場所、子連れで入れるレストランの探し方を解説します。",
  keywords: [
    "ロンドン 子連れ",
    "ロンドン 子連れ 観光",
    "ロンドン 家族旅行",
    "ロンドン ベビーカー",
    "ロンドン 子ども 無料",
    "ロンドン 子連れ モデルコース",
  ],
  dataAsOf: TRAVEL_GUIDE_AS_OF,
  updatedAt: TRAVEL_GUIDE_UPDATED_AT,
};

export const withKidsLead = `ロンドンは、子連れにかなり優しい街です。**主要な博物館はすべて無料**で、そのうち何館かは子ども向けに作られています。**11歳以下は地下鉄・バスが無料**で、公園はどこにでもあります。

一方で、**ベビーカーで地下鉄に乗るのは難所**です。ロンドンの地下鉄は世界最古で、**エレベーターのない駅が大多数**を占めます。ここを知らずに旅程を組むと、階段でベビーカーを担ぐ1日になります。

この記事は[通常のモデルコース](/sightseeing/itinerary)を子連れ向けに組み替えたものです。**大原則は1日2ヶ所まで**。これを守れるかどうかで、旅の成否がほぼ決まります。`;

export const withKidsSections: VariantSection[] = [
  {
    id: "principles",
    label: "旅程を壊さない4つの原則",
    navLabel: "原則",
    subtitle: "見どころ選びより、こちらが重要",
    blocks: [
      {
        kind: "cards",
        cols: 2,
        items: [
          {
            head: "1. 1日2ヶ所まで",
            body: "大人なら3〜4ヶ所回れますが、子連れでは2ヶ所が上限です。移動と待ち時間で子どもの体力が先に尽きます。「午前に1つ、午後に1つ、あいだに公園」が黄金比です。",
            best: true,
          },
          {
            head: "2. 公園を必ず挟む",
            body: "ロンドンの公園には無料の遊び場（playground）が必ずあります。博物館で静かにさせた後は、走り回らせる時間を作ってください。ここを削ると午後が崩壊します。",
          },
          {
            head: "3. 夕食は18時前に始める",
            body: "ロンドンのレストランは19時以降が本番で、子ども連れには遅すぎます。17:30〜18:30 に入れば、店も空いていて子連れ歓迎されやすいという二重の利点があります。",
          },
          {
            head: "4. 移動は「バス優先」",
            body: "バスはベビーカーのまま乗れます。地下鉄と違って階段がなく、2階建てバスの2階最前列は子どもにとって観光そのものです。",
          },
        ],
      },
      {
        kind: "verdicts",
        items: [
          {
            label: "バス",
            verdict: "子連れ向き",
            tone: "good",
            detail: "そのまま乗れる／2階最前列が特等席／11歳以下は無料。渋滞には左右される",
          },
          {
            label: "地下鉄",
            verdict: "階段が多い",
            tone: "bad",
            detail: "階段が多い駅が大半。速いが暗くてうるさい。11歳以下は無料",
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "2階建てバスの最前列を狙う",
        body: "ルート **9番・11番・15番** などは、観光名所の前を通る路線です。2階の最前列に座れれば、**観光バスとほぼ同じ景色が交通費だけで見られます**。子どもは間違いなく喜びます。詳しくは[バスとトラムのガイド](/sightseeing/transport/bus)へ。",
      },
    ],
  },
  {
    id: "by-age",
    label: "年齢別のプラン",
    navLabel: "年齢別",
    subtitle: "できることが年齢で大きく変わる",
    blocks: [
      {
        kind: "timeline",
        day: {
          n: 0,
          title: "0〜2歳（ベビーカー期）",
          subtitle: "",
          intro: "大人が見たい場所を、子どもが眠れる形で回るのが現実的です。",
          parts: [
            {
              part: "午前",
              stops: [
                {
                  name: "自然史博物館",
                  free: true,
                  note: "ベビーカーで入れて広い。授乳室とオムツ替え台がある",
                },
              ],
            },
            { part: "昼", stops: [{ name: "館内カフェ" }] },
            {
              part: "午後",
              stops: [{ name: "ハイド・パークで散歩＋昼寝", free: true }],
            },
            {
              part: "夕方",
              stops: [
                {
                  name: "宿で休憩",
                  note: "宿に戻る時間を必ず作る。無理に外にいると全員が消耗します",
                },
              ],
            },
          ],
          tips: ["移動はバス。地下鉄は避ける"],
        },
      },
      {
        kind: "timeline",
        day: {
          n: 0,
          title: "3〜6歳（動き回る期）",
          subtitle: "",
          intro: "体験できるもの・触れるものを中心に。展示を「見る」だけでは持ちません。",
          parts: [
            {
              part: "午前",
              stops: [
                {
                  name: "自然史博物館（恐竜）",
                  free: true,
                  note: "この年齢の子に最も刺さります",
                },
              ],
            },
            { part: "昼", stops: [{ name: "博物館周辺で軽食" }] },
            {
              part: "午後",
              stops: [],
              choice: [
                {
                  label: "体験展示",
                  stops: [
                    {
                      name: "科学博物館 Wonderlab",
                      note: "常設展と違って有料。行くなら事前に確認を",
                    },
                  ],
                },
                {
                  label: "公園",
                  stops: [
                    {
                      name: "ダイアナ妃記念遊び場",
                      free: true,
                      note: "海賊船がある。ケンジントン・ガーデンズ内。この年齢の決定版",
                    },
                  ],
                },
              ],
            },
            { part: "夕方", stops: [{ name: "早めの夕食", at: "17:30〜18:30" }] },
          ],
        },
      },
      {
        kind: "timeline",
        day: {
          n: 0,
          title: "7〜11歳（説明が通じる期）",
          subtitle: "",
          intro: "歴史の話が通じ始めるので、名所の面白さが伝わります。",
          parts: [
            {
              part: "午前",
              stops: [
                {
                  name: "ロンドン塔",
                  note: "鎧・王冠・処刑の話。ビーフィーターのガイドツアーが面白い",
                },
              ],
            },
            { part: "昼", stops: [{ name: "バラ・マーケットで食べ歩き" }] },
            {
              part: "午後",
              stops: [{ name: "タワー・ブリッジ、またはテムズ川クルーズ" }],
            },
            { part: "夕方", stops: [{ name: "早めの夕食" }] },
          ],
          tips: [
            "ハリー・ポッターに興味があるなら、キングス・クロス駅の9¾番線は必訪",
            "11歳以下は交通が無料なので、移動費がかかりません",
          ],
        },
      },
      {
        kind: "cards",
        items: [
          {
            head: "12歳以上",
            body: "ほぼ大人と同じルートで回れます。通常のモデルコースを、1日1ヶ所ぶん減らす程度の調整で十分です。ただし交通は大人料金になります（一部 Zip card 等の例外あり）。ミュージカルやスタジオツアーなど、大人向けの体験も楽しめる年齢です。",
          },
        ],
      },
      {
        kind: "notes",
        items: [
          "自然史博物館と科学博物館は隣接しているが、1日で両方は無理。どちらか1つに絞る",
          "Wonderlab（科学博物館の体験展示エリア）は常設展と違って有料。行くなら事前に確認を",
          "ロンドン塔は敷地が広く屋外を歩く時間が長い。天気が悪い日は避ける",
        ],
      },
      {
        kind: "callout",
        tone: "info",
        title: "無料で楽しめる場所をまとめています",
        body: "入場無料の博物館、公園の遊び場、市場など、お金をかけずに子どもと過ごせる場所は[子連れで楽しむ無料スポット](/sightseeing/kids-free-activities)に一覧でまとめています。",
      },
    ],
  },
  {
    id: "transport",
    label: "子連れの移動と料金",
    navLabel: "移動",
    subtitle: "11歳以下は無料。ただしベビーカーは別問題",
    blocks: [
      {
        kind: "rows",
        items: [
          { name: "0〜10歳", meta: [{ label: "地下鉄・鉄道", value: "無料" }, { label: "バス", value: "無料" }], note: "大人同伴" },
          { name: "11歳", meta: [{ label: "地下鉄・鉄道", value: "無料" }, { label: "バス", value: "無料" }], note: "大人同伴" },
          { name: "11〜15歳", meta: [{ label: "地下鉄・鉄道", value: "割引" }, { label: "バス", value: "無料" }], note: "Zip card が必要な場合あり" },
          { name: "16歳以上", meta: [{ label: "地下鉄・鉄道", value: "大人料金" }, { label: "バス", value: "大人料金" }] },
        ],
      },
      {
        kind: "prose",
        body: "**11歳以下は大人と一緒なら改札を無料で通れます**。改札の脇にある広いゲートを、大人がタッチして一緒に通ります。駅員に声をかければ開けてくれます。\n\n短期旅行なら Zip card の申請は不要です。**11歳以下は手続きなしで無料**と覚えておけば足ります。運賃の詳細は[運賃と支払い方法](/sightseeing/transport/fares)へ。",
      },
      {
        kind: "prose",
        body: "### ベビーカーと地下鉄\n\n**ここが最大の難所です**。ロンドンの地下鉄は1863年開業で、**階段のみの駅が非常に多い**のが実情です。",
      },
      {
        kind: "steps",
        items: [
          "バスを使う（最も確実）— 全路線がベビーカー対応",
          "step-free の駅を選ぶ — TfL の路線図には車椅子マークが付いた駅があり、これが地上から車両まで段差なしで行ける駅です",
          "エリザベス・ラインと DLR を使う — 新しい路線なのでほぼ全駅がバリアフリー",
        ],
      },
      {
        kind: "prose",
        body: "**エリザベス・ライン**（紫色の路線）は特に優秀です。子連れならこの路線を軸に動くと格段に楽になります。段差なしの移動そのものは[バリアフリーのロンドン](/sightseeing/step-free)にまとめてあります。",
      },
      {
        kind: "cards",
        items: [
          {
            head: "抱っこ紐という選択",
            body: "滞在が短く中心部だけなら、ベビーカーより抱っこ紐のほうが機動的な場面が多いです。地下鉄の階段、混雑した博物館、石畳——ベビーカーが不利になる場所がロンドンには揃っています。ただし1日1万歩を抱っこで歩くのは大人がつぶれるので、両方持っていくのが現実解です。",
          },
        ],
      },
      {
        kind: "callout",
        tone: "warn",
        title: "ラッシュアワーを避ける",
        body: "**平日 07:30〜09:30 と 17:00〜19:00 の地下鉄は、子連れではかなり厳しい**混雑です。ベビーカーはまず乗れません。この時間帯は移動を避け、博物館か公園にいる時間に充ててください。",
      },
      {
        kind: "notes",
        items: [
          "TfL 公式アプリと Citymapper は step-free ルートだけを検索できる。子連れならこの設定を常にオンに",
          "バスは前ドアから乗り、ベビーカースペースは車椅子優先。車椅子の乗客が来たら譲る必要がある",
          "駅のエレベーターは故障していることがある。当日の運行情報を確認できると安心",
        ],
      },
    ],
  },
  {
    id: "practical",
    label: "オムツ替え・授乳・トイレ",
    navLabel: "実務",
    subtitle: "知らないと本当に困る",
    blocks: [
      {
        kind: "verdicts",
        items: [
          { label: "主要な博物館", verdict: "確実にある", tone: "good", detail: "大英博物館、自然史博物館、科学博物館、V&A など" },
          { label: "デパート", verdict: "確実にある", tone: "good", detail: "ハロッズ、ジョン・ルイス、セルフリッジズ。設備が充実" },
          { label: "大型ショッピングセンター", verdict: "ある", tone: "good", detail: "Westfield など。ファミリールームがあります" },
          { label: "チェーンのカフェ", verdict: "期待しない", tone: "neutral", detail: "一部にはありますが、当てにしないほうがいい" },
          { label: "パブ・小さなレストラン", verdict: "ほぼ無い", tone: "bad", detail: "大型施設にいるうちに済ませておく" },
        ],
      },
      {
        kind: "cards",
        cols: 2,
        items: [
          {
            head: "授乳",
            body: "英国では公共の場での授乳が法律で保護されています（Equality Act 2010）。カフェでも公園でも授乳して構いませんし、やめるよう求めることは違法です。落ち着いてできる場所がいいなら、デパートのファミリールームか博物館の授乳室が快適です。",
          },
          {
            head: "公衆トイレ",
            body: "日本ほど簡単には見つかりません。博物館・美術館は無料で清潔（最も確実）、デパートも同様。駅のトイレは有料のことがあります（£0.20〜£0.50、タッチ決済対応が増加）。「入れる場所に入ったら、必要がなくても行かせておく」のが子連れの鉄則です。",
          },
        ],
      },
      {
        kind: "list",
        title: "食事",
        items: [
          "パブは子ども連れで入れますが、多くは夜になると18歳未満の入店が制限されます。ランチや夕方の早い時間なら問題ありません",
          "チェーン店（Pizza Express、Wagamama、Nando's など）はキッズメニューがあり、子連れに慣れています",
          "博物館のカフェは割高ですが、子連れには最も気楽です",
          "スーパー（Tesco、Sainsbury's）の Meal Deal で公園ピクニックにすると、安くて子どもも喜びます",
        ],
      },
      {
        kind: "notes",
        items: [
          "ベビーフードやオムツは現地のスーパーや Boots で買える。持参は数日分で足りる",
          "粉ミルクは英国のブランドに切り替わるので、こだわりがあるなら日本から持参する",
          "レストランでは高さのある子ども椅子（high chair）を頼めば出てくる店が多い",
        ],
      },
    ],
  },
  {
    id: "spots",
    label: "子連れに強いスポット",
    navLabel: "スポット",
    subtitle: "外れが少ない場所",
    blocks: [
      {
        kind: "rows",
        items: [
          { name: "自然史博物館", free: true, meta: [{ label: "", value: "3歳〜" }], note: "恐竜の骨格。建物自体が城のよう" },
          { name: "科学博物館", free: true, meta: [{ label: "", value: "4歳〜" }], note: "体験展示。Wonderlab は有料" },
          { name: "ダイアナ妃記念遊び場", free: true, meta: [{ label: "", value: "2〜10歳" }], note: "海賊船のある大型遊具。ケンジントン・ガーデンズ内" },
          { name: "ロンドン動物園", meta: [{ label: "", value: "全年齢" }], note: "有料。リージェンツ・パーク内。半日" },
          { name: "ロンドン塔", meta: [{ label: "", value: "7歳〜" }], note: "有料。鎧と王冠。歴史が通じる年齢から" },
          { name: "ロンドン交通博物館", meta: [{ label: "", value: "3歳〜" }], note: "有料。実物のバスや地下鉄に乗り込める" },
          { name: "キングス・クロス 9¾番線", free: true, meta: [{ label: "", value: "6歳〜" }], note: "写真スポット。行列あり" },
          { name: "テムズ川クルーズ", meta: [{ label: "", value: "全年齢" }], note: "有料。座って景色が変わるので飽きにくい" },
          { name: "ハムリーズ（おもちゃ店）", free: true, meta: [{ label: "", value: "全年齢" }], note: "入場は無料。実演販売が楽しい。リージェント通り" },
          { name: "グリニッジ", meta: [{ label: "", value: "5歳〜" }], note: "一部無料。本初子午線をまたげる。船で行くと移動も楽しい" },
        ],
      },
      {
        kind: "cards",
        cols: 2,
        items: [
          {
            head: "サウス・ケンジントン1日",
            body: "自然史博物館（午前）→ 博物館カフェで昼食 → ダイアナ妃記念遊び場（午後）。移動距離が短く、地下鉄駅から博物館まで地下通路で行けます。雨でも成立します。",
            best: true,
          },
          {
            head: "テムズ川1日",
            body: "ロンドン塔（午前）→ バラ・マーケットで昼食 → 船でウェストミンスターへ（午後）。船移動が休憩を兼ねます。7歳以上ならこれが最も満足度が高い組み合わせです。",
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "ハリー・ポッターは年齢を選ぶ",
        body: "**スタジオツアーは丸1日かかり、2〜3ヶ月前に売り切れます**。原作を読んでいる子（おおむね8歳以上）なら最高の1日ですが、小さい子には長すぎます。市内のロケ地だけなら短時間で回れるので、[ハリー・ポッターのロンドン](/sightseeing/harry-potter)を先に検討してください。",
      },
    ],
  },
];

export const withKidsFaq: GuideFaqItem[] = [
  {
    question: "子どもの交通費はかかりますか？",
    answer:
      "**11歳以下は大人と一緒なら地下鉄・バスとも無料**です。改札脇の広いゲートを大人がタッチして一緒に通ります。11〜15歳は割引運賃、16歳以上は大人料金です。バスは15歳以下なら無料です。",
  },
  {
    question: "ベビーカーで地下鉄に乗れますか？",
    answer:
      "**乗れますが、エレベーターのない駅が非常に多い**ので苦労します。対策は、①バスを使う（全路線がベビーカー対応）、②エリザベス・ラインや DLR などバリアフリーの新しい路線を選ぶ、③TfL アプリで step-free ルートを検索する、の3つです。",
  },
  {
    question: "子連れで1日に何ヶ所回れますか？",
    answer:
      "**2ヶ所までにしてください**。大型施設を3ヶ所以上入れると、移動と待ち時間で子どもの体力が尽きます。午前に1ヶ所、午後に1ヶ所、あいだに公園の自由時間を挟むのが最も機嫌よく1日が終わる形です。",
  },
  {
    question: "レストランに子どもを連れて入れますか？",
    answer:
      "**チェーン系のレストランは子連れに慣れており、キッズメニューもあります**。パブも昼間なら問題ありませんが、夜は18歳未満の入店を制限する店があります。**夕食は17:30〜18:30 に始める**と、店も空いていて快適です。",
  },
  {
    question: "オムツ替えの場所はありますか？",
    answer:
      "**博物館とデパートには確実にあります**。大英博物館、自然史博物館、科学博物館、ハロッズ、ジョン・ルイスなどが使いやすい場所です。パブや小さなレストランにはほぼないので、大型施設にいるうちに済ませておくのが鉄則です。",
  },
  {
    question: "雨の日はどこに行けばいいですか？",
    answer:
      "**自然史博物館と科学博物館**です。サウス・ケンジントン駅から**地下通路で直結**しており、地上に出ずに行けます。どちらも無料で半日過ごせます。詳しくは[雨の日のロンドン](/sightseeing/itinerary/rainy-day)へ。",
  },
];

export const withKidsAttractionSlugs = [
  "tower-of-london",
  "british-museum-london",
  "london-zoo",
  "london-transport-museum",
];

export const withKidsSources: GuideSourceLink[] = [
  {
    label: "Transport for London – 子どもの運賃と無料乗車",
    url: "https://tfl.gov.uk/fares/free-and-discounted-travel",
  },
  { label: "Natural History Museum – 開館時間・展示", url: "https://www.nhm.ac.uk/" },
  {
    label: "Science Museum – Wonderlab とファミリー向け情報",
    url: "https://www.sciencemuseum.org.uk/",
  },
  {
    label: "The Royal Parks – ダイアナ妃記念遊び場",
    url: "https://www.royalparks.org.uk/visit/parks/kensington-gardens",
  },
];

export const withKidsRelatedLinks: GuideRelatedLink[] = [
  { href: "/sightseeing/kids-free-activities", label: "子連れで楽しむ無料スポット" },
  { href: "/museums/best-museums-for-kids", label: "子ども向けの博物館ベスト" },
  { href: "/sightseeing/transport/bus", label: "バスとトラムのガイド" },
  { href: "/sightseeing/harry-potter", label: "ハリー・ポッターのロンドン" },
];
