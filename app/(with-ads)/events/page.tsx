import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchEvents2025 } from "@/utils/actions/contents";

export default async function Events2025Page() {
  const contents = await fetchEvents2025();

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">
        ロンドンイベントカレンダー 2025
      </h1>

      <p className="text-center text-muted-foreground mb-10 dark:text-gray-400">
        四季を巡る、ロンドンの一年。気になる月を選んでください。
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contents.map((content) => (
          <Card
            key={content.id}
            className="hover:shadow-lg transition-shadow dark:bg-neutral-900 dark:border-neutral-700"
          >
            <CardHeader>
              <CardTitle className="text-xl font-semibold dark:text-white">
                {content.title}
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                {content.summary}
              </CardDescription>
            </CardHeader>

            <div className="p-4">
              <Link href={`/events/${content.slug}`} passHref>
                <Button className="w-full">詳細を見る</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
