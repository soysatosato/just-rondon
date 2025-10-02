"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Star } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MuseumBlurbList({ museums }: { museums: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {museums.map((m) => (
        <MuseumCard key={m.id} m={m} />
      ))}
    </div>
  );
}

function MuseumCard({ m }: { m: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border border-border bg-card text-card-foreground">
        {/* 右上 Badge */}
        <div className="absolute top-2 right-2 z-10">
          {m.price === 0 ? (
            <Badge className="bg-emerald-600 text-white">Free</Badge>
          ) : (
            <Badge
              variant="secondary"
              className="bg-yellow-400 text-card-foreground dark:text-card-foreground"
            >
              £{m.price}〜
            </Badge>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-muted">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate">{m.name}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate flex-1">{m.address}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm leading-6 line-clamp-3">
            {m.blurb}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {m.highlights.map((g: string) => (
              <Badge
                key={g}
                variant="secondary"
                className="rounded-xl bg-accent text-accent-foreground"
              >
                <Star className="mr-1 h-3.5 w-3.5" /> {g}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            asChild
            className="rounded-2xl bg-primary text-primary-foreground"
          >
            <Link href={`/museums/${m.slug}`} target="_blank" rel="noreferrer">
              詳細を見る
            </Link>
          </Button>
          <Button
            variant="secondary"
            className="rounded-2xl bg-secondary text-secondary-foreground"
            asChild
          >
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                m.name + " " + m.website + " London"
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              地図で見る
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
