import type { TravelGuideSource } from "./types";

/**
 * 一次情報へのリンクと鮮度の但し書き。
 *
 * jobs 側の GuideDisclaimer(法務免責)は使わない。旅行記事で必要なのは
 * 「この数字はいつのもので、最新はどこを見ればいいか」の一点。
 */
export default function GuideSources({
  sources,
  dataAsOf,
}: {
  sources: TravelGuideSource[];
  dataAsOf: string;
}) {
  return (
    <section className="mt-12 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        参考・公式情報
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        料金・時刻・制度は変更されます。本記事は{dataAsOf}
        時点の情報です。渡航前に各公式サイトで最新情報をご確認ください。
      </p>
    </section>
  );
}
