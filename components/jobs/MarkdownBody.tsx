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

/** 見出しの見た目。マークダウンの段(## / ### / ####)で決める。 */
const HEADING_STYLES = [
  "mt-8 mb-3 text-[1.25em] font-semibold leading-snug text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-1",
  "mt-6 mb-2 text-[1.125em] font-semibold leading-snug text-neutral-800 dark:text-neutral-200",
  "mt-4 mb-1 text-[1em] font-semibold leading-snug text-neutral-700 dark:text-neutral-300",
] as const;

/** 本文の中でいちばん大きい見出しの段(# の数)。見出しが無ければ 2。 */
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

/**
 * 見出しの段(h3〜h6)は、本文の中でいちばん大きい見出しを h3 にして
 * そこから数える。本文は章の見出し(h2)の下に置かれる。
 *
 * 以前は ## を h3、### を h4 に固定していたため、### から書き始めた
 * 本文では h2 の次に h4 が来て段が飛び、読み上げの見出し一覧で
 * 構造が崩れていた(ビザ・住まいの記事など)。見た目は従来どおり
 * マークダウンの段で決め、段の番号だけを詰める。
 */
function headingComponents(topDepth: number) {
  const make = (depth: number) => {
    const level = Math.min(6, 3 + Math.max(0, depth - topDepth));
    const Tag = `h${level}` as "h3" | "h4" | "h5" | "h6";
    const style = HEADING_STYLES[Math.min(Math.max(depth - 2, 0), 2)];
    function MarkdownHeading({ children }: { children?: React.ReactNode }) {
      return <Tag className={style}>{children}</Tag>;
    }
    return MarkdownHeading;
  };
  return {
    h1: make(1),
    h2: make(2),
    h3: make(3),
    h4: make(4),
    h5: make(5),
    h6: make(6),
  };
}

const components = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mt-3 mb-1">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc ml-6 mt-3 space-y-2 marker:text-neutral-600 dark:marker:text-neutral-300">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal ml-6 mt-3 space-y-2 marker:text-neutral-600 dark:marker:text-neutral-300">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="pl-1">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-neutral-900 dark:text-neutral-100">
      {children}
    </strong>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-4 border-l-4 border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/60 py-2 pl-4 pr-3 text-neutral-700 dark:text-neutral-300">
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
        className="text-link underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </a>
    );
  },
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[0.85em] font-mono">
      {children}
    </code>
  ),
  hr: () => (
    <hr className="my-6 border-neutral-200 dark:border-neutral-700" />
  ),
  // 表は幅が出やすいので、必ず自分の中で横スクロールさせる。
  // ページ本体が横スクロールしないようにするため。
  // 枠をキーボードで選べるようにする(tabIndex)。そうしないと、
  // 矢印キーで横に送れず、はみ出した列がキーボードでは読めない。
  table: ({ children }: { children?: React.ReactNode }) => (
    <div
      className="my-4 overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label="表(横にスクロールできます)"
    >
      <table className="w-full min-w-[32rem] border-collapse border border-neutral-300 dark:border-neutral-600 text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-neutral-300 dark:border-neutral-600 px-2 py-1 align-top">
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          ...components,
          ...headingComponents(topHeadingDepth(children)),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
