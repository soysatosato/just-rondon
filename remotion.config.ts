/**
 * Remotion の CLI(npm run reel-studio)の設定。書き出しのスクリプト
 * (scripts/render-instagram-reel.ts)はこのファイルを読まず、同じ
 * 設定を bundle() に直接渡している。
 */
import { Config } from "@remotion/cli/config";
import { reelWebpackOverride } from "./video/webpack-override";

Config.overrideWebpackConfig(reelWebpackOverride);
