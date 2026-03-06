"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Music2 } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-6
        bg-slate-100 text-slate-800
        dark:bg-slate-950 dark:text-slate-200
      "
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center space-y-8"
      >
        {/* Music icon */}
        <div className="flex justify-center">
          <Music2 className="h-10 w-10 text-slate-400 dark:text-slate-500" />
        </div>

        {/* 404 */}
        <h1 className="text-6xl font-extrabold tracking-tight">404</h1>

        {/* Minimal text */}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ページが見つかりませんでした。
        </p>

        {/* ===================== 音楽っぽい “波形アニメーション” ===================== */}
        <motion.div
          className="flex justify-center gap-1 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-sky-500/70 dark:bg-sky-400/70"
              animate={{
                height: ["0.5rem", "1.5rem", "0.75rem"],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* ===================== プレイヤー風「戻る」UI ===================== */}
        {/* ===================== プレイヤー風「戻る」UI（ゲージなし） ===================== */}
        <Link href="/lyrixplorer">
          <motion.div
            className="
      mx-auto mt-6 w-full max-w-sm px-4 py-4 
      rounded-2xl cursor-pointer select-none
      border bg-white/70 shadow-sm border-slate-300
      transition
      hover:bg-white/90 hover:shadow-md

      dark:bg-slate-900/60 dark:border-slate-700
      dark:hover:bg-slate-800/70
    "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {/* プレイヤーの曲情報部分を模したタイトル */}
            <div className="flex items-center gap-3">
              {/* 小さな音楽アイコン（アルバムアートの代わり） */}
              <div
                className="
          h-10 w-10 rounded-lg
          bg-gradient-to-br from-sky-500/40 via-purple-500/40 to-pink-500/40
          flex items-center justify-center
          text-slate-700 dark:text-slate-300
          font-semibold text-sm
        "
              >
                LX
              </div>

              {/* タイトル部分 */}
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  LyriXplorer へ戻る
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ホームに移動します
                </p>
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
