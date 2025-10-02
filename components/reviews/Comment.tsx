"use client";

import { useState } from "react";
import { Button } from "../ui/button";

export default function Comment({ comment }: { comment: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = () => {
    setIsExpanded((prev) => !prev);
  };
  const isLong = comment.length > 130;
  const deisplayedComment =
    isLong && !isExpanded ? comment.slice(0, 130) + "..." : comment;

  return (
    <div>
      <p className="text-sm">{deisplayedComment}</p>
      {isLong && (
        <Button
          variant="link"
          className="pl-0 text-muted-foreground"
          onClick={toggle}
        >
          {isExpanded ? "Show less" : "Show all"}
        </Button>
      )}
    </div>
  );
}
