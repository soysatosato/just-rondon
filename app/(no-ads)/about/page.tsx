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
    "ジャスト・ロンドンは、ロンドンの観光と、ビザ・住まい・仕事など在住者の実務を日本語でまとめているサイトです。サイト名の由来と、記事の書き方・訂正の受け付けについて説明します。",
});

const sections: SiteSection[] = [
  {
    title: "載せているもの",
    content: [
      "ジャスト・ロンドン（Just Rondon）は、ロンドンの観光と、ビザ・住まい・仕事など在住者の実務を日本語でまとめているサイトです。観光スポット・美術館・ミュージカル・食事の案内、近郊への日帰り、旅行プランの作成とスタンプ帳、コラム・イギリス英語・ロンドンの街の読み物があります。",
      // 次の一文は運営者本人の言葉。言い回しを変えない。
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
    ],
  },
  {
    id: "editorial",
    title: "編集方針",
    content: [
      "読み物は、公開されている資料をもとに書いています。議会の議事録、法令、官報、当時の論文、所蔵館の記録など、元の資料を開いて主な日付・数字・引用を確かめられた記事には、末尾に「参考資料」として確認に使った資料を載せています。",
      "記事の誤りにお気づきの際は、お問い合わせフォームからお知らせください。確認のうえ本文を訂正します。",
    ],
    links: [{ label: "お問い合わせ", href: "/contact" }],
  },
  // 「正確性を保証するものではありません」の免責は利用規約の
  // 「掲載情報について」にある。ここで繰り返さない。
];

export default function AboutPage() {
  return (
    <SitePageShell>
      <SitePageHeader
        kicker="About"
        title="ジャスト・ロンドンについて"
        lede="このサイトに何が載っているか、サイト名の由来、記事の書き方について。"
      />

      <SiteSections sections={sections} />
    </SitePageShell>
  );
}
