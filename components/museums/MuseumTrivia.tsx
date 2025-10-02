"use client";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TriviaListProps {
  trivia: any;
}

export function MuseumTrivia({ trivia }: TriviaListProps) {
  if (!trivia || trivia.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mt-12">
      <div className="flex items-center justify-center gap-2">
        <Star className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">
          知ってるとちょい自慢
        </h2>
        <Star className="w-6 h-6 text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trivia.map((item: any) => (
          <Card
            key={item.id}
            className="hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert">
              <ReactMarkdown>{item.content}</ReactMarkdown>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
