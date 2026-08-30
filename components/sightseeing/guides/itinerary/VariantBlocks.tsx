import MarkdownBody from "@/components/jobs/MarkdownBody";
import GuideCallout from "@/components/guides/GuideCallout";
import GuideNotes from "@/components/guides/GuideNotes";
import DayTimeline from "./DayTimeline";
import type { Block } from "./blocks";

/** blocks.ts の語彙を描画する。種類ごとに形を変えることがこの部品の趣旨。 */
export default function VariantBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "prose":
      return <MarkdownBody>{block.body}</MarkdownBody>;

    case "verdicts":
      return (
        <ul className="space-y-2">
          {block.items.map((v) => (
            <li
              key={v.label}
              className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-neutral-700"
            >
              <span
                className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-bold ${
                  v.tone === "good"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : v.tone === "bad"
                      ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                      : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400"
                }`}
              >
                {v.verdict}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {v.label}
                </span>
                {v.detail && (
                  <span className="mt-0.5 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {v.detail}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      );

    case "cards":
      return (
        <ul
          className={`grid gap-3 ${
            block.cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
          }`}
        >
          {block.items.map((c) => (
            <li
              key={c.head}
              className={`rounded-lg border p-4 ${
                c.best
                  ? "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-gray-200 dark:border-neutral-700"
              }`}
            >
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {c.head}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {c.body}
              </p>
              {c.note && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {c.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      );

    case "list":
      return (
        <div
          className={
            block.title
              ? "rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              : ""
          }
        >
          {block.title && (
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {block.title}
            </p>
          )}
          <ul className={block.title ? "mt-2 space-y-1.5" : "space-y-1.5"}>
            {block.items.map((i) => (
              <li
                key={i}
                className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <span
                  aria-hidden
                  className={
                    block.tone === "do"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : block.tone === "dont"
                        ? "text-red-500"
                        : "text-gray-400"
                  }
                >
                  {block.tone === "do" ? "✓" : block.tone === "dont" ? "✕" : "・"}
                </span>
                {i}
              </li>
            ))}
          </ul>
        </div>
      );

    case "rows":
      return (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-neutral-800 dark:border-neutral-700">
          {block.items.map((r) => (
            <li key={r.name} className="px-4 py-3">
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {r.name}
                </span>
                {r.free && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    無料
                  </span>
                )}
                {r.meta?.map((m) => (
                  <span
                    key={m.label}
                    className="font-mono text-xs text-gray-500 dark:text-gray-400"
                  >
                    {m.label} {m.value}
                  </span>
                ))}
              </p>
              {r.note && (
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {r.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      );

    case "timeline":
      return <DayTimeline day={block.day} />;

    case "steps":
      return (
        <ol className="space-y-2">
          {block.items.map((s, i) => (
            <li
              key={s}
              className="flex gap-3 rounded-lg border border-gray-200 p-3 dark:border-neutral-700"
            >
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white"
              >
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {s}
              </span>
            </li>
          ))}
        </ol>
      );

    case "notes":
      return <GuideNotes items={block.items} />;

    case "callout": {
      const { kind: _kind, ...callout } = block;
      return <GuideCallout {...callout} />;
    }
  }
}
