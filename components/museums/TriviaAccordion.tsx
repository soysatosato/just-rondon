"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Trivia = {
  id: string;
  title: string;
  content: string;
  museumId?: string;
};

export default function TriviaAccordion({ trivias }: { trivias: Trivia[] }) {
  return (
    <div className="my-8">
      <h2 className="text-xl font-semibold mb-4">豆知識</h2>
      <Accordion type="multiple" className="w-full">
        {trivias.map((trivia) => (
          <AccordionItem key={trivia.id} value={trivia.id}>
            <AccordionTrigger>
              <span className="text-left">{trivia.title}</span>
            </AccordionTrigger>
            <AccordionContent className="whitespace-pre-line">
              {trivia.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
