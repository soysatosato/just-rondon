import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import type { GuideFaqItem } from "./types";

/** /sightseeing ハブの FAQ と同じ見た目にそろえた Accordion。 */
export default function GuideFaq({ items }: { items: GuideFaqItem[] }) {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-lg font-semibold">よくある質問</h2>

      <Accordion type="single" collapsible className="space-y-3">
        {items.map((item, idx) => (
          <AccordionItem
            key={item.question}
            value={`faq-${idx}`}
            className="border-none"
          >
            <Card className="border-gray-300 dark:border-neutral-700 shadow-sm">
              <AccordionTrigger className="px-5 py-4 text-left">
                <span className="text-sm font-semibold">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <MarkdownBody>{item.answer}</MarkdownBody>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
