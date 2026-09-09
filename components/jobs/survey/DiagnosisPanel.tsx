// components/jobs/survey/DiagnosisPanel.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  Diagnosis,
  DiagnosisLevel,
  DiagnosisTone,
} from "@/utils/service-charge";

const LEVEL_STYLE: Record<
  DiagnosisLevel,
  { ring: string; chip: string; label: string }
> = {
  alert: {
    ring: "border-destructive/40 bg-destructive/[0.04]",
    chip: "bg-destructive text-destructive-foreground",
    label: "要注意",
  },
  check: {
    ring: "border-amber-500/40 bg-amber-500/[0.06]",
    chip: "bg-amber-500 text-white dark:bg-amber-600",
    label: "確認が必要",
  },
  clear: {
    ring: "border-emerald-600/40 bg-emerald-600/[0.05]",
    chip: "bg-emerald-600 text-white",
    label: "問題なし",
  },
  unknown: {
    ring: "border-border bg-muted/40",
    chip: "bg-muted-foreground text-background",
    label: "情報不足",
  },
};

const TONE_STYLE: Record<DiagnosisTone, { dot: string; text: string }> = {
  alert: { dot: "bg-destructive", text: "text-destructive" },
  warn: { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-500" },
  info: { dot: "bg-muted-foreground/60", text: "text-foreground" },
  ok: { dot: "bg-emerald-600", text: "text-emerald-700 dark:text-emerald-500" },
};

export default function DiagnosisPanel({
  diagnosis,
  hourlyMedian,
}: {
  diagnosis: Diagnosis;
  /** 全体の時給換算の中央値。自分の額を置く物差しとして添える。 */
  hourlyMedian?: number | null;
}) {
  const style = LEVEL_STYLE[diagnosis.level];

  return (
    <div className="space-y-5">
      <div className={cn("rounded-xl border p-5", style.ring)}>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
            style.chip,
          )}
        >
          {style.label}
        </span>
        <p className="mt-3 text-lg font-bold leading-snug tracking-tight">
          {diagnosis.headline}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {diagnosis.lead}
        </p>

        {diagnosis.hourly !== null && (
          <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2 border-t border-border/60 pt-4">
            <div>
              <p className="text-xs text-muted-foreground">
                あなたの時給換算
              </p>
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                £{diagnosis.hourly.toFixed(2)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / 時
                </span>
              </p>
            </div>
            {hourlyMedian != null && (
              <div>
                <p className="text-xs text-muted-foreground">
                  この調査の中央値
                </p>
                <p className="text-2xl font-bold tabular-nums tracking-tight text-muted-foreground">
                  £{hourlyMedian.toFixed(2)}
                  <span className="ml-1 text-sm font-normal">/ 時</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {diagnosis.findings.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-foreground">
            回答から分かること
          </h3>
          <ul className="mt-3 space-y-4">
            {diagnosis.findings.map((f) => {
              const tone = TONE_STYLE[f.tone];
              return (
                <li key={f.title} className="flex gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full",
                      tone.dot,
                    )}
                  />
                  <div className="min-w-0">
                    <p className={cn("text-sm font-semibold", tone.text)}>
                      {f.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold text-foreground">
          次にやること
        </h3>
        <ol className="mt-3 space-y-3">
          {diagnosis.actions.map((a, i) => {
            const body = (
              <>
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {a.title}
                    {a.href && (
                      <span
                        aria-hidden
                        className="ml-1 text-muted-foreground"
                      >
                        {a.external ? "↗" : "→"}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {a.body}
                  </span>
                </span>
              </>
            );

            const className =
              "flex gap-3 rounded-lg border border-border p-4 transition hover:border-foreground/30 hover:bg-muted/40";

            return (
              <li key={a.title}>
                {a.href ? (
                  a.external ? (
                    <a
                      href={a.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {body}
                    </a>
                  ) : (
                    <Link href={a.href} className={className}>
                      {body}
                    </Link>
                  )
                ) : (
                  <div className="flex gap-3 rounded-lg border border-border p-4">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">
        この判定は、いただいた回答を Employment (Allocation of Tips) Act 2023
        の条文と Acas の解説に照らして機械的に当てはめたものです。法的助言ではなく、
        個別の事情によって結論は変わります。実際に手続きを取る前に Acas
        または資格を持つ専門家にご確認ください。
      </p>
    </div>
  );
}
