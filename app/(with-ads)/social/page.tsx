import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import {
  SOCIAL_BASE,
  SOCIAL_CATEGORY_LABELS,
  SOCIAL_CATEGORY_ORDER,
  SOCIAL_SECTION_NAME,
  publishedSocialGuides,
  publishedSocialGuidesByCategory,
  socialGuidePath,
  socialGuides,
  socialHubCollectionJsonLd,
} from "@/components/social/guides/guides";
import { socialGuideArticles } from "@/components/social/guides/content";
import { SOCIAL_AS_OF, SOCIAL_UPDATED_AT } from "@/lib/social/facts";

const TITLE = "ロンドンで友だちを作る・恋愛する｜出会いと人間関係ガイド";
const DESCRIPTION =
  "ロンドンに来たのに人間関係が広がらない——その理由は英語力ではなく、友人が生まれる仕組みにあります。イギリス人の友だちの作り方、マッチングアプリの使い分け、日本人コミュニティとの距離の取り方まで、行動に変えられる形でまとめました。";

export const metadata = buildPageMetadata({
  path: SOCIAL_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ロンドン 友達 作り方",
    "イギリス 友達できない",
    "ロンドン 出会い",
    "イギリス 恋愛",
    "ロンドン 日本人コミュニティ",
    "イギリス マッチングアプリ",
    "海外 孤独",
  ],
});

const publishedSlugs = Object.keys(socialGuideArticles);
const published = publishedSocialGuides(publishedSlugs);

/**
 * 入口を「渡英してどのくらいか」で切る。
 *
 * trouble が「何が起きたか」で切ったのに対し、こちらは経過時間で切る。
 * 悩みの中身が滞在期間でほぼ決まるため。
 * 渡英直後の人に「現地人の友だちを作ろう」と言っても消耗するだけで、
 * 逆に3年目の人に「まず日本人コミュニティへ」は答えにならない。
 *
 * 各段階に「まず何をするか」を1行で持たせているのは、
 * 記事を開かずにハブだけ見て離脱した人にも指針が残るようにするため。
 */
const STAGES: {
  stage: string;
  situation: string;
  answer: string;
  detail: string;
  href: string;
  cta: string;
}[] = [
  {
    stage: "〜3ヶ月",
    situation: "誰とも話さない日がある",
    answer: "まず日本語で息を継げる場所を確保する",
    detail:
      "この時期に無理して英語の場だけに通うと、半年で息切れします。日本語の場と現地の場を並行して持つほうが、結果的に長く続きます。",
    href: "/social/where-japanese-gather",
    cta: "日本人が集まる場所を見る",
  },
  {
    stage: "半年〜1年",
    situation: "職場の外に知り合いがいない",
    answer: "毎週同じ時間に同じ顔が揃う場所を1つ持つ",
    detail:
      "イギリスで大人が友人を作る経路は、ほぼ趣味とスポーツに限られます。一度の盛り上がりではなく、薄い接触の反復が関係を作ります。",
    href: "/social/how-brits-make-friends",
    cta: "友だちができる仕組みを見る",
  },
  {
    stage: "1年〜",
    situation: "知り合いは増えたが、深く付き合える人がいない",
    answer: "誘う側に回る",
    detail:
      "「そのうちお茶でも」は、こちらから日時を出さないと実現しません。悪意ではなく、そういう運用になっています。",
    href: "/social/keeping-friendships",
    cta: "関係が続かない理由を見る",
  },
  {
    stage: "時期を問わず",
    situation: "恋人が欲しい",
    answer: "アプリごとに集まる層が違う",
    detail:
      "真剣な交際を探すなら Hinge、というのが現在の相場です。そして「付き合う」の定義が日本と違うので、そこを先に押さえておく必要があります。",
    href: "/social/dating-apps",
    cta: "アプリの使い分けを見る",
  },
];

const FAQ_ITEMS = [
  {
    question: "英語が話せないと、友だちはできませんか？",
    answer:
      "**英語力の問題であることは、思うより少ないです**。イギリスで大人が友人を作る経路は構造的に限られていて、現地人同士でも社会人になってから親友ができる例は多くありません。英語が伸びるのを待つより、**会話量の少ない活動**（走る、登る、体を動かす系）から場に入って、並行して伸ばすほうが早いです。関係が育つには半年から1年かかるので、その間に語学も追いつきます。",
  },
  {
    question: "「今度お茶でも」と言われたのに、連絡が来ません。",
    answer:
      "**社交辞令ですが、拒否ではありません**。イギリスの会話には中身のない親切が多く含まれていて、これは会話を円滑にするための潤滑油として運用されています。見分け方は簡単で、**日時が入っているかどうか**だけです。入っていなければ、こちらから「来週の水曜は空いてる？」と日時を出してください。社交辞令だった発言が、そのまま本物の予定に変わることがよくあります。",
  },
  {
    question: "日本人コミュニティには入らないほうがいいですか？",
    answer:
      "**避ける必要はありません**。「現地人の友だちを作らなければ」と思い詰めて日本語の場を断つ人がいますが、孤独な状態で英語の場に通い続けるのは消耗が激しく、たいてい半年で息切れします。日本語で息を継げる場所を持ちながら現地の場にも通うほうが**長続きします**。ただし狭いネットワーク特有の窮屈さもあるので、関わり方の濃淡は自分で決められるようにしておくのがいいでしょう。",
  },
  {
    question: "お酒が飲めません。パブ中心の社交だと不利ですか？",
    answer:
      "**不利になりません**。ノンアルコールの選択肢はどのパブにもあり、飲まない人も普通にいます。**round（順番に全員分をおごる仕組み）にもソフトドリンクで参加できます**。事前に説明する必要もなく、自分の番で好きなものを頼めばいいだけです。パブは酒を飲む場所というより、単に人が集まる場所として機能しています。",
  },
  {
    question: "マッチングアプリは、どれを使えばいいですか？",
    answer:
      "**目的によって変わります**。ロンドンで真剣な交際を探すなら Hinge が現在の主流で、Bumble は女性から先にメッセージを送る仕組み、Tinder は利用者数が最大なぶん目的の幅も広い、というのが大まかな棲み分けです。**まずは無料で始めて構いません**。どのアプリも無料枠でマッチはできるので、課金の判断はそのあとで十分です。",
  },
  {
    question: "初めて会う相手と、どこで会うのが安全ですか？",
    answer:
      "**昼間の、人がいる公共の場所**です。カフェ、公園、混んでいるパブなど。初回は相手の家にも自分の家にも行かず、送迎も断るのが原則です。友人に相手の情報と行き先を伝えて、位置情報を共有しておいてください。バーやパブで身の危険を感じたら、店員に**「Ask for Angela」**と伝えると、事情を説明しなくても安全に店を出る手助けをしてもらえます。",
  },
];

export default function SocialHubPage() {
  const pageUrl = `${SITE_URL}${SOCIAL_BASE}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={breadcrumbJsonLd({
          name: SOCIAL_SECTION_NAME,
          path: SOCIAL_BASE,
        })}
      />
      <JsonLd
        data={socialHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
          publishedSlugs,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <BreadCrumbs name={SOCIAL_SECTION_NAME} />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          ロンドンで人と出会う
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Making Friends, Dating and Finding Your People in London
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          みんな親切なのに、そこから先に進まない。
          これを自分の英語力や性格のせいだと考えている人が多いのですが、
          <strong>多くの場合そうではありません</strong>。
          イギリスで大人が友人を作る経路は、構造的に限られています。
          仕組みがわかると、やることが変わります。
        </p>
        <GuideFreshness
          dataAsOf={SOCIAL_AS_OF}
          updatedAt={SOCIAL_UPDATED_AT}
        />
      </header>

      <Separator className="my-8" />

      <section aria-labelledby="find-your-stage" className="space-y-5">
        <div className="space-y-2">
          <h2 id="find-your-stage" className="text-xl font-bold md:text-2xl">
            渡英して、どのくらいですか
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            悩みの中身は、滞在期間でほぼ決まります。
            自分の段階に合わないことをやると、消耗するだけで前に進みません。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {STAGES.map((s) => {
            const isPublished = publishedSlugs.includes(
              s.href.replace(`${SOCIAL_BASE}/`, "")
            );

            const body = (
              <Card
                className={`h-full border-gray-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900 ${
                  isPublished
                    ? "transition hover:border-sky-400 dark:hover:border-sky-500"
                    : ""
                }`}
              >
                <CardContent className="flex h-full flex-col p-5">
                  <span className="inline-flex w-fit rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-neutral-800 dark:text-gray-400">
                    {s.stage}
                  </span>
                  <p className="mt-2.5 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                    {s.situation}
                  </p>
                  <p className="mt-3 text-xs font-bold tracking-wide text-sky-600 dark:text-sky-400">
                    → {s.answer}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {s.detail}
                  </p>
                  <span
                    className={`mt-4 text-sm font-medium ${
                      isPublished
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {isPublished ? `${s.cta} →` : "準備中"}
                  </span>
                </CardContent>
              </Card>
            );

            return isPublished ? (
              <Link key={s.href} href={s.href} className="block">
                {body}
              </Link>
            ) : (
              <div key={s.href}>{body}</div>
            );
          })}
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="my-10" />

      <section aria-labelledby="the-mechanism" className="space-y-4">
        <h2 id="the-mechanism" className="text-xl font-bold md:text-2xl">
          友だちができないのは、性格の問題ではありません
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          イギリスで「親しい友人」と呼ばれる関係は、たいてい次のどれかから始まっています。
          渡英した大人にとって、使える経路は最初から限られています。
        </p>
        <MarkdownBody>
          {`| 経路 | いつ形成されるか | 渡英した大人が使えるか |
|---|---|---|
| **学生時代** | 中高・大学。とくに寮とフラットシェア | 使えない。こちらが来る何年も前に完成している |
| **職場** | 同僚として数年過ごすうち | 使える。ただし勤務時間外に自動的な延長はない |
| **趣味・スポーツ** | 継続的に通う活動の場 | **使える。現実的にはここが本命** |

そして決め手は「趣味が合うこと」ではなく、**同じ人と繰り返し会うこと**です。パブで3時間盛り上がっても次はありませんが、毎週火曜の同じ場所に3ヶ月通えば、あるとき誰かが「このあと軽く飲む？」と言い出します。

**友だちになるための会話をするのではなく、会い続けた結果として友だちになる。**順番が逆なのです。

もうひとつ、日本語圏の人がつまずくのが「フレンドリー」と「友だちになる」を同じものとして読んでしまうこと。初対面の会話が弾むのは礼儀であって、関係が進んだ合図ではありません。見分け方は単純で、**相手の言葉に日時が入っているかどうか**だけです。`}
        </MarkdownBody>
      </section>

      <Separator className="my-10" />

      <section aria-labelledby="all-guides" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-guides" className="text-xl font-bold md:text-2xl">
            出会いと人間関係のガイド一覧
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            全{socialGuides.length}本の構成で、現在{published.length}
            本を公開しています。友人・恋愛・日本人コミュニティの3つで分けています。
          </p>
        </div>

        {SOCIAL_CATEGORY_ORDER.map((category) => {
          const guides = publishedSocialGuidesByCategory(
            category,
            publishedSlugs
          );
          if (guides.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {SOCIAL_CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-3">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={socialGuidePath(g.slug)}
                    className="block"
                  >
                    <Card className="border-gray-300 bg-white shadow-sm transition hover:border-sky-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-sky-500">
                      <CardContent className="p-5">
                        <span className="block text-xs font-semibold text-sky-600">
                          {g.eyebrow}
                        </span>
                        <span className="mt-1 block text-base font-semibold">
                          {g.label}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {g.blurb}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <GuideFaq items={FAQ_ITEMS} />

      <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          あわせて読みたい
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          人と会う前提になる、住まい・仕事・お金の話は別のページにあります。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href="/housing"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              住まい探しガイド｜フラットシェアと契約の基礎
            </Link>
          </li>
          <li>
            <Link
              href="/jobs"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              働き方ガイド｜職場の人間関係と労働条件
            </Link>
          </li>
          <li>
            <Link
              href="/trouble/stalking-harassment"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              つきまとい・ストーカー被害に遭ったら
            </Link>
          </li>
          <li>
            <Link
              href="/british-english"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              イギリス英語｜会話で出てくる言い回し
            </Link>
          </li>
        </ul>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本セクションで書いているのは、ロンドンでよく見られる傾向と、
        その背景にある仕組みです。人付き合いの形は人それぞれで、
        ここに書いたとおりに進まないことのほうが普通です。
        当てはまらない相手に出会ったときは、記事ではなく目の前の相手を優先してください。
        マッチングアプリの料金や機能、イベントの日程は{SOCIAL_AS_OF}
        時点のもので、変更されることがあります。
      </p>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
