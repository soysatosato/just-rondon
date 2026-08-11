import Markdown from "react-markdown";

export default function MuseumAbout({
  description,
}: {
  description?: string | null;
}) {
  if (!description) return null;

  const paragraphs = description.split(/\r?\n/).filter((p) => p.trim());

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          About
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          どんなところか
        </h2>
      </div>

      <div className="space-y-4">
        {paragraphs.map((text, i) => (
          <div
            key={i}
            className="text-sm leading-relaxed text-muted-foreground [&_a]:text-indigo-600 [&_a]:underline dark:[&_a]:text-indigo-400 [&_strong]:font-semibold [&_strong]:text-foreground"
          >
            <Markdown>{text}</Markdown>
          </div>
        ))}
      </div>
    </section>
  );
}
