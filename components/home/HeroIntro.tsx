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
 * 見出しは扱う区分の列挙をやめ、このサイトの書き方を言い切る。以前の
 * 「ロンドン観光・旅行・現地暮らしのガイド」は、真上のヘッダーの一文
 * 「ロンドン観光・旅行・現地ガイド」とほぼ同じ文で、何のサイトかは
 * 分かっても、ほかの日本語のロンドン情報との違いが伝わらなかった。
 * 扱う区分の語(観光・美術館・ミュージカル・ビザ・住まい)は説明文に残す。
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
        確かめて書く、
        <br className="hidden sm:block" />
        日本語のロンドンガイド
      </h1>

      {/*
        扱う幅(観光から在住の実務まで)と、確かめ方を1文ずつ。確かめ方は
        誇張しない: 調べた日を出しているのは運休・催し・営業日・改定の類で、
        すべての料金に確認日が付いているわけではない。
      */}
      <p
        className={`mt-5 text-base leading-relaxed text-muted-foreground delay-75 ${RISE}`}
      >
        観光・美術館・ミュージカルから、ビザと住まいまで。
        運休や料金の改定は公式の発表で確かめ、いつ調べたかを載せています。
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
