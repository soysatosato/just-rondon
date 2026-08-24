import { Footprints, Sparkles, Eye, Lightbulb } from "lucide-react";

/**
 * 「館内をどの順に歩くか」を到着順にたどる。
 *
 * MuseumHighlightSpots(これだけは見て帰る)が展示物1件ごとの説明で
 * 「何を見るか」を答えるのに対して、こちらは館内の動線そのもの——
 * どの入口から入るか、どの順に回るか、何時に行列が伸びるか——を答える。
 * 読者が読むタイミングが違う(見どころは行く前、歩き方は着いてから)ので
 * 節を分けている。
 *
 * データは推測で作らない。「入口を入って左」のような具体は外れると
 * 読者を実際に迷わせるため、MuseumVisitStep が入っている館にだけ表示し、
 * 無ければこのセクションごと出ない。
 *
 * ★ body はプレーンテキストで描画する(ReactMarkdown を通していない)。
 *   AttractionVisitFlow と同じ制約。** やリンク記法は記号のまま出る。
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

export type MuseumVisitStep = {
  id: number;
  kind: string;
  title: string;
  body: string;
};

export default function MuseumVisitFlow({
  steps,
  museumName,
}: {
  steps: MuseumVisitStep[];
  museumName: string;
}) {
  if (!steps.length) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-sky-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Route
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          着いてからの歩き方
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {museumName}に着いたら、この順に見ていくと迷いません。
          展示室の番号や配置は改装で変わることがあるので、当日は館内の案内で確認してください。
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
