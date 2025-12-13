"use client";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Image from "next/image";
import { HiFire } from "react-icons/hi";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface Props {
  slug: string;
  rooms: Record<string, any[]>;
}

export default function ArtworksAccordion({ slug, rooms }: Props) {
  return (
    <>
      {Object.entries(rooms).map(([roomName, roomArtworks]) => (
        <section key={roomName} className="mb-12">
          <h2 className="text-lg md:text-2xl font-semibold mb-4">{roomName}</h2>
          <Accordion type="single" collapsible>
            {roomArtworks.map((art: any) => (
              <AccordionItem key={art.id} value={art.id}>
                <AccordionTrigger className="flex items-center justify-between">
                  <div>
                    <span className="flex-1">
                      {art.title} {art.engTitle ? `(${art.engTitle})` : ""}
                    </span>
                    <br />
                    <span className="flex-1 italic text-muted-foreground">
                      {art.artist || "作者不明"}
                    </span>
                  </div>
                  {art.mustSee && (
                    <HiFire
                      className="text-red-500 w-6 h-6 flex-shrink-0"
                      title="Must See"
                    />
                  )}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col md:flex-row gap-4 p-4">
                  <div className="relative">
                    <Link
                      href={`/museums/${slug}/artworks/${art.id}`}
                      className="block rounded-md overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <img
                        src={art.image || "/placeholder.jpg"}
                        alt={art.title}
                        width={250}
                        height={250}
                        className="rounded-md object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      {/* ボタンをオーバーレイ */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 rounded-md">
                        <span
                          className="px-4 py-2 text-sm font-semibold rounded 
               bg-white text-gray-900 
               dark:bg-gray-800 dark:text-gray-100
               shadow"
                        >
                          詳細を見る
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="flex flex-col gap-2">
                    {art.highlights?.length > 0 && (
                      <ul className="list-disc ml-2 text-xs text-muted-foreground">
                        {art.highlights.map((h: any, i: number) => (
                          <li key={i} className="mt-1">
                            <ReactMarkdown>{h}</ReactMarkdown>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </>
  );
}
