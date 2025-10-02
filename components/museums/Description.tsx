"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Title from "./Title";

export default function Description({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const words = description.split(" ");
  const isLong = words.length > 100;

  const toggleDescription = () => {
    setIsExpanded((prev) => !prev);
  };

  const deisplayedDescription =
    isLong && !isExpanded
      ? words.splice(0, 100).join(" ") + "..."
      : description;

  return (
    <>
      <Title text="Description" />
      <p className="text-muted-foreground font-light leading-loose">
        {deisplayedDescription}
      </p>
      {isLong && (
        <Button variant="link" className="pl-0" onClick={toggleDescription}>
          {isExpanded ? "Show less" : "Show all"}
        </Button>
      )}
    </>
  );
}
