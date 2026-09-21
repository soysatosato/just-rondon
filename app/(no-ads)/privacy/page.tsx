import {
  SitePageHeader,
  SitePageShell,
  SiteSections,
  type SiteSection,
} from "@/components/site/SitePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/privacy",
  title: "プライバシーポリシー",
  description:
    "ジャスト・ロンドンにおける個人情報の取り扱い(お問い合わせ、スタンプ帳のアカウント)、広告配信(Google AdSense)およびアクセス解析(Google アナリティクス)での Cookie の利用と、その無効化方法について説明します。",
});

const sections: SiteSection[] = [
  {
    title: "個人情報の利用目的",
    content: [
      "当サイトでは、次の場合に個人情報をお預かりします。",
      "・お問い合わせの際にご入力いただくメールアドレス等",
      "・スタンプ帳を使うために登録していただくアカウントの情報（詳しくは次の「アカウントとスタンプ帳について」をご覧ください）",
      "これらの情報は、お問い合わせへの回答や必要なご連絡、スタンプ帳の提供のために利用し、それ以外の目的では利用しません。",
    ],
  },
  {
    title: "アカウントとスタンプ帳について",
    content: [
      "スタンプ帳を使うにはアカウントの登録が必要です。ログインの仕組みには Clerk, Inc.（米国）のサービスを利用しており、アカウントの情報は同社が管理します。ログインの状態を保つために Cookie を使います。",
      "Clerk が受け取る情報は次のとおりです。",
      "・メールアドレスとパスワード（パスワードは当サイトからは見えません）",
      "・Google または LINE で登録・ログインした場合は、連携元のアカウントに登録されている名前、プロフィール画像、メールアドレスなど",
      "・ログインしている端末の情報（ブラウザの種類、IP アドレスなど）",
      "名前とプロフィール画像は、当サイトでは一切使用していません。Google・LINE の仕組み上、連携するとこれらが Clerk に渡るため、渡したくない場合はメールアドレスで登録してください。",
      "当サイトのデータベースに保存するのは、Clerk のアカウントID、ユーザーネーム、スタンプの記録（押した場所、押した日時、現地で押したかどうか）だけです。",
      "「現地で押す」ボタンを使ったときは、端末の位置情報を送っていただき、その場所の近くにいるかの判定にだけ使います。位置情報そのものは保存しません。",
      "アカウント設定の「アカウントを削除」から、ユーザーネームとスタンプの記録、Clerk 上のアカウントをまとめて削除できます。",
    ],
    links: [
      {
        label: "Clerk のプライバシーポリシー（英語）",
        href: "https://clerk.com/legal/privacy",
      },
    ],
  },
  {
    title: "広告配信について",
    content: [
      "当サイトでは、第三者配信の広告サービスとして Google AdSense を利用しています。",
      "Google を含む第三者配信事業者は、Cookie を使用して、ユーザーが当サイトや他のサイトに過去にアクセスした際の情報に基づいて広告を配信します。",
      "Cookie によりブラウザを識別することがありますが、氏名や住所などの個人を特定する情報は含まれません。",
      "パーソナライズ広告は、広告設定ページからいつでも無効にできます。",
    ],
    links: [
      {
        label: "Google の広告設定",
        href: "https://policies.google.com/technologies/ads",
      },
    ],
  },
  {
    title: "アクセス解析について",
    content: [
      "当サイトでは、サイトの利用状況を把握するために Google アナリティクス（GA4）を利用しています。",
      "Google アナリティクスは Cookie を使用してアクセス情報を収集しますが、収集されるデータは匿名で行われ、個人を特定するものではありません。",
      "この収集は、Google アナリティクス オプトアウト アドオンを導入することで拒否できます。",
    ],
    links: [
      {
        label: "Google アナリティクス オプトアウト アドオン",
        href: "https://tools.google.com/dlpage/gaoptout",
      },
      {
        label: "Google のプライバシーポリシー",
        href: "https://policies.google.com/privacy",
      },
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
    <SitePageShell>
      <SitePageHeader
        kicker="Privacy"
        title="プライバシーポリシー"
        lede="当サイトにおける個人情報の取り扱い、Cookie の利用と、その無効化の方法について。"
      />

      <SiteSections sections={sections} />
    </SitePageShell>
  );
}
