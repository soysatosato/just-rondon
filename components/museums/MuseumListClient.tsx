"use client";

import { useState, useEffect } from "react";
import { Museum } from "@prisma/client";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import Pagination from "../home/Pagination";

const MuseumsMapComponent = dynamic(
  () => import("@/components/museums/MuseumsMapComponent"),
  {
    ssr: false,
    loading: () => <Skeleton className=" h-[200px] w-full" />,
  }
);

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function MuseumListClient({
  initialMuseums,
  total,
  currentPage,
  itemsPerPage,
}: {
  initialMuseums: Museum[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const [museums, setMuseums] = useState<Museum[]>(initialMuseums);
  const [search, setSearch] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 800);

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (freeOnly) params.append("freeOnly", "true");

      const res = await fetch(`/api/museums?${params.toString()}`);
      const data = await res.json();
      setMuseums(data);
      setLoading(false);
    }

    if (debouncedSearch || freeOnly) {
      fetchFiltered();
    } else {
      setMuseums(initialMuseums);
    }
  }, [debouncedSearch, freeOnly, initialMuseums]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
        <Input
          placeholder="ミュージアム名で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="freeOnly"
            checked={freeOnly}
            onCheckedChange={(v) => setFreeOnly(Boolean(v))}
          />
          <Label htmlFor="freeOnly">無料のみ表示</Label>
        </div>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : museums.length === 0 ? (
        <p>該当するミュージアムはありません。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {museums.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="rounded-2xl shadow-md overflow-hidden">
                  <Link href={`/museums/${m.slug}`}>
                    {/* <Link href={`/museums/${m.slug}`}> */}
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h2 className="text-lg font-bold">{m.name}</h2>
                        <p className="text-muted-foreground text-sm line-clamp-1">
                          {m.tagline}
                        </p>
                        <p className="text-sm">
                          料金: {m.price === 0 ? "無料" : `£${m.price}`}
                        </p>
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {m.address}
                        </p>
                        <div className="relative w-full h-48 mt-2 rounded-xl overflow-hidden">
                          <Image
                            src={m.image}
                            alt={m.name}
                            fill
                            quality={25}
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <div className="min-h-[80vh] space-y-6">
        <Pagination
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          baseUrl="/museums/all-museums"
        />
        <div className="h-[400px] rounded-xl">
          <MuseumsMapComponent museums={museums} />
        </div>
      </div>
    </div>
  );
}
