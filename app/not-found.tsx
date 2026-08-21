"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RainOnGlass from "@/components/home/RainOnGlass";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 p-6 text-center">
      {/* 窓の外の夜景。街灯と信号のにじみ */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: [
            "radial-gradient(circle at 18% 82%, rgba(255,183,94,0.28), transparent 42%)",
            "radial-gradient(circle at 74% 88%, rgba(255,120,90,0.18), transparent 38%)",
            "radial-gradient(circle at 50% 20%, rgba(96,140,200,0.22), transparent 55%)",
          ].join(","),
        }}
      />

      {/* ガラスに付いた雨と、稀に光る雷 */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <RainOnGlass />
      </div>

      <div className="relative z-20 flex flex-col items-center">
        <motion.h1
          className="mb-4 text-8xl font-extrabold tracking-tight text-slate-100 drop-shadow-[0_2px_18px_rgba(120,160,220,0.35)]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          404
        </motion.h1>

        <motion.h2
          className="mb-6 text-3xl font-semibold text-slate-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          ページが見つかりません
        </motion.h2>

        <motion.p
          className="mb-8 max-w-xl text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          お探しのページは存在しないか、ロンドンの雨の中に隠れてしまったようです。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
          >
            ホームに戻る
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
