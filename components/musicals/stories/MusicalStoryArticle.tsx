import Link from "next/link";
import {
  BookOpen,
  Clock,
  EyeOff,
  Landmark,
  Music,
  Theater,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import GuideFaq from "@/components/guides/GuideFaq";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import { theatrePath } from "@/components/musicals/theatres/theatres";
import type { MusicalStory } from "./types";

/** ページ上部に出す、DB 由来の観劇の事実。原稿側には持たせない。 */
export type MusicalStoryFacts = {
  name: string;
  engName: string;
  slug: string;
  theatreName: string;
  theatreSlug: string | null;
  runtimeMinutes: number | null;
  intervalMinutes: number | null;
  minAgeGuidance: number | null;
  isOnShow: boolean;
  songsCount: number;
};

/** 「2時間50分」。runtime が無ければ null。 */
function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
}

/**
 * あらすじ専用ページの本体。
 *
 * 並びは読者が引き返せる順にしてある。一行 → 導入 → 背景 → 人物 →
 * 幕ごとの筋 → （ここで折りたたみ）結末 → 誤解 → 観る前に → FAQ。
 * 結末より前は全部開いた状態で読めるので、まだ観ていない読者は
 * 折りたたみの手前で止まればよい。
 *
 * 曲名は場面の目印として出すが、歌詞は一行も置かない。歌詞ページは
 * 第三者の著作物として noindex にした経緯があり、その判断を
 * このページから崩さないこと。
 */
export default function MusicalStoryArticle({
  story,
  facts,
}: {
  story: MusicalStory;
  facts: MusicalStoryFacts;
}) {
  const runtime = formatRuntime(facts.runtimeMinutes);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <header className="space-y-4">
        <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Story
        </span>
        <h1 className="text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
          {facts.name} のあらすじ
        </h1>
        <p className="text-sm text-muted-foreground">
          {facts.engName}
          {facts.isOnShow && (
            <>
              {" ・ "}
              {facts.theatreSlug ? (
                <Link
                  href={theatrePath(facts.theatreSlug)}
                  className="text-blue-600 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
                >
                  {facts.theatreName}
                </Link>
              ) : (
                facts.theatreName
              )}
              {" で上演中"}
            </>
          )}
        </p>

        {/* 一行で言うと。ページに来た読者が最初に受け取る一文。 */}
        <p className="rounded-xl border-l-4 border-primary bg-muted/50 px-5 py-4 text-base font-bold leading-relaxed text-foreground sm:text-lg">
          {story.oneLine}
        </p>

        {/* 予習の役に立つ事実だけを、DB から出す。 */}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {runtime && (
            <Fact icon={<Clock className="h-3.5 w-3.5" />} label="上演時間">
              {runtime}
              {facts.intervalMinutes ? `（休憩${facts.intervalMinutes}分込み）` : ""}
            </Fact>
          )}
          {facts.minAgeGuidance !== null && (
            <Fact icon={<Users className="h-3.5 w-3.5" />} label="劇場の推奨">
              {facts.minAgeGuidance}歳以上
            </Fact>
          )}
          <Fact icon={<Theater className="h-3.5 w-3.5" />} label="劇場">
            {facts.theatreName}
          </Fact>
          {facts.songsCount > 0 && (
            <Fact icon={<Music className="h-3.5 w-3.5" />} label="楽曲数">
              {facts.songsCount}曲
            </Fact>
          )}
        </dl>
      </header>

      <StoryToc story={story} />

      <section id="intro" className="mt-10 scroll-mt-20">
        <MarkdownBody className="text-[15px] leading-loose sm:text-base">
          {story.intro}
        </MarkdownBody>
      </section>

      {story.background.length > 0 && (
        <section id="background" className="mt-12 scroll-mt-20">
          <SectionHeading icon={<Landmark className="h-4 w-4" />}>
            物語の前提となる時代
          </SectionHeading>
          <div className="mt-4 space-y-4">
            {story.background.map((item) => (
              <Card
                key={item.title}
                className="border-gray-200 p-5 shadow-none dark:border-neutral-700"
              >
                <h3 className="text-sm font-bold text-foreground">
                  {item.title}
                </h3>
                <MarkdownBody className="text-muted-foreground">
                  {item.body}
                </MarkdownBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {story.people.length > 0 && (
        <section id="people" className="mt-12 scroll-mt-20">
          <SectionHeading icon={<Users className="h-4 w-4" />}>
            主な登場人物
          </SectionHeading>
          <p className="mt-2 text-sm text-muted-foreground">
            プログラムやキャストボードと突き合わせられるよう、英語表記を添えています。
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {story.people.map((person) => (
              <li
                key={person.name}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-bold text-foreground">
                    {person.name}
                  </span>
                  <span className="text-xs text-primary">{person.role}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {person.engName}
                </p>
                <MarkdownBody className="text-muted-foreground">
                  {person.body}
                </MarkdownBody>
              </li>
            ))}
          </ul>
        </section>
      )}

      {story.acts.map((act) => (
        <section key={act.id} id={act.id} className="mt-14 scroll-mt-20">
          <div className="border-b border-border pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {act.period}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
              {act.label}のあらすじ
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {act.lede}
            </p>
          </div>

          <div className="mt-6 space-y-8">
            {act.scenes.map((scene) => (
              <div key={scene.title}>
                <h3 className="text-lg font-bold text-foreground">
                  {scene.title}
                </h3>
                <MarkdownBody className="text-[15px] leading-loose">
                  {scene.body}
                </MarkdownBody>
                {scene.songs && scene.songs.length > 0 && (
                  // 曲名は場面の目印。歌詞は載せない。
                  <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Music className="h-3 w-3 shrink-0 text-primary" />
                    {scene.songs.map((song) => (
                      <span
                        key={song}
                        className="rounded-full bg-muted px-2 py-0.5"
                      >
                        {song}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* 結末。ページのタイトルはネタバレを名乗るが、開くまでは見せない。
          「結末まで知りたい」と「筋だけ知りたい」が同じ検索語で来るため。 */}
      <section id="ending" className="mt-14 scroll-mt-20">
        <Accordion type="single" collapsible>
          <AccordionItem value="ending" className="border-none">
            <Card className="border-amber-300 bg-amber-50/60 shadow-none dark:border-amber-900/60 dark:bg-amber-950/20">
              <AccordionTrigger className="px-5 py-4 text-left">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <EyeOff className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                  結末を読む（ネタバレ）
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <MarkdownBody className="text-[15px] leading-loose">
                  {story.ending}
                </MarkdownBody>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </section>

      {story.misconceptions.length > 0 && (
        <section id="misconceptions" className="mt-14 scroll-mt-20">
          <SectionHeading icon={<TriangleAlert className="h-4 w-4" />}>
            よくある誤解
          </SectionHeading>
          <div className="mt-4 space-y-4">
            {story.misconceptions.map((item) => (
              <div
                key={item.title}
                className="border-l-2 border-destructive/40 pl-4 sm:pl-5"
              >
                <h3 className="text-sm font-bold text-foreground">
                  {item.title}
                </h3>
                <MarkdownBody className="text-muted-foreground">
                  {item.body}
                </MarkdownBody>
              </div>
            ))}
          </div>
        </section>
      )}

      {story.beforeYouGo.length > 0 && (
        <section id="before-you-go" className="mt-14 scroll-mt-20">
          <SectionHeading icon={<BookOpen className="h-4 w-4" />}>
            観る前に知っておくこと
          </SectionHeading>
          <ul className="mt-4 space-y-3">
            {story.beforeYouGo.map((item) => (
              <li
                key={item}
                className="rounded-lg bg-muted/60 px-4 py-3 text-sm leading-relaxed text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {story.faqs.length > 0 && (
        <div id="faq" className="scroll-mt-20">
          <GuideFaq items={story.faqs} />
        </div>
      )}

      <footer className="mt-14 space-y-4 border-t border-border pt-6">
        <p className="text-xs text-muted-foreground">
          最終更新 {story.updatedAt}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/musicals/${facts.slug}`}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            {facts.name} の公演情報・見どころ
          </Link>
          <Link
            href="/musicals/west-end-tickets"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            ウエストエンドのチケットの取り方
          </Link>
          <Link
            href="/musicals/first-time-theatre"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            はじめての劇場ガイド
          </Link>
        </div>
      </footer>
    </article>
  );
}

function Fact({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-bold text-foreground">{children}</dd>
    </div>
  );
}

function SectionHeading({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground sm:text-2xl">
      <span className="text-primary">{icon}</span>
      {children}
    </h2>
  );
}

/**
 * 目次。GuideToc をそのまま使わないのは、あちらが GuideSectionData の
 * 配列を前提にしていて、この記事の節が幕・結末・誤解と種類の違う
 * ものの並びだから。見た目だけ揃えてある。
 */
function StoryToc({ story }: { story: MusicalStory }) {
  const items: { id: string; label: string }[] = [
    { id: "intro", label: "どんな話か" },
    ...(story.background.length > 0
      ? [{ id: "background", label: "物語の前提となる時代" }]
      : []),
    ...(story.people.length > 0
      ? [{ id: "people", label: "主な登場人物" }]
      : []),
    ...story.acts.map((act) => ({
      id: act.id,
      label: `${act.label}のあらすじ`,
    })),
    { id: "ending", label: "結末（ネタバレ）" },
    ...(story.misconceptions.length > 0
      ? [{ id: "misconceptions", label: "よくある誤解" }]
      : []),
    ...(story.beforeYouGo.length > 0
      ? [{ id: "before-you-go", label: "観る前に知っておくこと" }]
      : []),
    ...(story.faqs.length > 0 ? [{ id: "faq", label: "よくある質問" }] : []),
  ];

  return (
    <nav
      aria-label="目次"
      className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        目次
      </h2>
      <ul className="mt-3 list-none space-y-2 border-l border-gray-300 pl-4 dark:border-neutral-700">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-sm text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
            >
              {i + 1}. {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
