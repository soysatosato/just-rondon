import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EyeOff, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { MusicalCharacter } from "./story";

/**
 * あらすじ。hook(惹き) → characters(誰の話か) → scenes(流れ) →
 * ending(折りたたみ) の順に、読者が降りる深さを選べるように積む。
 *
 * 層ごとに埋まっていない作品があるので、それぞれ無ければ丸ごと出さない。
 * 移行前の作品は scenes だけが出て、従来と同じ見え方になる。
 */
export default function MusicalSceneDescription({
  description,
  name,
  storyHook,
  characters,
  storyEnding,
}: {
  description: string;
  name: string;
  storyHook: string | null;
  characters: MusicalCharacter[];
  storyEnding: string | null;
}) {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-snug">
          {name} はどんな物語か
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          英語で観る前に、物語の芯と登場人物をつかんでおくための紹介です。
          結末はページの一番下に、開いた人だけが読める形で置いています。
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

      <div>
        <h3 className="text-lg font-bold text-foreground">物語の流れ</h3>
        <div className="mt-4 space-y-1">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              // ページの h1 は MusicalHero が作品名で描画しているので、
              // 原稿の # は h3 まで下げる。見出しの階層と字面の階層を
              // 合わせないと、幕の見出しが「物語の流れ」より大きく見える。
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
              // 原稿の --- は幕の区切りに使われている。見出し側で
              // 間隔を作っているので、線は引かず余白だけ残す。
              hr: () => <div className="h-2" />,
            }}
          >
            {description}
          </Markdown>
        </div>
      </div>

      {storyEnding && (
        <Accordion type="single" collapsible>
          <AccordionItem
            value="ending"
            className="rounded-xl border border-border bg-muted/30 px-4 border-b"
          >
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-2 font-bold text-foreground">
                <EyeOff className="h-4 w-4 text-primary" />
                結末を読む（ネタバレ）
              </span>
            </AccordionTrigger>
            <AccordionContent>
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </section>
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
