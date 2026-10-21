import { ChevronDown } from "lucide-react";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import type { GuideFaqItem } from "./types";

/**
 * ガイドの「よくある質問」。/sightseeing ハブの FAQ と同じ見た目。
 *
 * 開閉は details/summary で作る。以前の Accordion(Radix)は閉じている項目の
 * 中身を描画しないので、答えの文章が HTML にも描画後の DOM にも無く、
 * Google が読めたのは質問の文だけだった(答えは JSON-LD と RSC payload にしか
 * 無かった)。質問にそのまま答える短い文は、検索結果の抜粋や AI による概要に
 * いちばん使われやすい部分で、それを本文として読ませていなかったことになる。
 *
 * details なら閉じていても全文が DOM にあり、検索エンジンにも Ctrl+F にも
 * 掛かる。クライアントの JS も要らない。
 */
export default function GuideFaq({ items }: { items: GuideFaqItem[] }) {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-lg font-semibold">よくある質問</h2>

      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-neutral-300 bg-card text-card-foreground shadow-sm dark:border-neutral-700"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left hover:underline [&::-webkit-details-marker]:hidden">
              <span className="text-base font-semibold">{item.question}</span>
              <ChevronDown
                aria-hidden
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="px-5 pb-4 text-sm text-neutral-700 dark:text-neutral-300">
              <MarkdownBody>{item.answer}</MarkdownBody>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
