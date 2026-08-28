import { buildPageMetadata } from "@/lib/seo";
import SectionHub, { type HubSection } from "@/components/hub/SectionHub";

const PATH = "/living";
const TITLE = "住む・働く";
const LEAD =
  "観光では終わらない人のために。滞在資格を取り、部屋を借り、口座を開き、体調を崩したときにどこへ行くか。渡英前から順に並べています。";

export const metadata = buildPageMetadata({
  path: PATH,
  title: "イギリスで住む・働く｜ビザ・住まい・お金・医療のガイド",
  description:
    "英国ビザ、ロンドンの部屋探し、銀行口座と送金、NHSでの受診、食費、労働問題、人間関係、トラブル対応。イギリスで暮らす人が渡英前から順に必要になる実務を、手続きの流れごとにまとめています。",
  keywords: [
    "イギリス 移住",
    "ロンドン 生活",
    "イギリス ビザ",
    "ロンドン 部屋探し",
    "イギリス 銀行口座",
    "NHS 受診",
  ],
});

/**
 * 並びは手続きが必要になる順。ビザ→住まい→口座は前が済まないと次に進めず、
 * 実際この順で詰まる。医療から下は「暮らし始めてから」なので順不同でよいが、
 * トラブル対応だけは末尾に固定する(困っている人は目次を上から読まない)。
 */
const SECTIONS: HubSection[] = [
  {
    href: "/visa",
    eyebrow: "Visa",
    label: "ビザガイド",
    blurb:
      "どの資格で滞在するか。短期の訪問から就労・留学・家族帯同まで、要件と費用、申請の順番を種類ごとに。渡英後にすぐ必要になる手続きも含みます。",
    links: [
      { href: "/visa/after-arrival", label: "渡英後の手続き" },
      { href: "/sightseeing/eta-uk-visa-guide", label: "ETA（短期訪問）" },
    ],
  },
  {
    href: "/housing",
    eyebrow: "Housing",
    label: "住まい探し",
    blurb:
      "物件サイトの使い分けから内見、レファレンス、デポジット、退去まで。借主保護の制度が段階的に変わっている最中なので、いつ時点の話かを明記しています。",
    links: [
      { href: "/housing/rightmove-zoopla-openrent", label: "物件サイトの使い分け" },
      { href: "/housing/deposits-and-fees", label: "デポジットと初期費用" },
    ],
  },
  {
    href: "/money",
    eyebrow: "Money",
    label: "お金・銀行",
    blurb:
      "住所証明が無くても開ける口座、日本からの送金、税と年金の基礎。渡英直後にいちばん詰まるのが口座開設なので、そこから書いています。",
    links: [{ href: "/money/opening-an-account", label: "渡英直後に開ける口座" }],
  },
  {
    href: "/health",
    eyebrow: "NHS",
    label: "医療・NHS",
    blurb:
      "GPへの登録、予約の取り方、救急の使い分け、歯科と処方箋の負担額。日本の「とりあえず病院に行く」が通じない仕組みを前提から説明します。",
    links: [{ href: "/health/gp-registration", label: "GP に登録する" }],
  },
  {
    href: "/food",
    eyebrow: "Food Budget",
    label: "食費を抑える",
    blurb:
      "ミールディール、値引きの時間帯、ロイヤルティカード、アプリのクーポン。外食が高い街で、実際に効く順に並べています。",
    links: [
      { href: "/food/meal-deal", label: "ミールディール" },
      { href: "/food/discount-timing", label: "値引きの時間帯" },
    ],
  },
  {
    href: "/jobs",
    eyebrow: "Work",
    label: "労働問題",
    blurb:
      "雇用契約、最低賃金、職場のハラスメント、年金。飲食店のサービスチャージ未払いについては、実際に請求した当事者の記録を別立てで置いています。",
    links: [
      { href: "/jobs/service-charges", label: "サービスチャージ完全ガイド" },
      { href: "/jobs/employment-contract", label: "雇用契約書の読み方" },
    ],
  },
  {
    href: "/social",
    eyebrow: "Social Life",
    label: "出会いと人間関係",
    blurb:
      "友人のつくり方、続け方、距離の取り方。日本人コミュニティとの付き合い方や、出会い系アプリを使うときの安全確保まで。",
    links: [
      { href: "/social/how-brits-make-friends", label: "イギリス人の友達のつくり方" },
      { href: "/social/dating-safety", label: "安全に会うために" },
    ],
  },
  {
    href: "/trouble",
    eyebrow: "In Trouble",
    label: "トラブル対応",
    blurb:
      "盗難、紛失、詐欺。起きてしまったあとに何を、どの順で行うか。保険請求に要る番号の取り方と、大使館での手続きまで。",
    links: [{ href: "/trouble/police-report", label: "警察に届け出る" }],
  },
];

export default function LivingPage() {
  return (
    <SectionHub
      path={PATH}
      eyebrow="Living in the UK"
      title={TITLE}
      lead={LEAD}
      sections={SECTIONS}
    />
  );
}
