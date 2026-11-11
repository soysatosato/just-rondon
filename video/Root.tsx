import { Composition } from "remotion";
import { IgReel } from "./IgReel";
import { REEL_FPS, REEL_HEIGHT, REEL_WIDTH, reelDurationInFrames } from "./timing";
import type { ReelProps } from "./types";

/**
 * Studio(npm run reel-studio)で開いたときの見本。中身に意味は無い。
 * 書き出し(scripts/render-instagram-reel.ts)では必ず記事の原稿が渡る。
 */
const SAMPLE: ReelProps = {
  category: "british-english",
  word: "Sample",
  coverHead: "見本の原稿です",
  coverTail: "書き出すときは記事の原稿に置き換わります",
  points: [
    { label: "見本1", title: "要点の見出しが入る", body: "要点の本文が入ります。リールでは60字までにしています。" },
    { label: "見本2", title: "要点の見出しが入る", body: "要点の本文が入ります。リールでは60字までにしています。" },
    { label: "見本3", title: "要点の見出しが入る", body: "要点の本文が入ります。リールでは60字までにしています。" },
  ],
  closingTitle: "締めの見出しが入る",
  closingBody: "締めの本文が入ります。このあとに記事への誘導の枠が出ます。",
  photo: null,
  credit: null,
  fonts: null,
};

export function RemotionRoot() {
  return (
    <Composition
      id="IgReel"
      component={IgReel}
      width={REEL_WIDTH}
      height={REEL_HEIGHT}
      fps={REEL_FPS}
      durationInFrames={reelDurationInFrames(SAMPLE)}
      defaultProps={SAMPLE}
      calculateMetadata={({ props }) => ({ durationInFrames: reelDurationInFrames(props) })}
    />
  );
}
