import { buildPageMetadata } from "@/lib/seo";
import SectionHub, { type HubSection } from "@/components/hub/SectionHub";

const PATH = "/travel";
const TITLE = "旅の準備";
const LEAD =
  "出発前に済ませる手続きから、現地での移動と滞在、困ったときの対処まで。旅の段取りの順に並べています。";

export const metadata = buildPageMetadata({
  path: PATH,
  title: "ロンドン旅行の準備｜ETA・モデルコース・宿・交通・予算・トラブル対応",
  description:
    "ロンドン旅行の準備を段取りの順に。出発前のETA申請、日数別のモデルコース、宿泊エリアの選び方、旅の予算。現地での地下鉄・バス・空港アクセス、チップと支払い、今週の運休情報。スリや紛失に遭ったときの対処まで、旅行者の実務をまとめています。",
  keywords: [
    "ロンドン 旅行 準備",
    "ロンドン 旅行 持ち物",
    "イギリス ETA",
    "ロンドン モデルコース",
    "ロンドン 交通",
    "ロンドン 旅行 予算",
  ],
});

/**
 * 「旅の準備」の区分のトップ。
 *
 * 以前はこの区分にトップが無く、ナビの入口は「旅の実用情報」
 * (/sightseeing/travel-tips、スマホで17画面の記事)に直接つながっていた。
 * ETA・宿・交通・予算のどれを探している人も、まず長い記事に着いていた。
 *
 * 各ページのURLは /sightseeing 配下のまま動かさない。パンくずも
 * 「観光 > ◯◯」のままにする(components/navigation/tree.ts の注記)。
 * ここは索引に徹し、段取りの順(出発前→現地で→困ったら)に束ねる。
 */
const SECTIONS: HubSection[] = [
  {
    group: "出発前",
    href: "/sightseeing/eta-uk-visa-guide",
    eyebrow: "Entry",
    label: "ETA（電子渡航認証）",
    blurb:
      "日本国籍でもイギリスに入るには事前の電子渡航認証が要ります。費用£20、公式アプリの英語画面を日本語の対訳つきで、6つの手順に沿って。",
  },
  {
    group: "出発前",
    href: "/sightseeing/itinerary",
    eyebrow: "Itinerary",
    label: "モデルコース（1〜5日）",
    blurb:
      "1日目から5日目までの王道のルートと、滞在日数ごとの圧縮版。雨の日・子ども連れ・乗り継ぎの半日向けの分かれ道も用意しています。",
    links: [
      { href: "/plan", label: "旅行プランを作る" },
      { href: "/sightseeing/must-see", label: "必見スポット" },
    ],
  },
  {
    group: "出発前",
    href: "/sightseeing/hotels",
    eyebrow: "Where to Stay",
    label: "宿泊エリアの選び方",
    blurb:
      "どの街に泊まるかで毎日の移動の手間が変わります。主要エリアの特徴と注意点、ホテルの種類ごとの予算の目安、部屋の狭さなど日本と違うところ。",
  },
  {
    group: "出発前",
    href: "/sightseeing/budget",
    eyebrow: "Budget",
    label: "旅の予算",
    blurb:
      "7日間の費用を宿・食事・交通・入場料に分けて、節約・標準・ゆとりの3通りで積み上げています。",
    links: [
      { href: "/prices", label: "ロンドンの物価" },
      { href: "/sightseeing/passes", label: "ロンドンパスの損得" },
    ],
  },
  {
    group: "ロンドンで",
    href: "/sightseeing/transport",
    eyebrow: "Getting Around",
    label: "交通ガイド",
    blurb:
      "切符を買わずにタッチ決済で乗る方法と1日の上限額、5つの空港から市内への行き方、ロンドンの外へ出るときの鉄道切符の買い方。",
    links: [
      { href: "/sightseeing/transport/airports", label: "空港から市内へ" },
      { href: "/sightseeing/transport/fares", label: "運賃と支払い方" },
      { href: "/sightseeing/transport/national-rail", label: "鉄道切符の買い方" },
      { href: "/sightseeing/step-free", label: "バリアフリーで回る" },
    ],
  },
  {
    group: "ロンドンで",
    href: "/sightseeing/travel-tips",
    eyebrow: "Practical Tips",
    label: "旅の実用情報",
    blurb:
      "治安とスリ対策、旅行者の医療と保険、eSIM、電源プラグ、月ごとの服装、クリスマスや祝日の休業。滞在中に知っておきたいことをまとめています。",
    links: [{ href: "/sightseeing/tipping-and-payment", label: "チップと支払い" }],
  },
  {
    group: "ロンドンで",
    href: "/events",
    eyebrow: "This Week",
    label: "今週のロンドン",
    blurb:
      "その週の催しと、運休やストライキのように予定に響く支障を毎週まとめています。",
    links: [
      { href: "/events/calendar", label: "年間イベントカレンダー" },
      { href: "/changes", label: "今月変わったロンドン" },
    ],
  },
  {
    group: "困ったとき",
    href: "/trouble",
    eyebrow: "If Things Go Wrong",
    label: "トラブル対応",
    blurb:
      "スリ、パスポートの紛失、落とし物。起きてしまったあとに何をするかを順番どおりに。999 と 101 の使い分けも。",
    links: [
      { href: "/trouble/pickpocket", label: "スリに遭ったら" },
      { href: "/trouble/lost-passport", label: "パスポートを失くしたら" },
      { href: "/trouble/police-report", label: "警察に届け出る" },
    ],
  },
];

export default function TravelPage() {
  return (
    <SectionHub
      path={PATH}
      eyebrow="Traveller Info"
      title={TITLE}
      lead={LEAD}
      sections={SECTIONS}
      aside={{
        heading: "あわせて使う",
        note: "ロンドンを拠点に日帰り・1泊で行ける行き先と、行きたい場所を選ぶだけで日ごとの予定になる旅行プラン。",
        links: [
          { href: "/beyond-london", label: "ロンドンの外へ" },
          { href: "/plan", label: "旅行プランを作る" },
          { href: "/prices", label: "ロンドンの物価" },
        ],
      }}
    />
  );
}
