import { buildPageMetadata } from "@/lib/seo";
import { Separator } from "@/components/ui/separator";
import { serviceChargeGuide } from "./data";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";

export const metadata = buildPageMetadata({
  path: "/jobs/service-charges",
  title: "英国サービスチャージ完全ガイド｜Tipping Act 2023・従業員の権利・事業者の義務まとめ | ジャスト・ロンドン",
  titleSuffix: false,
  description: "2024年10月施行のTipping Act 2023により、サービスチャージは全額スタッフに帰属します。強制・任意の違い、分配ルールの確認方法、未払い時の申立て期限、2026年末の法改正までを解説。",
  keywords: [
    "サービスチャージ 英国",
    "Tipping Act 2023",
    "チップ 法律 イギリス",
    "英国 レストラン サービス料",
    "Tronc 制度",
    "イギリス チップ ルール",
    "最低賃金 チップ",
    "Employment Tribunal チップ",
  ],
});

const markdownComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-10 mb-3 scroll-mt-24 text-lg font-bold tracking-tight text-foreground first:mt-0 md:text-xl">
      {children}
    </h3>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mt-7 mb-2 text-base font-semibold text-foreground">
      {children}
    </h4>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h5 className="mt-5 mb-1 text-sm font-semibold text-foreground/90">
      {children}
    </h5>
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul
      className="my-3 ml-5 list-disc space-y-1.5 marker:text-muted-foreground"
      {...props}
    />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol
      className="my-3 ml-5 list-decimal space-y-1.5 marker:text-muted-foreground"
      {...props}
    />
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="pl-1 leading-relaxed">{children}</li>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-3 leading-[1.9]">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-2 transition hover:decoration-foreground"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-5 rounded-r-lg border-l-[3px] border-border bg-muted/50 py-1 pl-4 pr-4 text-[0.9375rem] [&>p]:my-2">
      {children}
    </blockquote>
  ),
  hr: () => <Separator className="my-8" />,
  table: (props: React.ComponentProps<"table">) => (
    <div className="my-5 w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">{props.children}</table>
    </div>
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th className="border-b-2 border-border px-3 py-2 text-left font-semibold">
      {props.children}
    </th>
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td className="border-b border-border/60 px-3 py-2 align-top">
      {props.children}
    </td>
  ),
};

function SurveyCallout() {
  return (
    <aside className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        実態調査にご協力ください
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">
        あなたの職場では、サービスチャージはどう分配されていますか？
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        ロンドンの日本食レストランで働く人から、分配方法と実際に受け取っている金額を集めています。
        所要3分・匿名で、店舗名以外に個人が特定される情報は聞きません。
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/jobs/service-charges/survey"
          className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
        >
          アンケートに回答する（3分）
        </Link>
        <Link
          href="/jobs/service-charges/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          集まった回答を見る
        </Link>
      </div>
    </aside>
  );
}

export default function ServiceChargeGuidePage() {
  const content = serviceChargeGuide;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      {/* Title */}
      <header className="mx-auto max-w-[46rem] space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          英国で働く人のためのガイド
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-[2.75rem] md:leading-[1.15]">
          {content.title}
        </h1>

        {content.summary && (
          <p className="text-base leading-[1.9] text-muted-foreground md:text-lg">
            {content.summary}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          最終更新：{content.lastReviewed}
        </p>
      </header>

      <div className="mt-10 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
        {/* 目次（デスクトップでは追従、モバイルでは本文の前に置く） */}
        <nav aria-label="目次" className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            目次
          </p>
          <ol className="mt-3 space-y-1 border-l border-border">
            {content.sections.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#section-${section.id}`}
                  className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm leading-snug text-muted-foreground transition hover:border-foreground hover:text-foreground"
                >
                  <span className="tabular-nums text-muted-foreground/70">
                    {i + 1}.
                  </span>{" "}
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* 本文 */}
        <div className="mt-10 min-w-0 lg:mt-0">
          <div className="max-w-[46rem]">
            <SurveyCallout />
          </div>

          <div className="mt-12 space-y-14">
            {content.sections.map((section, i) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="max-w-[46rem] scroll-mt-24"
              >
                <div className="mb-5">
                  <p className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold leading-snug tracking-tight md:text-[1.75rem]">
                    {section.title}
                  </h2>
                </div>

                {section.description && (
                  <div className="text-[0.9375rem] text-foreground/90 md:text-base">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={markdownComponents}
                    >
                      {section.description}
                    </ReactMarkdown>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* 読了後の導線 */}
          <div className="mt-16 max-w-[46rem] space-y-6">
            <Separator />

            <SurveyCallout />

            <div>
              <p className="text-sm font-semibold text-foreground">
                あわせて読む
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/jobs/service-charges/dashboard"
                  className="group block rounded-xl border border-border p-5 transition hover:border-foreground/40 hover:bg-muted/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    実態調査データ
                  </p>
                  <p className="mt-1.5 font-semibold text-foreground">
                    店舗別のサービスチャージ実態
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    ロンドン市内の日本食レストランで働く人からの声を集約。店舗名（英名）で検索できます。
                  </p>
                </Link>

                <Link
                  href="/jobs/service-charges/case-story"
                  className="group block rounded-xl border border-border p-5 transition hover:border-foreground/40 hover:bg-muted/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    実例・裁判記録
                  </p>
                  <p className="mt-1.5 font-semibold text-foreground">
                    未払いで審判所に申立てた記録
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Acasでの相談からEmployment
                    Tribunalの判決、強制執行まで。実際に認容された計算方法も公開。
                  </p>
                </Link>
              </div>
            </div>

            {content.website && (
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <p className="text-sm font-semibold text-foreground">
                  参考リンク
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  <li>
                    <a
                      href={content.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground underline decoration-muted-foreground/40 underline-offset-2 transition hover:text-foreground"
                    >
                      Acas｜Tips and service charges（英語）
                    </a>
                  </li>
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  本記事は一般的な情報提供を目的としたもので、法的助言ではありません。
                  個別の事案については Acas
                  または資格を持つ専門家にご相談ください。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
