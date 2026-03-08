import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "個人情報の利用目的",
    content: [
      "当サイトでは、お問い合わせの際にメールアドレス等の個人情報をご入力いただく場合があります。",
      "これらの情報は、お問い合わせへの回答や必要なご連絡のために利用し、それ以外の目的では利用しません。",
    ],
  },
  {
    title: "広告について",
    content: [
      "当サイトでは、第三者配信の広告サービスを利用する場合があります。",
      "広告配信事業者は、ユーザーの興味に応じた広告を表示するために Cookie を使用することがあります。",
      "Cookie によりブラウザを識別することがありますが、個人を特定するものではありません。",
    ],
  },

  {
    title: "免責事項",
    content: [
      "当サイトに掲載する情報については、可能な限り正確な内容を提供するよう努めていますが、その正確性、安全性、完全性を保証するものではありません。",
      "当サイトに掲載された内容によって生じた損害等については、一切の責任を負いかねます。",
    ],
  },
  {
    title: "著作権について",
    content: [
      "当サイトに掲載している文章、画像、その他の著作物の無断転載・無断使用を禁止します。",
    ],
  },
  {
    title: "プライバシーポリシーの変更",
    content: [
      "本ポリシーの内容は、必要に応じて予告なく変更することがあります。",
      "変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-6">
      <div className="mx-auto max-w-3xl">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-center text-2xl font-bold tracking-tight md:text-4xl">
              Privacy Policy
            </CardTitle>
            <p className="text-center text-sm leading-6 text-muted-foreground md:text-base">
              当サイトにおける個人情報の取り扱いについてご説明します。
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
