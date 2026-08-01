import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/about",
  title: "このサイトについて",
  description:
    "ジャスト・ロンドンは、ロンドンの観光・文化・生活・ニュースを日本語でわかりやすく紹介するサイトです。運営方針と掲載情報の考え方について説明します。",
});

const sections = [
  {
    title: "Just Rondon について",
    content: [
      "Just Rondon は、ロンドンの観光、文化、生活、ニュースなどに関する情報を日本語でわかりやすく紹介するサイトです。",
      "ロンドンに興味がある方、旅行を計画している方、現地の雰囲気や話題を知りたい方に向けて、役立つ情報を整理して発信しています。",
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
  {
    title: "お問い合わせ",
    content: [
      "掲載内容に関するご質問、ご意見、ご連絡は Contact ページよりお願いいたします。",
    ],
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-6">
      <div className="mx-auto max-w-3xl">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-center text-2xl font-bold tracking-tight md:text-4xl">
              About
            </CardTitle>
            <p className="text-center text-sm leading-6 text-muted-foreground md:text-base">
              このサイトの目的や運営方針についてご案内します。
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                  {section.title}
                </h2>

                <div className="space-y-3">
                  {section.content.map((paragraph, index) => (
                    <p
                      key={`${section.title}-${index}`}
                      className="text-sm leading-7 text-foreground md:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
