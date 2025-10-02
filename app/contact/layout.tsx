export const metadata = {
  title: "お問い合わせ | ロンドん！",
  description:
    "質問や相談、お仕事の依頼など、ちょっとしたお問い合わせもお気軽にどうぞ。",
  openGraph: {
    type: "website",
    url: "https://www.just-rondon.com/contact",
    title: "お問い合わせ | ロンドん！",
    description:
      "質問や相談、お仕事の依頼など、ちょっとしたお問い合わせもお気軽にどうぞ。",
    siteName: "ロンドん！",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `https://www.just-rondon.com/contact`,
  },
};

export default function ContactLayout({ children }: { children: any }) {
  return <div>{children}</div>;
}
