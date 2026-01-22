import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { fetchRoyalActivities } from "@/utils/actions/contents";

export default async function RoyalAcrivitiesListPage() {
  const items = await fetchRoyalActivities();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-14">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-xl font-extrabold tracking-tight">
          2025年版・ロンドン王室スポットガイド
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          2025年版・ロンドンの王室スポットガイド。イギリス王室の世界を楽しむための最良のめぐり方を紹介します。
          目玉は、英国王室の中心であるバッキンガム宮殿をはじめとした王宮の訪問です。
          2025年の夏にはステート・アパートメント（公式諸間）の一般公開が行われ、
          一年を通して王室コレクションの絵画や歴史的な品々を見ることができます。
          またロンドンには、ダイアナ元妃が暮らしたケンジントン宮殿や、
          王冠宝器が保管されているロンドン塔など、王室ゆかりの場所が多数あります。
        </p>
      </section>

      {/* List Section */}
      <section className="grid gap-8">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            目次
          </h2>

          <ul className="list-none space-y-3 border-l border-gray-300 dark:border-gray-700 pl-3">
            {items.map((item: any, idx: number) => (
              <li key={item.id} className="leading-tight relative pl-6">
                <span
                  className="
            absolute left-0 text-gray-500 dark:text-gray-400 text-sm
          "
                >
                  {idx + 1}.
                </span>

                <a
                  href={`#${item.slug}`}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline text-sm font-medium"
                >
                  {item.title}
                </a>

                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                  {item.summary}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* --- Cards Section --- */}
        <section className="grid gap-10">
          {items.map((item: any) => (
            <div key={item.id} id={item.slug} className="scroll-mt-24">
              <Link
                key={item.id}
                href={`/sightseeing/${item.slug}`}
                className="group block"
              >
                <Card
                  className="shadow-sm border bg-white/60 dark:bg-white/20 backdrop-blur-sm 
                         hover:shadow-xl hover:bg-white dark:hover:bg-black transition-all duration-300"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      width={800}
                      height={500}
                      className="w-full h-48 object-cover rounded-t-lg"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      {item.title}
                    </CardTitle>

                    {item.engTitle && (
                      <p className="text-sm text-muted-foreground italic">
                        {item.engTitle}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="text-sm leading-relaxed space-y-3">
                    <p className="font-medium text-muted-foreground">
                      {item.summary}
                    </p>

                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <ReactMarkdown>{item.mainText}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </section>
      </section>
    </div>
  );
}
