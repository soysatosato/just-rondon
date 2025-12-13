"use client";

import BreadCrumbs from "@/components/home/BreadCrumbs";
import { postSchema } from "@/utils/schemas";
import { useState } from "react";
import { FaPencilAlt } from "react-icons/fa";

export default function CreatePostForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return; // 連打防止
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const parsed = postSchema.safeParse(data);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldErrors: Record<string, string> = {};
      Object.entries(flat.fieldErrors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          fieldErrors[key] = messages[0];
        }
      });
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/chatboard/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.redirected) window.location.href = res.url;
  };

  return (
    <>
      <BreadCrumbs name="掲示板一覧" link="chatboard" name2="作成" />
      <section className="max-w-3xl mx-auto p-6">
        <div className="flex items-center mb-6 space-x-3">
          <FaPencilAlt className="text-2xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            新しいスレッドを作成
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          ロンドン生活の情報、仕事、出会い、雑談などなんでも自由に書き込めます。
          個人を特定できる情報や誹謗中傷は避けてください。
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 space-y-6"
        >
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ハンドルネーム
            </label>
            <input
              name="author"
              type="text"
              placeholder="例: ロンドン太郎"
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.author && (
              <span className="text-red-500 text-xs mt-1">{errors.author}</span>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              タイトル
            </label>
            <input
              name="title"
              type="text"
              placeholder="例: おすすめのカフェ情報"
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.title && (
              <span className="text-red-500 text-xs mt-1">{errors.title}</span>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              本文
            </label>
            <textarea
              name="content"
              rows={6}
              placeholder="ここに投稿内容を入力"
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.content && (
              <span className="text-red-500 text-xs mt-1">
                {errors.content}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              削除用パスワード
            </label>
            <input
              name="deletePsswrd"
              type="text"
              placeholder="任意の削除用パスワード(4文字)"
              defaultValue="0000"
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.deletePsswrd && (
              <span className="text-red-500 text-xs mt-1">
                {errors.deletePsswrd}
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 px-4 py-2 rounded transition-colors
    hover:bg-blue-700 dark:hover:bg-blue-600
    ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              投稿する
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
