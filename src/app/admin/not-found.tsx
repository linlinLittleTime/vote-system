"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * 管理后台404页面
 */
export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="text-6xl mb-4">🔐</div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          页面不存在
        </h1>

        <p className="text-gray-600 mb-6">
          您访问的管理页面不存在或已被删除
        </p>

        <Link href="/admin">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl"
          >
            返回管理首页
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}