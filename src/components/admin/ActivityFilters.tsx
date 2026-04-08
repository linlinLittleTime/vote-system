"use client";

import { motion } from "framer-motion";

interface ActivityFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function ActivityFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: ActivityFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 mb-4"
    >
      {/* 搜索框 */}
      <div className="flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索活动标题..."
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
        />
      </div>

      {/* 状态筛选 */}
      <div className="flex-shrink-0">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-purple-500 outline-none transition cursor-pointer"
        >
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="active">进行中</option>
          <option value="closed">已结束</option>
        </select>
      </div>
    </motion.div>
  );
}