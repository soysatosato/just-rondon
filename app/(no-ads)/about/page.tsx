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
      "Just Rondon は、ロンドンの観光、文化、生活、ニュースなどに関する情報を日本語でわかりやすく紹介するサイトです。",
      "ロンドンに興味がある方、旅行を計画している方、現地の雰囲気や話題を知りたい方に向けて、役立つ情報を整理して発信しています。",
    ],
  },
  {
    title: "サイト名について",
    content: [
      "サイト名を「Just London」ではなく「Just Rondon」としているのは、綴りの遊びではありません。",
      "ガイドブックやパンフレットに載っているような表面的な情報だけでなく、実際に現地で暮らし、歩いて初めてわかる「生」の情報を届けたいという思いから、London の頭文字を Real（本物の、ありのままの）の R に置き換えています。",
      "きれいに整えられた観光情報ではなく、等身大のロンドンを伝える。その姿勢を、サイト名そのものに込めています。",
    ],
  },
  {
    title: "運営方針",
    content: [
      "本サイトでは、公開情報や各種資料を参考にしながら、読者にとって理解しやすい形で情報をまとめています。",
      "あわせて、実際の体験や視点を交えながら、単なる情報の羅列ではなく、読み手にとって価値のある内容を目指しています。",
    ],
  },
  {
    title: "掲載内容について",
    content: [
      "掲載内容は、できる限り正確で最新の情報となるよう努めていますが、その正確性、完全性、最新性を保証するものではありません。",
      "施設情報、価格、営業時間、制度、イベント情報などは変更される場合があるため、必要に応じて公式情報もあわせてご確認ください。",
    ],
  },
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
