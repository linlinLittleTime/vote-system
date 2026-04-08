"use client";

import { motion } from "framer-motion";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const showPages = 5;
  let start = Math.max(1, page - Math.floor(showPages / 2));
  let end = Math.min(totalPages, start + showPages - 1);

  if (end - start < showPages - 1) {
    start = Math.max(1, end - showPages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {/* 上一页 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        ←
      </motion.button>

      {/* 第一页 */}
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition"
          >
            1
          </button>
          {start > 2 && <span className="text-gray-500">...</span>}
        </>
      )}

      {/* 页码 */}
      {pages.map((p) => (
        <motion.button
          key={p}
          whileHover={{ scale: p === page ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-lg transition ${
            p === page
              ? "bg-purple-600 text-white"
              : "bg-slate-700 text-gray-300 hover:bg-slate-600"
          }`}
        >
          {p}
        </motion.button>
      ))}

      {/* 最后页 */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-500">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* 下一页 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        →
      </motion.button>
    </div>
  );
}