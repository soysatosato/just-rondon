import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import BritishEnglishScenes, {
  SCENE_NAV,
} from "@/components/british-english/BritishEnglishScenes";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

export const metadata = buildPageMetadata({
  path: "/british-english/scenes",
  title: "場面別イギリス英語フレーズ集 | パブ・店・交通の逆引き",
  description:
    "「これを言いたい」から引けるイギリス英語のフレーズ集。パブでの注文、店での支払い、地下鉄やバスでのやりとりを場面別にまとめました。現地で言われる側の表現も収録。",
  keywords: [
    "イギリス英語 フレーズ",
    "ロンドン 英会話",
    "パブ 注文 英語",
    "イギリス 買い物 英語",
    "ロンドン 地下鉄 英語",
    "旅行英会話 イギリス",
  ],
});

export default function BritishEnglishScenesPage() {
  return (
    <main className="max-w-3xl mx-auto py-8 px-4 md:py-10">
      <JsonLd
          data={breadcrumbListJsonLd({
            path: "/british-english",
            current: "場面別フレーズ集",
            currentHref: "/british-english/scenes",
          })}
        />

      <div className="mb-6">
        <Breadcrumbs path="/british-english" current="場面別フレーズ集" />
      </div>

      <header className="relative mb-8 overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-background to-sky-50 px-6 py-9 dark:border-rose-900/50 dark:from-rose-950/25 dark:via-background dark:to-sky-950/20 sm:px-9 sm:py-11">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-rose-400/20 blur-3xl dark:bg-rose-500/10"
        />
        <div className="relative">
          <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Phrasebook
          </span>
          <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            場面別フレーズ集
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            単語から引くのではなく、
            <span className="font-semibold text-foreground">
              「これを言いたい」から引ける
            </span>
            ように並べました。パブ・店・交通の3場面。自分が言う表現だけでなく、
            向こうから言われて固まりがちな表現も添えてあります。
          </p>

          <nav className="mt-6 flex flex-wrap gap-2">
            {SCENE_NAV.map((scene) => (
              <a
                key={scene.id}
                href={`#${scene.id}`}
                className="rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {scene.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <BritishEnglishScenes />

      <section className="mt-10 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
        <h2 className="text-base font-bold sm:text-lg">
          1語ずつ深掘りしたい人へ
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          このページは「とりあえず口に出す」ための逆引きです。なぜイギリス人が
          そんな言い方をするのかは、1語ずつのアーカイブのほうで掘り下げています。
        </p>
        <Link
          href="/british-english"
          className="mt-4 inline-flex items-center rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          イギリス英語の一覧を見る
        </Link>
      </section>

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
