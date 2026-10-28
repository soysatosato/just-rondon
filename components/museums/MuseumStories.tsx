import MarkdownBody from "@/components/jobs/MarkdownBody";
import StoryFigure from "@/components/sightseeing/StoryFigure";
import { storyAnchor, type StoryLike } from "@/components/sightseeing/stories";

/** kind ごとの小見出し(英字)。美術館ページのほかの節と同じ作法で付ける。 */
const EYEBROW: Record<string, { label: string; className: string }> = {
  history: { label: "History", className: "bg-stone-600" },
  context: { label: "Story", className: "bg-teal-700" },
  trivia: { label: "Trivia", className: "bg-amber-700" },
  practical: { label: "Tips", className: "bg-emerald-700" },
};

/**
 * 観光スポットと対になる美術館のページに出す、Attraction 側の読み物
 * (歴史・この場所の話・訪問のヒント)。
 *
 * 2026-10 まで観光スポットのページ(/sightseeing/<slug>)に出していた本文で、
 * ページを美術館側の1本にまとめたときにこちらへ移した
 * (lib/museum-attraction-pairs.js)。美術館のほかの節と同じ幅と見出しの
 * 作法で並べる。
 */
export default function MuseumStories({
  stories,
}: {
  stories: { story: StoryLike; heading: string }[];
}) {
  if (stories.length === 0) return null;

  return (
    <>
      {stories.map(({ story, heading }) => {
        const eyebrow = EYEBROW[story.kind] ?? EYEBROW.context;
        return (
          <section
            key={story.id}
            id={storyAnchor(story)}
            className="mx-auto max-w-4xl scroll-mt-24 px-4 py-10"
          >
            <div className="mb-6">
              <span
                className={`inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white ${eyebrow.className}`}
              >
                {eyebrow.label}
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                {heading}
              </h2>
            </div>
            <MarkdownBody>{story.body}</MarkdownBody>
            <StoryFigure story={story} heading={heading} />
          </section>
        );
      })}
    </>
  );
}
