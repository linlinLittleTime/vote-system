"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { path: "/admin", label: "活动管理", icon: "📋" },
  { path: "/admin/dashboard", label: "统计看板", icon: "📊" },
  { path: "/admin/export", label: "数据导出", icon: "📤" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800 h-full flex flex-col border-r border-slate-700"
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
          <span className="text-lg">🗳️</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-shrink-0"
            >
              <h1 className="text-white font-bold text-sm">投票管理</h1>
              <p className="text-gray-400 text-xs">后台系统</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="p-2 text-gray-400 hover:text-white transition flex items-center justify-center"
      >
        {collapsed ? "→" : "←"}
      </button>

      {/* Menu */}
      <nav className="flex-1 p-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:bg-slate-700 hover:text-white"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <span className="text-lg">🏠</span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                返回首页
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </motion.aside>
  );
}