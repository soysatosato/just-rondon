import ReactMarkdown from "react-markdown";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

type Props = {
  text: string;
  maxLines?: number; // ← 任意指定、デフォルト3行
};

function ExpandableText({ text, maxLines = 3 }: Props) {
  return (
    <Collapsible className="space-y-2 group">
      {/* トリガー部分 */}

      {/* 最大行数：maxLines に応じて class を分岐 */}
      <div
        className={`
          prose prose-sm max-w-none text-muted-foreground transition-all
          ${maxLines === 1 ? "line-clamp-1" : ""}
          ${maxLines === 2 ? "line-clamp-2" : ""}
          ${maxLines === 3 ? "line-clamp-3" : ""}
          ${maxLines === 4 ? "line-clamp-4" : ""}
          ${maxLines === 5 ? "line-clamp-5" : ""}
          group-data-[state=open]:line-clamp-none
          `}
      >
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>

      <CollapsibleContent />
      <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer text-purple-700 dark:text-purple-300 text-sm font-semibold hover:underline">
        <span className="group-data-[state=open]:hidden block">続きを読む</span>
        <span className="group-data-[state=closed]:hidden hidden">閉じる</span>
        <ChevronDown
          className="w-4 h-4 transition-transform
              group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
    </Collapsible>
  );
}

export default ExpandableText;
