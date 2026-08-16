import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Armchair, Building, Footprints } from "lucide-react";

/**
 * 劇場の読みもの部分。
 *
 * intro / seatingNotes / visitNotes の3節に分けて出す。1つでも
 * 埋まっていればそちらを使い、3つとも空の劇場だけ旧 notes に
 * フォールバックする。混在させないのは、書き直し済みの劇場で
 * 同じ内容が2回出るのを避けるため。
 */
export default function TheatreNotes({
  intro,
  seatingNotes,
  visitNotes,
  notes,
}: {
  intro: string | null;
  seatingNotes: string | null;
  visitNotes: string | null;
  notes: string | null;
}) {
  const hasSections = Boolean(intro || seatingNotes || visitNotes);

  if (!hasSections) {
    if (!notes) return null;
    return (
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
          この劇場で知っておきたいこと
        </h2>
        <Prose>{notes}</Prose>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {intro && (
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <SectionHeading icon={Building}>どんな劇場か</SectionHeading>
          <Prose>{intro}</Prose>
        </section>
      )}

      {seatingNotes && (
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <SectionHeading icon={Armchair}>座席の選び方</SectionHeading>
          <Prose>{seatingNotes}</Prose>
        </section>
      )}

      {visitNotes && (
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <SectionHeading icon={Footprints}>当日の動き方</SectionHeading>
          <Prose>{visitNotes}</Prose>
        </section>
      )}
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold sm:text-2xl">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon size={16} />
      </span>
      {children}
    </h2>
  );
}

function Prose({ children }: { children: string }) {
  return (
    <div className="space-y-3">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ ...props }) => (
            <p
              className="text-sm leading-relaxed text-foreground sm:text-base"
              {...props}
            />
          ),
          ul: ({ ...props }) => <ul className="space-y-1.5" {...props} />,
          li: ({ ...props }) => (
            <li
              className="ml-5 list-disc text-sm leading-relaxed text-foreground sm:text-base"
              {...props}
            />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
