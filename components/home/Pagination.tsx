"use client";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  baseUrl: string;
  maxPageButtons?: number; // 一度に表示するページ番号の最大数
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  baseUrl,
  maxPageButtons = 3,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 表示するページ番号を計算
  const pageNumbers = [];
  let startPage = Math.max(currentPage - Math.floor(maxPageButtons / 2), 1);
  let endPage = startPage + maxPageButtons - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxPageButtons + 1, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex gap-2 mt-4 items-center flex-wrap">
      {/* 前へボタン */}
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}/?page=${currentPage - 1}`}
          className="px-3 py-1 border rounded border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          前へ
        </Link>
      )}

      {/* ページ番号 */}
      {pageNumbers.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}/?page=${page}`}
          className={`px-3 py-1 border rounded transition
            ${
              page === currentPage
                ? "bg-blue-500 text-white border-blue-500 dark:bg-blue-600 dark:border-blue-600"
                : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
          {page}
        </Link>
      ))}

      {/* 次へボタン */}
      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}/?page=${currentPage + 1}`}
          className="px-3 py-1 border rounded border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          次へ
        </Link>
      )}
    </div>
  );
}
