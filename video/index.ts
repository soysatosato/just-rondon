/**
 * Remotion(動画を React で描くライブラリ)の入口。Instagram のリールを描く。
 *
 * Next のアプリとは別に、ローカルでだけ動く。書き出しは
 * scripts/render-instagram-reel.ts から(/add-instagram-reel スキルが呼ぶ)。
 * 見た目を調整するときは npm run reel-studio でブラウザのプレビューを開ける。
 *
 * Remotion は個人と3人以下の会社なら無料。それより大きい組織が使うときは
 * 有償の Company License が要る(https://remotion.dev/license)。
 */
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
