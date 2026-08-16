import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EyeOff, ListOrdered, Sparkles, Theater, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { MusicalAppeal, MusicalCharacter } from "./story";

/**
 * あらすじ。hook(惹き) → characters(誰の話か) → appeals(なぜ観るか) と
 * 開いた状態で積み、筋を追う二層(流れ・結末)は折りたたむ。
 *
 * 流れを畳んでいるのは、作品を選んでいる段階の読者に必要なのが
 * 「どんな話か」までで、幕ごとのシーン運びは予習の道具だから。
 * 出しっぱなしにすると、長い箇条書きがページを占領して、その下にある
 * 上演時間や日程まで読者が届かなくなる。
 *
 * 層ごとに埋まっていない作品があるので、それぞれ無ければ丸ごと出さない。
 * 移行前の作品は流れの折りたたみだけが出る。
 */
export default function MusicalSceneDescription({
  description,
  name,
  storyHook,
  characters,
  appeals,
  storyEnding,
}: {
  description: string;
  name: string;
  storyHook: string | null;
  characters: MusicalCharacter[];
  appeals: MusicalAppeal[];
  storyEnding: string | null;
}) {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-snug">
          {name} はどんな物語か
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          物語の芯と見どころの紹介です。幕ごとのあらすじと結末は、
          読みたい人だけが開ける形で下にまとめています。
        </p>
      </div>

      {storyHook && (
        // 惹きの層。ここだけは幅を詰めて、地の文として読ませる。
        // 箇条書きより行長が長くなるので、本文サイズも一段上げている。
        <div className="border-l-2 border-primary/40 pl-5 sm:pl-6">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ ...props }) => (
                <p
                  className="text-base sm:text-lg leading-loose text-foreground [&+p]:mt-4"
                  {...props}
                />
              ),
              strong: ({ ...props }) => (
                <strong className="font-bold text-primary" {...props} />
              ),
            }}
          >
            {storyHook}
          </Markdown>
        </div>
      )}

      {characters.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            主な登場人物
          </h3>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {characters.map((character) => (
              <li
                key={character.name}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-foreground">
                    {character.name}
                  </span>
                  <span className="text-xs text-primary">{character.role}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {character.oneLiner}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {appeals.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            この作品の見どころ
          </h3>
          <div className="mt-4 space-y-3">
            {appeals.map((appeal) => (
              <AppealCard key={appeal.title} appeal={appeal} />
            ))}
          </div>
        </div>
      )}

      {/* 筋を追う二層は、どちらも既定で閉じる。観るかどうかを決める段階の
          読者にとっては、ここから下は読まなくてよい情報。開いた読者だけが
          結末まで一続きに読めるよう、流れと結末は隣り合わせに置く。 */}
      <Accordion type="single" collapsible className="space-y-3">
        <FoldedStory
          value="flow"
          icon={ListOrdered}
          label="物語の流れを読む"
          note="幕ごとのシーン運び。結末は含みません"
        >
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              // ページの h1 は MusicalHero が作品名で描画しているので、
              // 原稿の見出しは深さによらず同じ字面にそろえる。
              h1: ({ ...props }) => <SceneHeading {...props} />,
              h2: ({ ...props }) => <SceneHeading {...props} />,
              h3: ({ ...props }) => <SceneHeading {...props} />,
              p: ({ ...props }) => (
                <p
                  className="text-sm sm:text-base leading-relaxed text-muted-foreground"
                  {...props}
                />
              ),
              ul: ({ ...props }) => (
                <ul className="space-y-2 mt-3" {...props} />
              ),
              li: ({ ...props }) => (
                <li
                  className="ml-5 list-disc text-sm sm:text-base leading-relaxed text-foreground marker:text-primary/50"
                  {...props}
                />
              ),
              // 原稿の --- は幕の区切り。見出し側で間隔を作っているので
              // 線は引かず余白だけ残す。
              hr: () => <div className="h-2" />,
            }}
          >
            {description}
          </Markdown>
        </FoldedStory>

        {storyEnding && (
          <FoldedStory
            value="ending"
            icon={EyeOff}
            label="結末を読む"
            note="ネタバレを含みます"
          >
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ ...props }) => (
                  <p
                    className="text-sm sm:text-base leading-relaxed text-foreground [&+p]:mt-3"
                    {...props}
                  />
                ),
                li: ({ ...props }) => (
                  <li
                    className="ml-5 list-disc text-sm sm:text-base leading-relaxed text-foreground marker:text-primary/50"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => <ul className="space-y-2" {...props} />,
              }}
            >
              {storyEnding}
            </Markdown>
          </FoldedStory>
        )}
      </Accordion>
    </section>
  );
}

/** 見どころ1件。裏話は色を変えて、劇中の話ではないことを字面で示す。 */
function AppealCard({ appeal }: { appeal: MusicalAppeal }) {
  const isTrivia = appeal.kind === "trivia";
  return (
    <div
      className={
        isTrivia
          ? "rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 sm:p-5"
          : "rounded-xl border border-border bg-card p-4 sm:p-5"
      }
    >
      <h4 className="flex items-start gap-2 font-bold text-foreground">
        {isTrivia && (
          <Theater className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        )}
        <span>
          {isTrivia && (
            <span className="mr-2 text-xs font-bold text-primary">裏話</span>
          )}
          {appeal.title}
        </span>
      </h4>
      <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
        {appeal.body}
      </p>
    </div>
  );
}

/** 既定で閉じている、筋を追うための層。 */
function FoldedStory({
  value,
  icon: Icon,
  label,
  note,
  children,
}: {
  value: string;
  icon: React.ElementType;
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="rounded-xl border border-border bg-muted/30 px-4 sm:px-5"
    >
      <AccordionTrigger className="hover:no-underline">
        <span className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-bold text-foreground">{label}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {note}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-5">{children}</AccordionContent>
    </AccordionItem>
  );
}

/** 幕の見出し。原稿の # の深さによらず同じ見た目にする。 */
function SceneHeading(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className="mt-8 mb-1 border-b border-border pb-2 text-base sm:text-lg font-bold text-foreground first:mt-0"
      {...props}
    />
  );
}
