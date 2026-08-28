import { buildPageMetadata } from "@/lib/seo";
import SectionHub, { type HubSection } from "@/components/hub/SectionHub";

const PATH = "/things-to-do";
const TITLE = "体験する";
const LEAD =
  "見るだけでは終わらない過ごし方。劇場に座り、パブで注文し、市場で値段を聞く。この街でしかできないことを、作法と段取りから。";

export const metadata = buildPageMetadata({
  path: PATH,
  title: "ロンドンで体験する｜観劇・食事・買い物のガイド",
  description:
    "ウエストエンドの観劇、パブとイギリス料理、マーケットとデパートの買い物、イギリスのブランドとお土産。ロンドンで「する」ことを、チケットの取り方や店での振る舞いといった段取りから解説します。",
  keywords: [
    "ロンドン 体験",
    "ロンドン ミュージカル",
    "ロンドン パブ",
    "ロンドン 買い物",
    "ロンドン お土産",
  ],
});

/**
 * 並びは「予約が要る順」。観劇はチケットを先に取らないと成立せず、
 * 食事は当日でも動ける。買い物は最後でよい。
 */
const SECTIONS: HubSection[] = [
  {
    href: "/musicals",
    eyebrow: "West End",
    label: "ミュージカル",
    blurb:
      "上演中の演目と、チケットを実際に取るまでの手順。当日券の並び方、劇場ごとの見え方の癖、英語が分からなくても楽しめる演目の選び方まで。",
    links: [
      { href: "/musicals/west-end-tickets", label: "チケットの取り方" },
      { href: "/musicals/west-end-etiquette", label: "観劇のマナー" },
      { href: "/musicals/theatres", label: "劇場ガイド" },
      { href: "/musicals/shows-without-english", label: "英語が不安なら" },
    ],
  },
  {
    href: "/restaurants",
    eyebrow: "Eat & Drink",
    label: "レストランとお店",
    blurb:
      "料理から店を選ぶための一覧と、店に入ってからの話。パブはカウンターで先に払う、予約が取れない店にも入り方がある——知らないと必ずつまずく前提をまとめています。",
    links: [
      { href: "/restaurants/pub-etiquette", label: "パブの作法" },
      { href: "/restaurants/must-visit", label: "絶対行くべき超人気店" },
    ],
  },
  {
    href: "/shopping",
    eyebrow: "Shopping",
    label: "ロンドンの買い物",
    blurb:
      "どこで買うかと、買い方の前提。市場は曜日で中身が変わり、日曜は営業時間が法律で制限されます。免税制度の現状もここに。",
    links: [
      { href: "/shopping/markets", label: "マーケット（曜日別）" },
      { href: "/shopping/department-stores", label: "デパート" },
      { href: "/shopping/vat-refund", label: "免税は使えるのか" },
    ],
  },
  {
    href: "/brands",
    eyebrow: "British Brands",
    label: "イギリスのブランド",
    blurb:
      "現地でしか買えない、あるいは現地の方が安いブランド。創業の背景と、ロンドンで実際に買える店舗を品目ごとに。",
  },
  {
    href: "/souvenirs",
    eyebrow: "Souvenirs",
    label: "ロンドンのお土産",
    blurb:
      "何を買って帰るか。定番の紅茶やビスケットから配りやすい小物まで、値段と買える場所を品目ごとに書いています。",
  },
];

export default function ThingsToDoPage() {
  return (
    <SectionHub
      path={PATH}
      eyebrow="Things to Do"
      title={TITLE}
      lead={LEAD}
      sections={SECTIONS}
      aside={{
        heading: "テーマで街を巡る",
        note:
          "特定の作品や競技を目当てに歩くなら、場所の側から入る方が早い。以下は観光ガイドの中にあります。",
        links: [
          { href: "/sightseeing/harry-potter", label: "ハリー・ポッター" },
          { href: "/sightseeing/film-locations", label: "映画・ドラマのロケ地" },
          { href: "/sightseeing/football", label: "プレミアリーグ観戦" },
          { href: "/sightseeing/thames-cruise", label: "テムズ川クルーズ" },
          { href: "/events/calendar", label: "年間イベントカレンダー" },
        ],
      }}
    />
  );
}
