import {
  SitePageHeader,
  SitePageShell,
  SiteSections,
  type SiteSection,
} from "@/components/site/SitePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/about",
  title: "このサイトについて",
  description:
    "ジャスト・ロンドンは、ロンドンの観光・文化・生活・ニュースを日本語でわかりやすく紹介するサイトです。運営方針と掲載情報の考え方について説明します。",
});

const sections: SiteSection[] = [
  {
    title: "Just Rondon について",
    content: [
      "Just Rondon は、ロンドンの観光(名所・美術館・ミュージカル)と、ビザ・住まい・仕事など在住者の実務を日本語でまとめているサイトです。",
      "ジャスト・ロンドンは、ロンドンの深層に迫る力量も器量もない中途半端な存在ですが、旅の判断をほんの少し整える一文が紛れていれば、それだけで存在理由になります。",
    ],
  },
  {
    title: "サイト名について",
    content: [
      "サイト名の Rondon は、London の L を Real（本物の、ありのままの）の R に替えたものです。",
      "ガイドブックに載っている情報だけでなく、ロンドンで暮らして分かったことも書く、というつもりで付けました。",
    ],
  },
  {
    // 何をしているかだけを書く。「価値のある内容を目指す」のような、
    // どのサイトにも当てはまる文は置かない。
    title: "運営方針",
    content: [
      "その週の催しと運休は「今週のロンドン」に毎週まとめています。運賃・入場料・最低賃金などの改定は「今月変わったロンドン」に月ごとにまとめ、そのときサイト内の数字も直しています。",
      "飲食店のサービスチャージ未払いを雇用審判所に申し立てた記録は、運営者自身の経験を書いたものです。",
    ],
    links: [
      { label: "今週のロンドン", href: "/events" },
      { label: "今月変わったロンドン", href: "/changes" },
      { label: "サービスチャージ未払いの記録", href: "/jobs/service-charges/case-story" },
    ],
  },
  {
    id: "editorial",
    title: "編集方針",
    content: [
      "コラムなどの読み物は「ジャスト・ロンドン編集部」の名義で掲載しています。",
      "記事は公開されている資料をもとに書いています。議会の議事録、法令、官報、当時の論文、所蔵館の記録など、元の資料を開いて主な日付・数字・引用を確かめられた記事には、末尾に「参考資料」として確認に使った資料を載せています。",
      "記事の誤りにお気づきの際は、お問い合わせフォームからお知らせください。確認のうえ本文を訂正します。",
    ],
    links: [{ label: "お問い合わせ", href: "/contact" }],
  },
  // 「正確性を保証するものではありません」の免責は利用規約の
  // 「掲載情報について」に同じ文がある。ここで三度目を言わない。
];

export default function AboutPage() {
  return (
    <SitePageShell>
      <SitePageHeader
        kicker="About"
        title="ジャスト・ロンドンについて"
        lede="ロンドンを日本語で伝える、このサイトの目的と運営方針について。"
      />

      <SiteSections sections={sections} />
    </SitePageShell>
  );
}
