import type { WebpackOverrideFn } from "@remotion/bundler";

/**
 * Remotion のバンドラの設定を直す。書き出し(scripts/render-instagram-reel.ts)
 * と Studio(remotion.config.ts)の両方から使う。
 *
 * Remotion は TSX を esbuild で変換し、そのときルートの tsconfig.json を読む。
 * ルートの tsconfig は Next 用で jsx: "preserve" のため、esbuild は旧式の
 * React.createElement に落とす(各ファイルで React を import しないと
 * 描画時に落ちる)。esbuild の jsx オプションは tsconfig より優先されるので、
 * ここで新しい JSX 変換(react/jsx-runtime)に切り替える。
 */
export const reelWebpackOverride: WebpackOverrideFn = (config) => ({
  ...config,
  module: {
    ...config.module,
    rules: (config.module?.rules ?? []).map((rule) => {
      if (!rule || typeof rule !== "object" || !Array.isArray(rule.use)) return rule;
      return {
        ...rule,
        use: rule.use.map((entry) => {
          if (
            !entry ||
            typeof entry !== "object" ||
            typeof entry.loader !== "string" ||
            !entry.loader.includes("esbuild-loader") ||
            !entry.options ||
            typeof entry.options !== "object"
          ) {
            return entry;
          }
          return { ...entry, options: { ...entry.options, jsx: "automatic" } };
        }),
      };
    }),
  },
});
