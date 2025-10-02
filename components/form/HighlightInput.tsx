"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

type Props = {
  name: string;
  defaultValue?: string[];
};

export default function HighlightInput({ name, defaultValue = [] }: Props) {
  const [highlights, setHighlights] = useState<string[]>(defaultValue);
  const [input, setInput] = useState("");

  const jsonString = JSON.stringify(highlights);

  const addHighlight = () => {
    const trimmed = input.trim();
    if (!trimmed || highlights.includes(trimmed)) return;
    setHighlights([...highlights, trimmed]);
    setInput("");
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Highlights</label>

      {/* これ1つだけ hidden input に配列を JSON 文字列で入れる */}
      <input type="hidden" name={name} value={jsonString} />

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例: 世界的に有名な展示"
        />
        <Button type="button" onClick={addHighlight}>
          追加
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {highlights.map((h, i) => (
          <div
            key={i}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
          >
            {h}
            <button type="button" onClick={() => removeHighlight(i)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
