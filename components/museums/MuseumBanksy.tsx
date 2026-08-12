import Link from "next/link";
import { MapPin, ShieldCheck, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import InstagramEmbed from "@/components/shared/InstagramEmbed";
import BanksyMap from "@/components/museums/BanksyMap";
import {
  AREAS,
  BANKSY_ARTWORKS,
  MAPPABLE_ARTWORKS,
  STATUS_LABEL,
  VIEWABLE_ARTWORKS,
  type ArtworkStatus,
} from "@/lib/banksy";

/** status ごとのバッジの見た目。現存しないものは赤で、目立たせて事故を防ぐ。 */
const STATUS_STYLE: Record<ArtworkStatus, string> = {
  present: "bg-emerald-600 text-white hover:bg-emerald-600",
  altered: "bg-amber-600 text-white hover:bg-amber-600",
  gone: "bg-rose-600 text-white hover:bg-rose-600",
  unconfirmed: "bg-slate-500 text-white hover:bg-slate-500",
};

const FAQ_ITEMS = [
  {
    question: "バンクシー作品を見るのにお金はかかりますか?",
    answer:
      "かかりません。このページに載せているのはすべて路上や建物の外壁にある作品で、チケットも予約も不要です。ただしショーディッチのCargo跡地のように、私有地の中庭にあって出入りがその場所の営業状況に左右されるものもあります。",
  },
  {
    question: "1日で全部回れますか?",
    answer:
      "回れません。作品はキュー(西)からチャールトン(南東)まで、直線距離で25km以上に散らばっています。イーストエンドの数点とバービカンの2点はまとめて歩けるので、まずはそこから始めるのが現実的です。",
  },
  {
    question: "行ってみたら無くなっていた、ということはありますか?",
    answer:
      "あります。バンクシー作品は撤去・盗難・塗り潰しが日常的に起きます。実際、2024年の動物シリーズの1点だったキューの「アイベックス」は2025年2月に壁ごと外されました。このページでは各作品に現況のバッジを付けていますが、出発前にもう一度確認することをおすすめします。",
  },
  {
    question: "写真を撮っても大丈夫ですか?",
    answer:
      "路上から撮るぶんには問題ありません。ただし多くの作品は人が住んでいる建物の壁や、営業中の店の外壁にあります。窓を覗き込んだり、私有地に入ったりしないでください。住宅街にある作品も多いので、早朝や夜間の訪問は避けたほうが無難です。",
  },
  {
    question: "本物かどうかはどう見分けるのですか?",
    answer:
      "バンクシーは自作を公式サイトとInstagramで公表します。逆に言えば、そこに出ていないものは本人の作品と確認できません。街には模倣作品も多く、実際に本人側が「自分の作品ではない」と否定した例もあります。このページには、本人の公表か信頼できる報道で裏付けが取れたものだけを載せています。",
  },
];

function StatusBadge({ status }: { status: ArtworkStatus }) {
  return (
    <Badge className={STATUS_STYLE[status]}>{STATUS_LABEL[status]}</Badge>
  );
}

export default function MuseumBanksy() {
  const goneCount = BANKSY_ARTWORKS.filter((a) => a.status === "gone").length;
  const protectedCount = BANKSY_ARTWORKS.filter((a) => a.protected).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-14 md:py-10">
      {/* Hero */}
      <section className="space-y-5">
        <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Street Art
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          街で見つけるバンクシー
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          ロンドンの美術館は、世界中から集めた作品を無料で見せてくれます。
          バンクシーの作品は、その逆です。誰の許可も得ずに街の壁に現れ、
          持ち主が消すか、誰かが切り取って持ち去るまでそこにある。
          チケット売り場も、閉館時間もありません。
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          そのぶん、確実に見られるとは限りません。このページでは
          {BANKSY_ARTWORKS.length}点それぞれについて、
          今も現地にあるのか、保護されているのか、
          すでに失われたのかを明記しました。無駄足を踏まないために使ってください。
        </p>

        <dl className="grid grid-cols-3 gap-3 pt-2 sm:max-w-lg">
          {[
            { label: "掲載作品", value: BANKSY_ARTWORKS.length, unit: "点" },
            { label: "現地で見られる", value: VIEWABLE_ARTWORKS.length, unit: "点" },
            { label: "保護板あり", value: protectedCount, unit: "点" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-bold tracking-tight">
                {stat.value}
                <span className="ml-0.5 text-sm font-medium text-muted-foreground">
                  {stat.unit}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        {goneCount > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
              掲載{BANKSY_ARTWORKS.length}点のうち{goneCount}点は、
              すでに現地から失われています。記録として残していますが、
              その場所へ行っても作品は見られません。
              各作品のバッジで現況を確認してください。
            </p>
          </div>
        )}
      </section>

      {/* バンクシーとは */}
      <section className="space-y-5">
        <div>
          <span className="inline-block rounded-full bg-rose-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Who Is Banksy
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            バンクシーとは
          </h2>
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            バンクシーは、
            <span className="font-medium text-foreground">
              正体を明かさないまま活動を続けているイギリスのストリートアーティスト
            </span>
            です。1990年代のブリストルで壁に描き始め、そこからロンドンへ、
            さらに世界へ広がりました。本名も顔も公表されていません。
            展覧会の内覧会に本人が現れることもなければ、
            インタビューに顔を出すこともない。
            それでいて、作品は数十万ポンドで取引されます。
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            匿名なのは神秘性の演出ではなく、実務的な理由もあります。
            許可なく他人の壁に描く行為は、イギリスでは器物損壊にあたります。
            名乗り出れば訴えられる立場のまま、
            30年近く描き続けているアーティスト、というのが実像に近いです。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              title: "数十秒で描き切るステンシル",
              body: "切り抜いた型紙にスプレーを吹き付ける手法です。筆で描くより圧倒的に速く、人目につく路上でも短時間で仕上げられます。輪郭がくっきりした独特の絵柄は、この「捕まる前に描き終える」という必要から生まれたものです。",
            },
            {
              title: "皮肉をひとつだけ仕込む",
              body: "作品はたいてい一目で意味がわかります。ロイヤル・ファミリーの肖像、風船を持つ少女、警備犬。そこに要素をひとつだけずらして入れ、見た人に引っかかりを残す。長い説明文を必要としないのが、街なかの作品として強い理由です。",
            },
            {
              title: "ネズミという分身",
              body: "初期から繰り返し登場するモチーフです。街の隅に住み、誰にも歓迎されず、それでも消えない。作者自身の立ち位置と重なります。ロンドンにも「ロボが好き」ネズミやトンブリッジ・ストリートのネズミが残っています。",
            },
            {
              title: "場所ごと作品にする",
              body: "壁の汚れ、消火栓、道路の黄色いライン。もとからそこにあるものを絵の一部として使います。ベスナル・グリーンの「黄色いラインの花を描く画家」はその代表で、道路標示がそのまま茎になっています。だから移設すると価値が変わってしまいます。",
            },
          ].map((trait) => (
            <div
              key={trait.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold tracking-tight">{trait.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {trait.body}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold tracking-tight">
            なぜロンドンで見る価値があるのか
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            バンクシーの作品は、美術館に収まることを前提に作られていません。
            誰が持ち主かも、いつまで残るかも決まっていない壁の上にあります。
            2024年8月には、9日間で9点の動物シリーズがロンドン各所に次々と現れました。
            サイ、ゾウ、ペリカン、アイベックス。
            発表は本人のInstagramだけ。市民が探し回り、報道が追いかけ、
            数日で保護板が設置されたものもあれば、
            <span className="font-medium text-foreground">
              壁ごと切り取られて消えたものもあります
            </span>
            。
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            つまりロンドンで見られるバンクシーは、
            完成された展示ではなく、まだ決着のついていない出来事です。
            通勤路の途中や住宅街の角に、案内板も柵もなく置かれている。
            それを自分の足で見つけに行けるところが、この街ならではの面白さです。
          </p>
        </div>
      </section>

      {/* 地図 */}
      <section className="space-y-5">
        <div>
          <span className="inline-block rounded-full bg-sky-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Map
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            地図で見る
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            現地にある{MAPPABLE_ARTWORKS.length}点を表示しています。
            西のキューから南東のチャールトンまで25km以上に散らばっているので、
            1日で回りきることは考えないほうがいいです。
          </p>
        </div>
        <div className="h-[420px] overflow-hidden rounded-xl border border-border">
          <BanksyMap artworks={MAPPABLE_ARTWORKS} />
        </div>
      </section>

      {/* エリア別の作品 */}
      {AREAS.map((area) => {
        const items = BANKSY_ARTWORKS.filter((a) => a.areaKey === area.key);
        if (items.length === 0) return null;

        return (
          <section key={area.key} className="space-y-5">
            <div>
              <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                {area.name}
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                {area.name}の{items.length}点
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {area.hint}
              </p>
            </div>

            <div className="space-y-5">
              {items.map((art) => (
                <Card
                  key={art.id}
                  className="overflow-hidden border border-border"
                >
                  <div className="grid gap-0 md:grid-cols-[minmax(0,320px)_1fr]">
                    {/* 写真 */}
                    <div className="border-b border-border bg-muted/40 p-4 md:border-b-0 md:border-r">
                      {art.fromIG ? (
                        <InstagramEmbed url={art.url} reservedHeight={320} />
                      ) : (
                        <img
                          src={art.url}
                          alt={`${art.name}(${art.engName})`}
                          className="w-full rounded-lg object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>

                    {/* 本文 */}
                    <CardContent className="space-y-3 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={art.status} />
                        {art.protected && (
                          <Badge
                            variant="outline"
                            className="gap-1 text-muted-foreground"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            保護板あり
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {art.year}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold tracking-tight">
                          {art.engName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {art.name}
                        </p>
                      </div>

                      <p className="text-sm font-medium text-foreground">
                        {art.statusNote}
                      </p>

                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {art.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{art.address}</span>
                        </p>
                        {art.status !== "gone" && (
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${art.address} London`,
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              地図で見る
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

      {/* 見に行く前に */}
      <section className="space-y-5">
        <div>
          <span className="inline-block rounded-full bg-amber-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Before You Go
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            見に行く前に知っておくこと
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              title: "出発前にもう一度確認する",
              body: "このページの現況は2026年8月時点の調査に基づきます。バンクシー作品は数日で状況が変わることがあり、実際に撤去・盗難・塗り潰しが繰り返されてきました。遠くまで足を運ぶ前に、最新の情報を確認してください。",
            },
            {
              title: "保護板は写真映えを損なう",
              body: "残っている作品の多くはペルスペックスの板で覆われています。守るためには必要ですが、光が反射して写真は撮りにくく、フィンズベリー・パークの「ツリー」のように保護構造が視界に入って本来の効果が薄れる例もあります。",
            },
            {
              title: "住宅の壁であることを忘れない",
              body: "多くの作品は人が暮らしている建物の外壁にあります。観光地ではないので、案内板も柵もありません。窓を覗かない、私有地に入らない、早朝や夜間は避ける。それだけで十分です。",
            },
            {
              title: "まとめて回るならイーストエンド",
              body: "ショーディッチ、ブリック・レーン、ベスナル・グリーンは徒歩圏に複数点があり、バービカンの2点も地下鉄ですぐです。他のエリアの作品は1点ずつ離れているので、近くに行く用事と合わせるのが現実的です。",
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold tracking-tight">{tip.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tip.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 消えていく作品について */}
      <section className="space-y-5">
        <div>
          <span className="inline-block rounded-full bg-violet-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Why They Disappear
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            なぜ作品は消えるのか
          </h2>
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            バンクシーの作品は、描かれた瞬間から
            <span className="font-medium text-foreground">
              その壁の持ち主の財産
            </span>
            になります。ここに、この種のアートの厄介な問題があります。
            無許可で描かれたものが、数十万ポンドの価値を持ってしまう。
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            ベスナル・グリーンの「黄色いラインの花を描く画家」は、
            2019年に壁から切り出されてアメリカへ渡りました。売却をめぐって
            クラブの理事会が提訴し、2025年時点でまだ争いは続いています。
            ウッド・グリーンにあった「Slave Labour」も壁ごと外され、
            オークションで75万ポンド超で落札されました。
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            一方で、守られた例もあります。ウォルサムストウの「ペリカン」は、
            地域のコレクティブが保護板を設置し、住民が見張りを立てて残しました。
            バービカンのバスキア壁画2点は、施設側が恒久保存の方針を取っています。
            <span className="font-medium text-foreground">
              誰かが手間をかけた作品だけが残る
            </span>
            、というのが実際のところです。
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-5">
        <div>
          <span className="inline-block rounded-full bg-slate-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            FAQ
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">よくある質問</h2>
        </div>
        <Accordion
          type="single"
          collapsible
          className="rounded-xl border border-border bg-card px-5"
        >
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={item.question}
              value={`faq-${i}`}
              className={i === FAQ_ITEMS.length - 1 ? "border-b-0" : ""}
            >
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 締め */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-indigo-50 via-background to-sky-50 p-8 text-center dark:from-indigo-950/30 dark:via-background dark:to-sky-950/20">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          屋内のアートも見るなら
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          テート・モダンやナショナル・ギャラリーをはじめ、
          ロンドンの主要な美術館は常設展が無料です。
          雨の日の逃げ場としても優秀です。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/museums">美術館ガイドのトップへ</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/museums/all-museums">全館から探す</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
