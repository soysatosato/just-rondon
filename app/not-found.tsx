"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import RainCanvas from "@/components/home/RainParticles";

export default function NotFoundPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white text-center p-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-10 bg-[url('/placeholder-art.jpg')] bg-center bg-cover"></div>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <RainCanvas />
      </div>
      <motion.h1
        className="text-8xl font-extrabold mb-4 text-gray-800"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        404
      </motion.h1>

      <motion.h2
        className="text-3xl font-semibold mb-6 text-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        ページが見つかりません
      </motion.h2>

      <motion.p
        className="text-gray-600 mb-8 max-w-xl"
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
          className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-800 transition"
        >
          ホームに戻る
        </Link>
      </motion.div>
    </div>
  );
}
