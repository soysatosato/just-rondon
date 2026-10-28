import Image from "next/image";
import { isResizableImage } from "@/lib/wikimedia-image";
import type { StoryLike } from "@/components/sightseeing/stories";

/**
 * 読み物(AttractionStory)1本に添える画像と出典。
 *
 * 観光スポットの詳細ページと、観光スポットと対になる美術館のページの両方で
 * 読み物を描くので、画像の出し方もここで1つにしている。
 *
 * 画像は当面ほぼ null。Commons の画像は作者名とライセンスの表記が要るので、
 * URL だけでは描かず出典とセットで出す。
 */
export default function StoryFigure({
  story,
  heading,
}: {
  story: StoryLike;
  heading: string;
}) {
  if (!story.imageUrl) return null;

  return (
    <figure className="mt-4">
      <Image
        src={story.imageUrl}
        unoptimized={!isResizableImage(story.imageUrl)}
        alt={story.imageCaption ?? heading}
        width={1200}
        height={800}
        sizes="(max-width: 768px) 100vw, 768px"
        className="h-auto w-full rounded-xl border border-border"
        loading="lazy"
      />
      {(story.imageCaption || story.imageCredit) && (
        <figcaption className="mt-2 text-xs text-muted-foreground">
          {story.imageCaption}
          {story.imageCredit && (
            <>
              {story.imageCaption ? " ／ " : ""}
              {story.imageLink ? (
                <a
                  href={story.imageLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {story.imageCredit}
                </a>
              ) : (
                story.imageCredit
              )}
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
