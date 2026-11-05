import Link from "next/link";

import ContactForm from "@/components/form/ContactForm";
import {
  SitePageHeader,
  SitePageShell,
} from "@/components/site/SitePageLayout";

export default function ContactPage() {
  return (
    <SitePageShell>
      <SitePageHeader
        kicker="Contact"
        title="お問い合わせ"
        lede="ご質問・ご感想、掲載内容の誤りのご指摘、お仕事のご依頼まで。内容を確認のうえ、順次お返事します。記事の誤りのご指摘は、該当ページの URL を添えていただくと確認が早くなります。"
      />

      <div className="mt-12">
        <ContactForm />
      </div>

      <p className="mt-8 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
        お送りいただいた情報の扱いは、
        <Link href="/privacy" className="underline underline-offset-2">
          プライバシーポリシー
        </Link>
        をご覧ください。
      </p>
    </SitePageShell>
  );
}
