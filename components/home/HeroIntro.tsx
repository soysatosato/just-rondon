import Link from "next/link";
import HeroSearch from "@/components/home/HeroSearch";

/**
 * ヒーロー左半分の文言。
 *
 * 写真の上ではなく無地の上に置くので、色はテーマの foreground に戻す。
 * 全画面写真に重ねていた頃は、ライトテーマでも読めるよう白に固定して
 * いたが、その必要が無くなった。
 *
 * 中央揃えをやめて左揃えにした。中央揃えの見出し+説明+検索窓という
 * 並びは、どのサイトのトップにもある形で、この配置そのものが
 * 「よくあるサイト」という印象を作っていた。
 *
 * サイト名はここには出さない。すぐ上のヘッダーにワードマークがあるので、
 * 画面の同じ高さに同じ名前が二度並ぶだけだった。
 *
 * 見出しは何のサイトかだけを言う。一時期の「確かめて書く、日本語の
 * ロンドンガイド」は自分の書き方への評価を見出しにしたもので、確認は
 * 読者にとって前提だから、言うほど演出に見えた。サイト全体がそうなって
 * いるわけでもない。ほかとの違いは、説明文で毎週・毎月の更新という
 * 実物で見せる。
 */
/** ヒーローの近道。旅の準備で最初に開かれるページから並べる。 */
const SHORTCUTS = [
  { href: "/sightseeing/itinerary", label: "モデルコース" },
  { href: "/sightseeing/eta-uk-visa-guide", label: "ETA" },
  { href: "/sightseeing/transport", label: "交通" },
  { href: "/travel", label: "旅の準備" },
  { href: "/events", label: "今週のロンドン" },
  { href: "/prices", label: "物価" },
];

/*
  浮き上がりは CSS のアニメーション(tailwindcss-animate)で付ける。
  以前は JS のアニメーションの初期値として opacity:0 をサーバーの HTML に
  書いていたため、JS の読み込みと実行が終わるまで h1 と説明文が見えなかった
  (Slow 4G 相当で最初の描画から 0.7 秒遅れ)。CSS なら描画と同時に動き出す。
  動きを減らす設定では付けない。
*/
const RISE =
  "animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both duration-700 ease-out motion-reduce:animate-none";

export default function HeroIntro() {
  return (
    <div className="max-w-xl">
      {/* ページ唯一の h1。 */}
      <h1
        className={`text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem] ${RISE}`}
      >
        ロンドンのことなら、
        <br className="hidden sm:block" />
        ここから。
      </h1>

      {/*
        扱う幅を観光の4語と暮らしの4語で並べ、最後に更新の実物を言う。
        週報は毎週出ていて、改定は月次号で追っている。
        JSX で文を改行して書くと行の継ぎ目に空白が入るので、1行で書く。
      */}
      <p
        className={`mt-5 text-base leading-relaxed text-muted-foreground delay-75 ${RISE}`}
      >
        {
          "名所、美術館、ミュージカル、パブ。交通、物価、ビザ、住まい。旅の計画から暮らしの手続きまで、ひとつの場所に。催しと運休は毎週、運賃や料金の改定は毎月更新しています。"
        }
      </p>

      <div className={`mt-8 delay-150 ${RISE}`}>
        <HeroSearch />

        {/*
          よく使うページへの近道。トップに来る人の多くは旅の準備の途中で、
          検索語を考えるより押したほうが早い行き先がある。
        */}
        <nav aria-label="よく使うページ" className="mt-5">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
            {SHORTCUTS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block py-1.5 underline decoration-border underline-offset-4 transition hover:decoration-current"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
