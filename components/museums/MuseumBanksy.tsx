"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaSprayCan } from "react-icons/fa";
import InstagramEmbed from "../card/InstagramEmbed";
import Image from "next/image";

export default function MuseumBanksy() {
  const [artworks, setArtworks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/banksy-artworks`);
        setArtworks(res.data);
      } catch (err) {
        console.error("Failed to fetch Banksy artworks:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="relative bg-black text-white min-h-screen overflow-x-hidden">
      {/* 背景グラフィティ・パララックス */}

      <div className="container mx-auto p-6 space-y-12 relative z-10">
        <header className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -40, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.7 }}
            className="text-6xl font-extrabold tracking-widest uppercase text-red-500 drop-shadow-lg"
          >
            Banksy in London
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg max-w-3xl mx-auto text-gray-300"
          >
            ロンドンはストリートアートのメッカ。英国出身のバンクシーは街のあちこちに作品を残し、社会風刺やユーモアを巧みに描いています。
            住宅街や路地裏にも点在する彼のアートは、日常の風景をキャンバスに変え、日常の景色をちょっと特別にしてくれます。
            ここでは、ロンドンで実際に目にすることができる代表的なバンクシー作品をまとめました。
          </motion.p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((art, i) => (
            <Dialog key={art.id}>
              <DialogTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.3, duration: 0.6 }}
                >
                  <Card className="cursor-pointer bg-gray-900 border border-gray-700 hover:scale-105 transform transition-transform shadow-2xl relative">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <FaSprayCan className="text-red-500" /> {art.engName}
                      </CardTitle>
                      <span className="ml-7 text-xs text-gray-500 italic">
                        {art.name}
                      </span>
                      <p className="text-sm text-gray-400">{art.address}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="relative w-full h-64 overflow-hidden rounded-lg border-2 border-gray-700">
                        {art.fromIG ? (
                          <InstagramEmbed url={art.url} isDialogOpen />
                        ) : (
                          <Image
                            src={art.url}
                            alt={art.engName}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-gray-900 text-white rounded-lg p-6 border-2 border-red-500 max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {art.engName}
                  </DialogTitle>
                  <span className="text-xs text-gray-500 italic">
                    {art.name}
                  </span>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative w-full h-72 border-2 border-gray-700 rounded-lg overflow-hidden">
                    {art.fromIG ? (
                      <InstagramEmbed url={art.url} isDialogOpen />
                    ) : (
                      <Image
                        src={art.url}
                        alt={art.engName}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="text-gray-300">{art.description}</p>
                  <p className="text-sm text-gray-400">場所: {art.address}</p>
                  <div className="flex flex-nowrap gap-4 mt-4">
                    <Button asChild variant="secondary" size="sm">
                      <Link
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          art.address + " London"
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        地図で見る
                      </Link>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </section>
      </div>
    </div>
  );
}
