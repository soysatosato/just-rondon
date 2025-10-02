import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
export default function MusicalSceneDescription({
  description,
  name,
}: {
  description: string;
  name: string;
}) {
  return (
    <div className="mt-8">
      <div className="m-6 px-4 text-center sm:px-0">
        <h2 className="text-xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-snug">
          {name} の物語・シーン紹介
        </h2>
        <p className="mt-1 text-base sm:text-lg text-gray-600 dark:text-gray-400 italic">
          〜 あらすじと主要シーンをチェック 〜
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
          ミュージカルをより楽しむためには、事前にあらすじや登場人物、主要シーンを把握しておくことが重要です。
          英語で上演される作品では、歌詞やセリフの意味まで理解するのが難しい場合がありますが、このページではわかりやすく解説しています。{" "}
        </p>
      </div>

      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-xl sm:text-2xl font-bold text-pink-300 dark:text-pink-300"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-xl sm:text-xl font-semibold mt-4 text-pink-300 dark:text-pink-300"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-lg sm:text-xl font-medium mt-3 text-pink-300 dark:text-pink-200"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p
              className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base"
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li
              className="ml-5 list-disc text-gray-700 dark:text-gray-300 text-sm sm:text-base"
              {...props}
            />
          ),
        }}
      >
        {description}
      </Markdown>
    </div>
  );
}
