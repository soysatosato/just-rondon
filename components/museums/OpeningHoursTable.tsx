import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OpeningHour = {
  dayOfWeek: string;
  openTime: string | null;
  closeTime: string | null;
};

type OpeningHoursProps = {
  openingHours: OpeningHour[];
};

/** DBには英語の曜日名が入っている。表示だけ日本語にする。 */
const DAY_JA: Record<string, string> = {
  monday: "月",
  tuesday: "火",
  wednesday: "水",
  thursday: "木",
  friday: "金",
  saturday: "土",
  sunday: "日",
};

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function OpeningHoursTable({ openingHours }: OpeningHoursProps) {
  // DBの行順は保証されないので、月曜始まりに並べ替えてから表示する。
  const sorted = [...openingHours].sort(
    (a, b) =>
      DAY_ORDER.indexOf(a.dayOfWeek.trim().toLowerCase()) -
      DAY_ORDER.indexOf(b.dayOfWeek.trim().toLowerCase()),
  );

  const todayName = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  return (
    <Card className="mx-auto border-0 shadow-none">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <th className="p-1 text-center font-medium text-muted-foreground">
                曜日
              </th>
              <th className="p-1 text-center font-medium text-muted-foreground">
                開館時間
              </th>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {sorted.map(({ dayOfWeek, openTime, closeTime }) => {
              const key = dayOfWeek.trim().toLowerCase();
              const isToday = key === todayName;
              return (
                <TableRow
                  key={dayOfWeek}
                  className={isToday ? "font-semibold text-foreground" : ""}
                >
                  <TableCell className="py-1">
                    {DAY_JA[key] ?? dayOfWeek}
                  </TableCell>
                  <TableCell className="py-1">
                    {openTime && closeTime
                      ? `${openTime} – ${closeTime}`
                      : "休館"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
