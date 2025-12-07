"use client";
import { motion } from "framer-motion";

export default function TitleLogo() {
  return (
    <h1 className="text-center text-4xl md:text-5xl font-extrabold text-red-400 drop-shadow-lg animate-fadeIn">
      ロンド
      <motion.span
        className="inline-block"
        animate={{ rotate: [0, -10, 10, -10, 0] }} // 左右に揺れる
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        ん！
      </motion.span>
    </h1>
  );
}
