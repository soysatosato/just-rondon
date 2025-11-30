import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewsLetter() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              Visit London ニュースレターでロンドンの最新情報をゲット
            </h2>
            <p className="mb-4 max-w-xl text-sm text-slate-600">
              季節の見どころ、新規オープン、限定オファーなどをいち早くお届けします。いつでも解約可能。
            </p>
            <form className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="メールアドレス"
                className="bg-white"
              />
              <Button type="submit" className="whitespace-nowrap text-xs">
                購読する
              </Button>
            </form>
            <p className="mt-3 max-w-xl text-[11px] leading-relaxed text-slate-500">
              購読することで、利用規約とプライバシーポリシーに同意したものとみなされます。
            </p>
          </div>

          <div className="relative hidden h-40 w-full overflow-hidden rounded-2xl sm:block lg:h-48">
            <Image
              src=""
              alt="ロンドンのスカイライン"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
