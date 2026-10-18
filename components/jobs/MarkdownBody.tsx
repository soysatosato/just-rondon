import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * マークダウンの見た目はここで作る(prose は使わない。見出しの段の付け替えや
 * 表の横スクロールを、記事の種類を問わず同じにするため)。
 *
 * 見出しの大きさは em で持ち、本文の大きさ(size)に比例させる。
 * 行送りは段落・箇条書きに書かず、外側の div から受け継がせる。
 */
const components = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-8 mb-3 text-[1.25em] font-semibold leading-snug text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-neutral-700 pb-1">
      {children}
    </h3>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mt-6 mb-2 text-[1.125em] font-semibold leading-snug text-gray-800 dark:text-gray-200">
      {children}
    </h4>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h5 className="mt-4 mb-1 text-[1em] font-semibold leading-snug text-gray-700 dark:text-gray-300">
      {children}
    </h5>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mt-3 mb-1">{children}</p>
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
    <li className="pl-1">{children}</li>
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

/**
 * 本文の大きさ。
 *
 *   body:    記事の地の文・節の本文・FAQ の回答。16px・行送り1.8。
 *            以前は全部 14px で、詳細ページの文字の7〜9割がこの大きさだった
 *            (検索流入の7割はスマホ)。デジタル庁デザインシステムの
 *            「本文は16px以上、14pxは基本使わない」に合わせた。
 *   compact: 枠の中の短い文(要点表の値・注意書き・料金欄・カード)。14px。
 *            枠は内側に余白を取るので、本文と同じ大きさだと行が細切れになる。
 *
 * className は後から当たる(cn で上書きできる)。
 */
const SIZE = {
  body: "text-base leading-[1.8]",
  compact: "text-sm leading-relaxed",
} as const;

export default function MarkdownBody({
  children,
  className,
  size = "body",
}: {
  children: string;
  className?: string;
  size?: keyof typeof SIZE;
}) {
  return (
    <div className={cn(SIZE[size], className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
