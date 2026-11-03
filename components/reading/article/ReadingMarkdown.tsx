import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ARTICLE_ACCENT, type ArticleAccentName } from "./accent";

/**
 * 読み物(コラム・イギリス英語・英国のいま)の本文。
 *
 * 以前は Tailwind Typography の prose をそのまま当てていた。そのせいで:
 *
 *   - 引用が12pxの灰色だった。globals.css の `.prose blockquote` が
 *     別の用途のために小さくしていて、コラムの山場(当時の記録の一節や
 *     関係者の発言)がいちばん読みにくい文字で出ていた。
 *   - 和文の行送りが英文向けの1.75のままで、1行が50字を超える幅だった。
 *   - イギリス英語の例文(`I'm chuffed.`)が等幅のプログラムの書体で出ていた。
 *
 * 長く読ませる本文なので、字は16px(PCは17px)・行送り1.9にし、幅は
 * 記事の側で40字前後に絞る。見出しの段は MarkdownBody と同じく、本文の
 * いちばん大きい見出しを h3 にして数える(節の見出しが h2)。
 */

function topHeadingDepth(markdown: string): number {
  let min = 7;
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{1,6})\s/.exec(line);
    if (m) min = Math.min(min, m[1].length);
  }
  return min === 7 ? 2 : min;
}

type Props = {
  children: string;
  accent: ArticleAccentName;
  /** body は本文、compact は枠の中の短い文(要点欄など)。 */
  size?: "body" | "compact";
  className?: string;
};

export default function ReadingMarkdown({
  children,
  accent: accentName,
  size = "body",
  className,
}: Props) {
  const accent = ARTICLE_ACCENT[accentName];
  const top = topHeadingDepth(children);

  const heading = (depth: number) => {
    const level = Math.min(6, 3 + Math.max(0, depth - top));
    const Tag = `h${level}` as "h3" | "h4" | "h5" | "h6";
    const style =
      depth - top <= 0
        ? "mt-10 mb-3 text-[1.12em] font-bold leading-snug text-neutral-900 dark:text-neutral-50"
        : "mt-8 mb-2 text-[1em] font-bold leading-snug text-neutral-900 dark:text-neutral-100";
    function ReadingHeading({ children }: { children?: React.ReactNode }) {
      return <Tag className={style}>{children}</Tag>;
    }
    return ReadingHeading;
  };

  return (
    <div
      className={cn(
        size === "body"
          ? "text-base leading-[1.9] sm:text-[17px]"
          : "text-[15px] leading-[1.8]",
        "text-neutral-800 [overflow-wrap:anywhere] dark:text-neutral-200",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: heading(1),
          h2: heading(2),
          h3: heading(3),
          h4: heading(4),
          h5: heading(5),
          h6: heading(6),
          p: ({ children }) => (
            <p className="my-[1em] first:mt-0 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-neutral-950 dark:text-white">
              {children}
            </strong>
          ),
          // 本文の *…* は書名・誌名(*City of Ravens*)の欧文にしか使っていない。
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul
              className={cn(
                "my-[1em] list-disc space-y-[0.45em] pl-[1.35em]",
                accent.marker,
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={cn(
                "my-[1em] list-decimal space-y-[0.45em] pl-[1.6em]",
                accent.marker,
              )}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-[0.2em]">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                "my-7 border-l-[3px] py-0.5 pl-4 text-neutral-700 dark:text-neutral-300 sm:pl-5",
                accent.rule,
              )}
            >
              {children}
            </blockquote>
          ),
          // 本文の `…` は英語の語句・例文に使っている。等幅にせず、
          // 地の文と同じ書体のまま薄い地で区切る。
          code: ({ children }) => (
            <code
              className={cn(
                "rounded px-[0.3em] py-[0.1em] font-sans text-[0.95em] font-medium",
                accent.phrase,
              )}
            >
              {children}
            </code>
          ),
          a: ({ href, children }) => {
            const isExternal = !!href && /^https?:\/\//.test(href);
            return (
              <a
                href={href}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-link underline decoration-1 underline-offset-[3px] hover:decoration-2"
              >
                {children}
              </a>
            );
          },
          hr: () => (
            <hr className="mx-auto my-10 w-16 border-neutral-300 dark:border-neutral-700" />
          ),
          table: ({ children }) => (
            <div
              className="my-6 overflow-x-auto"
              tabIndex={0}
              role="region"
              aria-label="表(横にスクロールできます)"
            >
              <table className="w-full min-w-[30rem] border-collapse text-[0.9em] leading-relaxed">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b-2 border-neutral-300 px-3 py-2 text-left font-bold dark:border-neutral-600">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-neutral-200 px-3 py-2 align-top dark:border-neutral-700">
              {children}
            </td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/**
 * 1行ぶんのマークダウン(要点欄の項目・見出しの補足)。段落の <p> を作らない。
 */
export function ReadingInline({
  children,
  accent: accentName,
}: {
  children: string;
  accent: ArticleAccentName;
}) {
  const accent = ARTICLE_ACCENT[accentName];
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      allowedElements={["p", "strong", "em", "code", "a"]}
      unwrapDisallowed
      components={{
        p: ({ children }) => <>{children}</>,
        strong: ({ children }) => (
          <strong className="font-bold text-neutral-950 dark:text-white">
            {children}
          </strong>
        ),
        em: ({ children }) => <em className="not-italic">{children}</em>,
        code: ({ children }) => (
          <code
            className={cn(
              "rounded px-[0.3em] py-[0.1em] font-sans text-[0.95em] font-medium",
              accent.phrase,
            )}
          >
            {children}
          </code>
        ),
        a: ({ href, children }) => {
          const isExternal = !!href && /^https?:\/\//.test(href);
          return (
            <a
              href={href}
              {...(isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="text-link underline underline-offset-[3px]"
            >
              {children}
            </a>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
