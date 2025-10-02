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
            ふと「誰かに相談してみたいな」と思ったら、気軽に声をかけてください。
            <br />
            観光ガイドのお仕事も、Web制作のお手伝いも、大歓迎です。
            <br />
            小さな質問でも、どんな依頼でも、あなたの想いにしっかり向き合います。
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
