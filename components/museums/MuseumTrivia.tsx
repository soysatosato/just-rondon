import ReactMarkdown from "react-markdown";
import { Lightbulb } from "lucide-react";

type TriviaItem = {
  id: string;
  title: string;
  content: string;
};

export function MuseumTrivia({ trivia }: { trivia: TriviaItem[] }) {
  if (!trivia || trivia.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-amber-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Trivia
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          知っていると見え方が変わる話
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {trivia.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
              <h3 className="font-semibold leading-snug tracking-tight">
                {item.title}
              </h3>
            </div>
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground [&_a]:text-indigo-600 [&_a]:underline dark:[&_a]:text-indigo-400 [&_p]:mt-2 [&_p:first-child]:mt-0 [&_strong]:font-semibold [&_strong]:text-foreground">
              <ReactMarkdown>{item.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
