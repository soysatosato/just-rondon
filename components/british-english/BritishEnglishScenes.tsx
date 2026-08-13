import { Beer, ShoppingBasket, TrainFront } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Phrase = {
  /** 日本語でやりたいこと。逆引きの入口になる */
  intent: string;
  /** 実際に口に出す英語 */
  say: string;
  /** 補足・言い換え・やらかしポイント */
  note: string;
};

type Scene = {
  id: string;
  icon: LucideIcon;
  label: string;
  title: string;
  lead: string;
  phrases: Phrase[];
  /** 現地で耳にする側の表現。聞き取れないと詰まるもの */
  heard: { uk: string; meaning: string }[];
  wrapClass: string;
  iconWrapClass: string;
  chipClass: string;
  sayClass: string;
};

const SCENES: Scene[] = [
  {
    id: "pub",
    icon: Beer,
    label: "パブ",
    title: "パブ",
    lead: "テーブルで待っていても一生誰も来ない。パブは自分でカウンターまで行って注文して、その場で払って、自分で運ぶ。この一点さえ知っていれば9割戦える。",
    phrases: [
      {
        intent: "とりあえずビールを1杯",
        say: "A pint of Guinness, please.",
        note: "銘柄を言うのが普通。「ビールください」だと必ず何を?と聞き返される。量は pint(約568ml)か half。軽くいきたいなら a half of〜。",
      },
      {
        intent: "同じものをもう1杯",
        say: "Same again, please.",
        note: "これが一番自然。空いたグラスをカウンターに置きながら言えば完璧に通じる。",
      },
      {
        intent: "おすすめを聞きたい",
        say: "What would you recommend?",
        note: "エールが並んでいて選べない時に。試飲させてくれる店もある。頼めば a taster をくれることも。",
      },
      {
        intent: "自分の番だと伝えたい",
        say: "I think I'm next, sorry.",
        note: "パブのカウンターに列はないが、店員は誰が先に来たか見ている。抜かされたら sorry を付けて穏やかに主張してよい。",
      },
      {
        intent: "自分がまとめて払う",
        say: "It's my round.",
        note: "round は「一巡ぶんおごる」文化。人数分まとめて頼み、次は相手が払う。自分の番だけ抜けると、かなり印象が悪い。",
      },
      {
        intent: "会計をまとめたい・タブにしたい",
        say: "Can I start a tab?",
        note: "カードを預けて最後に精算する方式。何度も注文するなら楽。帰る前の精算を忘れずに。",
      },
    ],
    heard: [
      { uk: "Are you being served?", meaning: "もう注文は受けてますか?" },
      { uk: "Any ice with that?", meaning: "氷は入れますか?" },
      { uk: "Bar's closing / Last orders!", meaning: "ラストオーダー。あと数分で注文終了" },
      { uk: "Time, please!", meaning: "閉店です。飲み干して出る合図" },
    ],
    wrapClass:
      "border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20",
    iconWrapClass:
      "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    chipClass:
      "border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-300",
    sayClass: "text-amber-700 dark:text-amber-300",
  },
  {
    id: "shop",
    icon: ShoppingBasket,
    label: "店",
    title: "店・スーパー・カフェ",
    lead: "レジで必ず何か聞かれる。だいたいは「袋いる?」「レシートいる?」の二択なので、答えを2つ用意しておけば止まらずに済む。",
    phrases: [
      {
        intent: "見ているだけ(声をかけられた時)",
        say: "I'm just browsing, thanks.",
        note: "服屋で Can I help you? と来たらこれ。just looking でもよいが browsing のほうが現地っぽい。",
      },
      {
        intent: "試着したい",
        say: "Could I try this on?",
        note: "試着室は fitting room。changing room とも言う。",
      },
      {
        intent: "袋が欲しい",
        say: "Could I get a bag, please?",
        note: "レジ袋は有料で、聞かれないまま出てくることもない。カフェで持ち帰りなら Can I get it to go? より Takeaway, please. が一般的。",
      },
      {
        intent: "カードで払いたい",
        say: "Card, please.",
        note: "現金しか使えない店はかなり減った。逆に「現金お断り」の店もある。タッチ決済は contactless。",
      },
      {
        intent: "これいくら?",
        say: "How much is this?",
        note: "値札が見当たらない時に。値引き交渉はマーケット以外では基本しない。",
      },
      {
        intent: "返品したい",
        say: "I'd like to return this, please.",
        note: "レシートがあれば強い。返品理由は聞かれるが、changed my mind(気が変わった)でも通ることが多い。",
      },
    ],
    heard: [
      { uk: "Are you alright there?", meaning: "何かお探しですか?(店員の決まり文句)" },
      { uk: "Do you need a bag?", meaning: "袋はいりますか?" },
      { uk: "Cash or card?", meaning: "現金かカードか" },
      { uk: "Would you like the receipt?", meaning: "レシートはご入用ですか?" },
      { uk: "Next in the queue, please!", meaning: "次に並んでる方どうぞ" },
    ],
    wrapClass:
      "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20",
    iconWrapClass:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    chipClass:
      "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
    sayClass: "text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "transport",
    icon: TrainFront,
    label: "交通",
    title: "地下鉄・バス・鉄道",
    lead: "切符を買う場面がほぼ消えたので、必要な英語は「どっち方向か」「ここ止まるか」に寄っている。タッチ決済で乗り、同じカードで出るのが基本。",
    phrases: [
      {
        intent: "この電車は◯◯に止まる?",
        say: "Does this train stop at Oxford Circus?",
        note: "同じ路線でも急行・各停で止まらない駅がある。ホームで隣の人に聞いて問題ない。",
      },
      {
        intent: "どのホーム?",
        say: "Which platform for Brighton?",
        note: "鉄道の発車ホームは直前まで決まらないことがある。電光掲示板は the board。",
      },
      {
        intent: "バスが目的地に行くか確かめる",
        say: "Does this bus go to Camden?",
        note: "運転手に乗る前に聞くのが早い。バスは現金不可でタッチ決済のみ。",
      },
      {
        intent: "降ります・通してほしい",
        say: "Excuse me, this is my stop.",
        note: "混んだ車内はこれで道が開く。降車ボタンは押してから立つ。",
      },
      {
        intent: "タッチし忘れた・改札が開かない",
        say: "My card didn't tap in properly.",
        note: "入場と退場は必ず同じカードで。片方忘れると未完了扱いで最大運賃を取られる。駅員は station staff。",
      },
      {
        intent: "終電の時間を知りたい",
        say: "What time's the last train?",
        note: "金土は Night Tube が動く路線もある。終電後は night bus(N付きの番号)。",
      },
    ],
    heard: [
      { uk: "Mind the gap.", meaning: "ホームと車両の隙間に注意" },
      { uk: "This is a good service on all lines.", meaning: "全線平常運転(遅延なし)" },
      { uk: "Severe delays / Part suspended", meaning: "大幅遅延・一部区間運休" },
      { uk: "Rail replacement bus", meaning: "工事などによる代行バス" },
      { uk: "Alight here for…", meaning: "…へはここで降りてください" },
    ],
    wrapClass:
      "border-sky-200 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/20",
    iconWrapClass:
      "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
    chipClass: "border-sky-600/30 bg-sky-600/10 text-sky-700 dark:text-sky-300",
    sayClass: "text-sky-700 dark:text-sky-300",
  },
];

export default function BritishEnglishScenes() {
  return (
    <div className="space-y-10">
      {SCENES.map((scene) => {
        const Icon = scene.icon;
        return (
          <section
            key={scene.id}
            id={scene.id}
            className={`scroll-mt-24 rounded-2xl border p-5 sm:p-6 ${scene.wrapClass}`}
          >
            <div className="mb-4 flex items-center gap-3">
              <span
                className={`inline-flex shrink-0 rounded-xl p-2 ${scene.iconWrapClass}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {scene.label}
                </p>
                <h2 className="text-lg font-bold leading-snug sm:text-xl">
                  {scene.title}
                </h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {scene.lead}
            </p>

            <ul className="mt-5 space-y-3">
              {scene.phrases.map((phrase) => (
                <li
                  key={phrase.say}
                  className="rounded-xl border border-border/60 bg-background/70 p-4"
                >
                  <p className="text-xs font-semibold text-muted-foreground">
                    {phrase.intent}
                  </p>
                  <p
                    className={`mt-1.5 text-base font-bold leading-snug sm:text-lg ${scene.sayClass}`}
                  >
                    {phrase.say}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {phrase.note}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <h3 className="text-sm font-bold">
                こう言われたら
              </h3>
              <ul className="mt-3 space-y-1.5">
                {scene.heard.map((item) => (
                  <li
                    key={item.uk}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs leading-relaxed"
                  >
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 font-semibold ${scene.chipClass}`}
                    >
                      {item.uk}
                    </span>
                    <span className="text-muted-foreground">{item.meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export const SCENE_NAV = SCENES.map((s) => ({
  id: s.id,
  label: s.label,
  title: s.title,
}));
