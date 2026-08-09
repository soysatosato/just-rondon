"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { markTweetPosted } from "@/utils/actions/tweets";

type Props = {
  id: string;
  body: string;
  category: string;
  createdAt: string;
};

export default function TweetDraftCard({ id, body, category, createdAt }: Props) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleCopy() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleMarkPosted() {
    startTransition(() => markTweetPosted(id));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <Badge variant="secondary">{category}</Badge>
        <span className="text-xs text-muted-foreground">{createdAt}</span>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {body.length} / 140
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm" onClick={handleCopy}>
          {copied ? "コピーしました" : "コピー"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={handleMarkPosted}
        >
          投稿済みにする
        </Button>
      </CardFooter>
    </Card>
  );
}
