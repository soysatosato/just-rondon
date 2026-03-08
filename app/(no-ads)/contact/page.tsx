import ContactForm from "@/components/form/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center mb-12 md:block md:min-h-0">
      <div className="max-w-lg mx-auto p-6 bg-background rounded-2xl shadow-md max-h-[90vh] overflow-y-auto">
        <div className="mb-12">
          <h2 className="text-xl md:text-3xl font-bold mb-4 text-center">
            お問い合わせ
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Just Rondon
            に関するご質問・ご感想・掲載内容についてのお問い合わせは、
            こちらのフォームよりご連絡ください。
            <br />
            内容を確認のうえ、順次対応いたします。
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
