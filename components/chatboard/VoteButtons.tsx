"use client";
import { vote } from "@/utils/actions/chatboard";
import { useState } from "react";
import { AiOutlineLike } from "react-icons/ai";

export default function VoteButtons({
  id,
  target,
  initialVotes,
  size = "md",
}: {
  id: string;
  target: "post" | "comment";
  initialVotes: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: {
      button: "p-0.5", // 小さい余白
      icon: 12, // アイコンサイズ(px)
      text: "text-xs",
    },
    md: {
      button: "p-1",
      icon: 16,
      text: "text-sm",
    },
    lg: {
      button: "p-1.5",
      icon: 20,
      text: "text-base",
    },
  }[size];

  const [votes, setVotes] = useState(initialVotes);
  const [disabled, setDisabled] = useState(false);

  const handleVote = async (type: "up" | "down") => {
    if (disabled) return;
    setDisabled(true); // 押したら無効化

    const updated = await vote({ id, type, target });
    if (updated) setVotes(updated.votes);
  };

  return (
    <div
      className={`flex items-center space-x-1 text-gray-500 dark:text-gray-400`}
    >
      <button
        onClick={() => handleVote("up")}
        disabled={disabled}
        className={`${sizeClasses.button} rounded transition ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-red-100 dark:hover:bg-red-700"
        }`}
      >
        <AiOutlineLike size={sizeClasses.icon} />
      </button>

      <span className={`${sizeClasses.text} font-medium`}>{votes}</span>

      <button
        onClick={() => handleVote("down")}
        disabled={disabled}
        className={`${sizeClasses.button} rounded transition ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-blue-100 dark:hover:bg-blue-700"
        }`}
      >
        <AiOutlineLike size={sizeClasses.icon} className="rotate-180" />
      </button>
    </div>
  );
}
