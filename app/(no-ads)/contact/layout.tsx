import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/contact",
  title: "お問い合わせ",
  description:
    "ご質問・ご感想、掲載内容の誤りのご指摘、お仕事のご依頼を受け付けています。",
});

export default function ContactLayout({ children }: { children: any }) {
  return <div>{children}</div>;
}
