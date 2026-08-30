import ContactForm from "@/components/form/ContactForm";
import {
  SitePageHeader,
  SitePageNav,
  SitePageShell,
} from "@/components/site/SitePageLayout";

export default function ContactPage() {
  return (
    <SitePageShell>
      <SitePageHeader
        kicker="Contact"
        title="お問い合わせ"
        lede="ご質問・ご感想、掲載内容の誤りのご指摘、お仕事のご依頼まで。内容を確認のうえ、順次お返事します。"
      />

      <div className="mt-12">
        <ContactForm />
      </div>

      <SitePageNav current="/contact" />
    </SitePageShell>
  );
}
