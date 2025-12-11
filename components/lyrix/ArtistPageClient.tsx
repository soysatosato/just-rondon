"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function ArtistPageClient({ artist, data }: any) {
  const router = useRouter();
  const params = useSearchParams();

  const sortBy = params.get("sortBy") || "album";
  const sortOrder = params.get("sortOrder") || "desc"; // 最新順をデフォルトに

  const updateQuery = (key: any, value: any) => {
    const qs = new URLSearchParams(params.toString());
    qs.set(key, value);
    router.push(`?${qs.toString()}`);
  };

  const isAlbumMode = sortBy === "album";

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Artist Header */}
      <div className="flex items-center gap-6 mb-10">
        {artist?.imageUrl && (
          <img
            src={artist.imageUrl}
            className="w-32 h-32 rounded-full object-cover shadow-lg"
            alt={artist.name}
          />
        )}

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {artist.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {artist.engName}
          </p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-4 mb-6 items-center justify-end">
        <span className="">表示順： </span>
        <Select value={sortBy} onValueChange={(v) => updateQuery("sortBy", v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="album">アルバム順</SelectItem>
            <SelectItem value="name">曲名順</SelectItem>
            <SelectItem value="year">発売年月順</SelectItem>
            <SelectItem value="views">閲覧数順</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={sortOrder}
          onValueChange={(v) => updateQuery("sortOrder", v)}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">昇順</SelectItem>
            <SelectItem value="desc">逆順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Album Mode */}
      {isAlbumMode ? (
        <Accordion type="multiple" className="w-full space-y-4">
          {data.map((album: any) => (
            <AccordionItem
              key={album.albumName}
              value={album.albumName}
              className="border rounded-lg shadow-sm"
            >
              {/* Album Header */}
              <AccordionTrigger className="text-xl font-semibold px-4 py-3 hover:no-underline">
                <span className="flex flex-col text-left">
                  {album.albumName}
                  {album.date && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Released: {album.date}
                    </span>
                  )}
                </span>
              </AccordionTrigger>

              {/* Album Songs */}
              <AccordionContent className="pb-4">
                <div className="space-y-2 px-2">
                  {album.tracks.map((song: any, index: number) => (
                    <Link
                      key={song.id}
                      href={`/lyrixplorer/songs/${song.id}`}
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Track number */}
                        <span className="text-gray-500 dark:text-gray-400 font-semibold w-6 text-center">
                          {index + 1}
                        </span>

                        {/* YouTube Thumbnail */}
                        {song.youtubeId && (
                          <div className="w-16 h-10 relative rounded overflow-hidden shadow">
                            <Image
                              src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                              alt={song.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Song Info */}
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {song.name}
                          </p>

                          <p className="text-gray-700 dark:text-gray-300 text-xs">
                            <span className="font-semibold">Artist:</span>{" "}
                            {artist.engName}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            歌詞・和訳はこちら
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        /* Normal List Mode */
        <div className="space-y-2">
          {data.map((song: any, index: number) => (
            <Link
              key={song.id}
              href={`/lyrixplorer/songs/${song.id}`}
              className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <span className="text-gray-500 dark:text-gray-400 font-semibold w-6 text-center">
                  {index + 1}
                </span>

                {song.youtubeId && (
                  <div className="w-16 h-10 relative rounded overflow-hidden shadow">
                    <Image
                      src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                      alt={song.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {song.name}
                  </p>

                  {sortBy === "year" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {song.year}.{String(song.month).padStart(2, "0")}
                    </p>
                  )}

                  {/* {sortBy === "views" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {song.views} views
                    </p>
                  )} */}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
