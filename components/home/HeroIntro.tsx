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
        ロンドン観光・旅行・
        <br className="hidden sm:block" />
        現地暮らしのガイド
      </h1>

      {/*
        「日本語のロンドン情報サイト」だけでは他と区別がつかないので、
        扱っている幅(3日の旅行から数年の生活まで)を最初の1文に入れる。
      */}
      <p
        className={`mt-5 text-sm leading-relaxed text-muted-foreground delay-75 sm:text-base ${RISE}`}
      >
        定番の観光スポットと無料で入れる美術館、ウエストエンドのミュージカル。
        毎週更新する現地の最新情報と、ビザ・住まい・仕事の実務まで。
        3日間の旅行から数年の生活まで、日本語でまとめています。
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
