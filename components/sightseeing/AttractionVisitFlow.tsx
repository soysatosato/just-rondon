import { Footprints, Sparkles, Eye, Lightbulb } from "lucide-react";

/**
 * 「着いてから何を見るか」を到着順にたどる。
 *
 * 実用情報(AttractionFactBar)が行く前の判断を助けるのに対して、こちらは
 * 現地で顔を上げさせるためのもの。順路と、見落としやすいものを書く。
 *
 * データは推測で作らない。既存の sections から機械的に生成できる情報では
 * ないので、AttractionVisitStep が入っているスポットにだけ表示し、無ければ
 * このセクションごと出ない。「入口を入って左」のような具体は、外れると
 * 読者を実際に迷わせるため、裏の取れたものだけを入れる。
 */

const KIND_STYLES: Record<
  string,
  { icon: typeof Footprints; label: string; dot: string; ring: string }
> = {
  arrival: {
    icon: Footprints,
    label: "到着",
    dot: "bg-slate-500",
    ring: "ring-slate-500/20",
  },
  highlight: {
    icon: Sparkles,
    label: "見どころ",
    dot: "bg-amber-500",
    ring: "ring-amber-500/20",
  },
  missable: {
    icon: Eye,
    label: "見落としやすい",
    dot: "bg-rose-500",
    ring: "ring-rose-500/20",
  },
  tip: {
    icon: Lightbulb,
    label: "コツ",
    dot: "bg-emerald-600",
    ring: "ring-emerald-600/20",
  },
};

export type VisitStep = {
  id: number;
  kind: string;
  title: string;
  body: string;
};

export default function AttractionVisitFlow({
  steps,
  attractionName,
}: {
  steps: VisitStep[];
  attractionName: string;
}) {
  if (!steps.length) return null;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          着いてからの歩き方
        </h2>
        <p className="text-sm text-muted-foreground">
          {attractionName}に着いたら、この順に見ていくと迷いません。
        </p>
      </div>

      <ol className="relative space-y-6 border-l border-border pl-6">
        {steps.map((step) => {
          const style = KIND_STYLES[step.kind] ?? KIND_STYLES.highlight;
          const Icon = style.icon;

          return (
            <li key={step.id} className="relative">
              {/* 線の上に乗せる丸。left は pl-6 と border の位置に合わせている */}
              <span
                className={`absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full ring-4 ${style.dot} ${style.ring}`}
                aria-hidden
              />
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span className="text-xs font-medium text-muted-foreground">
                  {style.label}
                </span>
              </div>
              <h3 className="mt-1 text-base font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
