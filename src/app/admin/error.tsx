"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 管理后台错误边界
 */
export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("管理后台错误:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="text-6xl mb-4">💥</div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          操作失败
        </h1>

        <p className="text-gray-600 mb-6">
          {error.message || "发生未知错误，请刷新页面重试"}
        </p>

        <div className="space-y-3">
          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl"
          >
            🔄 重试
          </motion.button>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 text-gray-500 hover:text-gray-700"
          >
            刷新页面
          </button>
        </div>
      </motion.div>
    </div>
  );
}