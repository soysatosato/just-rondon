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

export function OpeningHoursTable({ openingHours }: OpeningHoursProps) {
  return (
    <Card className="max-w-xa mx-auto">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <th className="p-0.5 m-0.5 text-center font-medium text-muted-foreground">
                Day
              </th>
              <th className="p-0.5 m-0.5 text-center font-medium text-muted-foreground">
                Hours
              </th>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {openingHours.map(({ dayOfWeek, openTime, closeTime }) => (
              <TableRow key={dayOfWeek}>
                <TableCell className="py-0.5">{dayOfWeek}</TableCell>
                <TableCell className="py-0.5">
                  {openTime && closeTime
                    ? `${openTime} - ${closeTime}`
                    : "Closed"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
