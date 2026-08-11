import { Badge } from "@/components/ui/badge";
import { CalendarDays, Ticket } from "lucide-react";

type Exhibition = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date | string;
  endDate: Date | string;
  admission: number | null;
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MuseumExhibitions({
  exhibitions = [],
}: {
  exhibitions?: Exhibition[];
}) {
  if (exhibitions.length === 0) return null;

  // 会期の終わった展覧会は出さない。DBの更新が止まっても
  // 「開催中」と誤って表示し続けることが無いようにする。
  const now = new Date();
  const current = exhibitions.filter((e) => new Date(e.endDate) >= now);
  if (current.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-rose-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Exhibitions
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          開催中の企画展
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          会期や料金は変更されることがあります。公式サイトで最新の情報をご確認ください。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {current.map((exhibition) => (
          <div
            key={exhibition.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold leading-snug tracking-tight">
                {exhibition.name}
              </h3>
              <Badge className="shrink-0 bg-rose-600 text-white hover:bg-rose-600">
                開催中
              </Badge>
            </div>

            {exhibition.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {exhibition.description}
              </p>
            )}

            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {formatDate(exhibition.startDate)} 〜{" "}
                  {formatDate(exhibition.endDate)}
                </span>
              </p>
              {exhibition.admission !== null && (
                <p className="flex items-center gap-2">
                  <Ticket className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {exhibition.admission === 0
                      ? "無料"
                      : `£${exhibition.admission}`}
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
