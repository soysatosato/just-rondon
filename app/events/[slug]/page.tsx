import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { fetchMonthlyEvents2025 } from "@/utils/actions/contents";

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const content = await fetchMonthlyEvents2025(params.slug);

  if (!content) return notFound();

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/events">
          <Button variant="outline" className="dark:border-neutral-600">
            ← 月一覧へ戻る
          </Button>
        </Link>
      </div>

      <h1 className="text-xl md:text-3xl text-center font-bold mb-4 dark:text-white">
        {content.title}
      </h1>

      {content.mainText && <ReactMarkdown>{content.mainText}</ReactMarkdown>}

      <Separator className="my-6 dark:bg-neutral-700" />

      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        主なイベント一覧
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {content.sections.map((section) => (
          <Card
            key={section.id}
            className="dark:bg-neutral-900 dark:border-neutral-700 hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {section.description && (
                <CardDescription className="whitespace-pre-line dark:text-gray-300">
                  <ReactMarkdown>{section.description}</ReactMarkdown>
                </CardDescription>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link href="/events">
          <Button className="mx-auto">イベント一覧へ戻る</Button>
        </Link>
      </div>
    </main>
  );
}
