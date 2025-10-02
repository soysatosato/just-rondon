"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecommendLevelSelectProps {
  name: string;
  defaultValue?: string;
}

export default function RecommendLevelSelect({
  name,
  defaultValue = "0",
}: RecommendLevelSelectProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <>
      <label htmlFor={name} className="block mb-1 font-medium">
        Recommendation Level
      </label>
      <Select name={name} onValueChange={setValue} defaultValue={defaultValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select recommendation level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">☆☆☆</SelectItem>
          <SelectItem value="1">★☆☆</SelectItem>
          <SelectItem value="2">★★☆</SelectItem>
          <SelectItem value="3">★★★</SelectItem>
        </SelectContent>
      </Select>

      <input type="hidden" name={name} value={value} />
    </>
  );
}
