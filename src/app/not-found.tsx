"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * 404页面
 * - 处理未找到的路由
 * - 提供返回首页按钮
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-6xl mb-4"
        >
          🔍
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          404
        </h1>

        <p className="text-gray-600 mb-6">
          页面不存在或已被删除
        </p>

        <div className="space-y-3">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
            >
              🏠 返回首页
            </motion.button>
          </Link>

          <Link href="/admin">
            <button className="w-full py-3 text-gray-500 hover:text-gray-700 transition">
              管理后台
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}