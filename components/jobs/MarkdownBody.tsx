import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * マークダウンの見た目はすべてここで作る。
 * このプロジェクトには @tailwindcss/typography が入っていないため、
 * `prose` 系のクラスは一切効かない。要素ごとに明示的に指定すること。
 */
const components = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-8 mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-neutral-700 pb-1">
      {children}
    </h3>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mt-6 mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
      {children}
    </h4>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h5 className="mt-4 mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
      {children}
    </h5>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mt-3 mb-1 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc ml-6 mt-3 space-y-2 marker:text-gray-600 dark:marker:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal ml-6 mt-3 space-y-2 marker:text-gray-600 dark:marker:text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="pl-1 leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-100">
      {children}
    </strong>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-4 border-l-4 border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800/60 py-2 pl-4 pr-3 text-gray-700 dark:text-gray-300">
      {children}
    </blockquote>
  ),
  // サイト内リンクは同じタブで開く。外部リンクだけ新しいタブにする。
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    const isExternal = !!href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </a>
    );
  },
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[0.85em] font-mono">
      {children}
    </code>
  ),
  hr: () => (
    <hr className="my-6 border-gray-200 dark:border-neutral-700" />
  ),
  // 表は幅が出やすいので、必ず自分の中で横スクロールさせる。
  // ページ本体が横スクロールしないようにするため。
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse border border-gray-300 dark:border-neutral-600 text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-gray-300 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-800 px-2 py-1 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-gray-300 dark:border-neutral-600 px-2 py-1 align-top">
      {children}
    </td>
  ),
};

export default function MarkdownBody({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`text-sm leading-relaxed ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
