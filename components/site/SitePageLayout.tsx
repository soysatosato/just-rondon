/**
 * about / privacy / terms / contact の共通レイアウト。
 *
 * この4ページは以前、記事ページと違って本文全体を Card 1枚で囲っていた。
 * 全文を枠に入れると、章がいくつあるのか・いまどこを読んでいるのかが
 * 枠の内側で潰れてしまう。ここでは枠を外し、章番号とヘアラインだけで
 * 区切りを作っている。規約のように「第何項の話か」を指したい文書ほど、
 * 番号が振ってあるほうが引用しやすい。
 */

export function SitePageHeader({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
        {kicker}
      </p>
      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-400 md:text-base">
        {lede}
      </p>
    </header>
  );
}

export type SiteSection = {
  title: string;
  content: string[];
  links?: { label: string; href: string }[];
};

/**
 * 章の本体。行頭が「・」の行は箇条書きとして組み直す。
 * 利用規約の禁止事項がこの形で書かれており、段落として流すと
 * 5項目が1つの塊に見えてしまうため。
 */
function SectionBody({ section }: { section: SiteSection }) {
  const blocks: (
    { kind: "p"; text: string } | { kind: "ul"; items: string[] }
  )[] = [];

  for (const line of section.content) {
    if (line.startsWith("・")) {
      const last = blocks[blocks.length - 1];
      const item = line.slice(1);
      if (last?.kind === "ul") last.items.push(item);
      else blocks.push({ kind: "ul", items: [item] });
    } else {
      blocks.push({ kind: "p", text: line });
    }
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) =>
        block.kind === "p" ? (
          <p
            key={index}
            className="text-sm leading-8 text-gray-700 dark:text-gray-300 md:text-base"
          >
            {block.text}
          </p>
        ) : (
          <ul key={index} className="space-y-2">
            {block.items.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-7 text-gray-700 dark:text-gray-300 md:text-base"
              >
                <span
                  aria-hidden
                  className="mt-[0.7em] h-px w-3 shrink-0 bg-gray-400 dark:bg-neutral-600"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      )}

      {section.links && (
        <ul className="space-y-2 pt-1">
          {section.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-current dark:text-gray-100 dark:decoration-neutral-600"
              >
                {link.label}
                <span aria-hidden className="text-xs text-gray-400">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** 番号付きの章の連なり。番号は広い画面でのみ本文の左外に出す。 */
export function SiteSections({ sections }: { sections: SiteSection[] }) {
  return (
    <div className="mt-12 divide-y divide-gray-200 dark:divide-neutral-800">
      {sections.map((section, index) => (
        <section
          key={section.title}
          className="grid gap-3 py-8 first:pt-0 sm:grid-cols-[3rem_1fr] sm:gap-6"
        >
          <p
            aria-hidden
            className="text-sm font-semibold tabular-nums text-gray-300 dark:text-neutral-700 sm:pt-1"
          >
            {String(index + 1).padStart(2, "0")}
          </p>

          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight md:text-xl">
              {section.title}
            </h2>
            <SectionBody section={section} />
          </div>
        </section>
      ))}
    </div>
  );
}

export function SitePageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-1 py-12 text-gray-900 dark:text-gray-100 sm:px-4 md:py-16">
      {children}
    </main>
  );
}
