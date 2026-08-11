import { MessageSquareDashed, SpellCheck2, Volume2, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Trait = {
  icon: LucideIcon;
  label: string;
  title: string;
  body: string;
  examples: { uk: string; us: string }[];
  wrapClass: string;
  iconWrapClass: string;
  chipClass: string;
};

const TRAITS: Trait[] = [
  {
    icon: MessageSquareDashed,
    label: "遠回し",
    title: "はっきり言わない",
    body: "本音をそのまま口に出さない。褒め言葉に聞こえるフレーズが、実は柔らかいダメ出しということが日常的に起きる。額面どおり受け取ると話が噛み合わなくなる。",
    examples: [
      { uk: "quite good", us: "悪くはない（絶賛ではない）" },
      { uk: "not bad", us: "かなり良い" },
      { uk: "with all due respect", us: "これから反論します" },
    ],
    wrapClass:
      "border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/20",
    iconWrapClass: "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
    chipClass:
      "border-rose-600/30 bg-rose-600/10 text-rose-700 dark:text-rose-300",
  },
  {
    icon: Utensils,
    label: "単語",
    title: "同じ物を別の名前で呼ぶ",
    body: "アメリカ英語と単語自体が違うものが山ほどある。通じないだけならまだしも、両方の英語で意味が食い違う単語は誤解のもとになる。",
    examples: [
      { uk: "lift", us: "elevator（エレベーター）" },
      { uk: "chips", us: "fries（フライドポテト）" },
      { uk: "first floor", us: "2階（1階は ground floor）" },
    ],
    wrapClass:
      "border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20",
    iconWrapClass:
      "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    chipClass:
      "border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-300",
  },
  {
    icon: SpellCheck2,
    label: "綴り",
    title: "綴りが少しだけ違う",
    body: "意味は同じでも書き方が違う語群がある。規則性があるので、パターンを1回覚えてしまえば応用が利く。イギリスの案内表示や公的書類はこちらで書かれている。",
    examples: [
      { uk: "colour / favourite", us: "color / favorite" },
      { uk: "centre / theatre", us: "center / theater" },
      { uk: "realise / organise", us: "realize / organize" },
    ],
    wrapClass:
      "border-sky-200 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/20",
    iconWrapClass: "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
    chipClass: "border-sky-600/30 bg-sky-600/10 text-sky-700 dark:text-sky-300",
  },
  {
    icon: Volume2,
    label: "発音",
    title: "音が違う・音が消える",
    body: "語尾の r をほとんど響かせない話し方が標準的。さらに地域差が大きく、ロンドンの下町とスコットランドではまるで別の言語に聞こえることもある。",
    examples: [
      { uk: "water → ウォーター（tが消えがち）", us: "ワラー" },
      { uk: "car / park の r を伸ばさない", us: "r をはっきり響かせる" },
      { uk: "schedule → シェジュール", us: "スケジュール" },
    ],
    wrapClass:
      "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20",
    iconWrapClass:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    chipClass:
      "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
  },
];

export default function BritishEnglishTraits() {
  return (
    <section>
      <div className="mb-5">
        <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Basics
        </span>
        <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
          そもそもイギリス英語って、何が違うの？
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          ざっくり言うと、違いはこの4つに集約されます。ここだけ押さえておけば、
          あとの記事はぜんぶ笑いながら読めます。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TRAITS.map((trait) => {
          const Icon = trait.icon;
          return (
            <div
              key={trait.title}
              className={`rounded-2xl border p-5 ${trait.wrapClass}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`inline-flex shrink-0 rounded-xl p-2 ${trait.iconWrapClass}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {trait.label}
                  </p>
                  <h3 className="text-base font-bold leading-snug sm:text-lg">
                    {trait.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {trait.body}
              </p>

              <ul className="mt-4 space-y-1.5">
                {trait.examples.map((ex) => (
                  <li
                    key={ex.uk}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs leading-relaxed"
                  >
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 font-semibold ${trait.chipClass}`}
                    >
                      {ex.uk}
                    </span>
                    <span className="text-muted-foreground">{ex.us}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
