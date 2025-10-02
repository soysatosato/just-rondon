// app/contact/page.tsx
"use client";

import { sendContact } from "@/utils/actions/contact";
import { useState } from "react";
import { useFormState } from "react-dom";
import { AiOutlineMail } from "react-icons/ai";

export default function ContactForm() {
  const [state, formAction] = useFormState(sendContact, {
    success: false,
    errors: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form); // FormData を作る

    setIsSubmitting(true);
    await formAction(formData); // FormData を渡す
    setIsSubmitting(false);
  };

  if (state.success) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-400 text-green-800 p-4 rounded-lg shadow-md overflow-hidden">
        <AiOutlineMail className="w-6 h-6 animate-slideOut" />
        <span className="text-sm md:text-base">
          確認メールを送信しました。メール内のリンクをクリックしてお問い合わせを完了してください。
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 text-gray-800 dark:text-gray-200">
          お名前
        </label>
        <input
          type="text"
          name="name"
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded-md placeholder-gray-400 dark:placeholder-gray-500"
        />
        {state.errors?.name && (
          <p className="text-red-600 text-sm">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-gray-800 dark:text-gray-200">
          メールアドレス
        </label>
        <input
          type="email"
          name="email"
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded-md placeholder-gray-400 dark:placeholder-gray-500"
        />
        {state.errors?.email && (
          <p className="text-red-600 text-sm">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-gray-800 dark:text-gray-200">
          お問い合わせ内容
        </label>
        <textarea
          name="message"
          rows={5}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded-md placeholder-gray-400 dark:placeholder-gray-500"
        ></textarea>
        {state.errors?.message && (
          <p className="text-red-600 text-sm">{state.errors.message[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2 rounded-md text-white ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSubmitting ? "送信中..." : "送信"}
      </button>
    </form>
  );
}
