"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Hour = {
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

type DbHour = {
  id: string;
  museumId: string;
  dayOfWeek: string;
  openTime?: string | null;
  closeTime?: string | null;
};

type Props = {
  label: string;
  name: string; // フォーム送信時のname属性
  defaultValues?: DbHour[]; // DBから渡される既存値
};

export function OpeningHoursInput({ label, name, defaultValues }: Props) {
  const initialHours = [
    { day: "Sunday", open: "10:00", close: "17:00", closed: false },
    { day: "Monday", open: "10:00", close: "17:00", closed: false },
    { day: "Tuesday", open: "10:00", close: "17:00", closed: false },
    { day: "Wednesday", open: "10:00", close: "17:00", closed: false },
    { day: "Thursday", open: "10:00", close: "17:00", closed: false },
    { day: "Friday", open: "10:00", close: "20:30", closed: false },
    { day: "Saturday", open: "10:00", close: "17:00", closed: false },
  ];
  console.log(defaultValues);
  const mapDbToHour = (dbHour: DbHour): Hour => ({
    day: dbHour.dayOfWeek,
    open: dbHour.openTime ?? "",
    close: dbHour.closeTime ?? "",
    closed: !dbHour.openTime && !dbHour.closeTime,
  });
  const mergedHours = initialHours.map((dayHour) => {
    const dbHour = defaultValues?.find((d) => d.dayOfWeek === dayHour.day);
    return dbHour ? mapDbToHour(dbHour) : dayHour;
  });

  const [hours, setHours] = useState<Hour[]>(mergedHours);

  // const toggleClosed = (index: number) => {
  //   setHours((prev) => {
  //     const newHours = [...prev];
  //     newHours[index].closed = !newHours[index].closed;
  //     return newHours;
  //   });
  // };

  const setTime = (index: number, field: "open" | "close", value: string) => {
    setHours((prev) => {
      const newHours = [...prev];
      newHours[index][field] = value;
      return newHours;
    });
  };

  const jsonValue = JSON.stringify(
    hours.map((hour) => ({
      day: hour.day,
      open: hour.closed ? null : hour.open,
      close: hour.closed ? null : hour.close,
      closed: hour.closed,
    }))
  );

  return (
    <fieldset className="border rounded-md p-4">
      <legend className="mb-4 text-lg font-semibold">{label}</legend>

      {hours.map((hour, i) => (
        <div key={hour.day} className="flex flex-wrap items-center gap-4 mb-3">
          <div className="w-24 font-medium">{hour.day}</div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`closed-${hour.day}`}
              checked={hour.closed}
              onCheckedChange={(checked) => {
                setHours((prev) => {
                  const newHours = [...prev];
                  newHours[i].closed = Boolean(checked);
                  if (newHours[i].closed) {
                    newHours[i].open = "";
                    newHours[i].close = "";
                  } else {
                    newHours[i].open = "10:00"; // 初期値を戻す場合
                    newHours[i].close = "17:00";
                  }
                  return newHours;
                });
              }}
            />
            <Label htmlFor={`closed-${hour.day}`}>Closed</Label>
          </div>

          <div className="flex items-center space-x-1">
            <Input
              id={`open-${hour.day}`}
              type="time"
              value={hour.open ?? "10:00"}
              disabled={hour.closed}
              onChange={(e) => setTime(i, "open", e.target.value)}
              className="w-24"
            />
            <span>〜</span>
            <Input
              id={`close-${hour.day}`}
              type="time"
              value={hour.close ?? "10:00"}
              disabled={hour.closed}
              onChange={(e) => setTime(i, "close", e.target.value)}
              className="w-24"
            />
          </div>
        </div>
      ))}

      {/* JSON文字列でまとめて送信 */}
      <input type="hidden" name={name} value={jsonValue} />
    </fieldset>
  );
}
