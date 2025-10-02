"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

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
              <div className="w-full flex items-center justify-between gap-4">
                <span className="text-left">{trivia.title}</span>

                <Link
                  href={`/admin/museum/${trivia.museumId}/museumTrivia/${trivia.id}/edit`}
                  onClick={(e) => e.stopPropagation()} // Accordion 開閉を防ぐ
                >
                  <Button variant="ghost" size="icon">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
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
