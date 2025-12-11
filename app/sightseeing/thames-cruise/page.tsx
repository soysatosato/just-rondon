import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { fetchThamesRiverCruises } from "@/utils/actions/contents";
import Link from "next/link";
import ExpandableText from "@/components/card/ExpandableText";
import BreadCrumbs from "@/components/home/BreadCrumbs";

export default async function ThamesRiverCruisesListPage() {
  const items = await fetchThamesRiverCruises();

  return (
    <div className="max-w-5xl mx-auto py-16 space-y-14">
      {/* Hero Section */}
      <div className="mb-4">
        <BreadCrumbs
          name="観光ガイド"
          link="sightseeing"
          name2="テムズ川特集"
        />
      </div>
      <section className="relative text-center space-y-6 rounded-2xl overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/thamescruisebg.jpeg"
            alt="Thames River background"
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>
        <h1 className="text-xl text-blue-200 font-extrabold tracking-tight">
          2025年版・テムズ川クルーズ特集
        </h1>

        <p className="text-sm text-blue-100 leading-relaxed max-w-2xl mx-auto px-2 pb-6">
          美しいロンドンの街並みを、水上から楽しむ贅沢な時間。
          アフタヌーンティーやディナー、夜景の眺望など、
          テムズ川クルーズならではの体験を厳選して紹介します。
        </p>
      </section>

      {/* List Section */}
      <section className="grid gap-8">
        {/* Table of Content */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            目次
          </h2>

          <ul className="list-none space-y-3 border-l border-gray-300 dark:border-gray-700 pl-3">
            {items.map((item: any, idx: number) => (
              <li key={item.id} className="leading-tight relative pl-6">
                <span className="absolute left-0 text-gray-500 dark:text-gray-400 text-sm">
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

        {/* Cards Section */}
        <section className="grid gap-10">
          {items.map((item: any) => (
            <div key={item.id} id={item.slug} className="scroll-mt-24">
              <Card
                className="shadow-sm border bg-white/60 dark:bg-white/20 backdrop-blur-sm 
                            hover:shadow-xl hover:bg-white dark:hover:bg-black
                            transition-all duration-300"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={800}
                    height={500}
                    className="w-full h-48 object-cover rounded-t-lg"
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

                <CardContent className="text-sm leading-relaxed space-y-4">
                  {/* Summary */}
                  <p className="font-medium text-muted-foreground">
                    {item.summary}
                  </p>

                  {/* MainText */}
                  {item.mainText && (
                    <ExpandableText text={item.mainText} maxLines={3} />
                  )}

                  {/* Sections → 場所 / 公式サイトなど */}
                  {item.sections?.length > 0 && (
                    <div className="pt-2 border-t border-gray-300 dark:border-gray-700 space-y-1">
                      {item.website && (
                        <div>
                          <p className="font-semibold">正規サイト</p>
                          <div className="text-muted-foreground underline text-sm mb-4">
                            <Link href={item.website}>{item.website}</Link>
                          </div>
                        </div>
                      )}

                      {item.sections.map((section: any) => (
                        <div key={section.id}>
                          <p className="font-semibold">{section.title}</p>
                          {section.description && (
                            <div className="text-muted-foreground underline text-sm mb-4">
                              <ReactMarkdown>
                                {section.description}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </section>
      </section>
    </div>
  );
}
