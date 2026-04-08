"use client";

import { motion } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function Header() {
  const { logout } = useAdminAuth();

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-white font-bold text-lg">投票系统管理后台</h2>
        <p className="text-gray-400 text-xs">管理活动和查看统计数据</p>
      </div>

      <div className="flex items-center gap-4">
        {/* 状态指示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">已登录</span>
        </motion.div>

        {/* 退出按钮 */}
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 hover:text-white transition"
        >
          <span>🔓</span>
          <span className="text-sm">退出</span>
        </motion.button>
      </div>
    </header>
  );
}