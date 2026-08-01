import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/contact",
  title: "お問い合わせ",
  description:
    "質問や相談、お仕事の依頼など、ちょっとしたお問い合わせもお気軽にどうぞ。",
});

export default function ContactLayout({ children }: { children: any }) {
  return <div>{children}</div>;
}
