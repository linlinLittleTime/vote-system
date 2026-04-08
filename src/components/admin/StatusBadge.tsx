"use client";

import { motion } from "framer-motion";

interface StatusBadgeProps {
  status: "draft" | "active" | "closed";
}

const statusConfig = {
  draft: {
    label: "草稿",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    icon: "📝",
  },
  active: {
    label: "进行中",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: "🚀",
  },
  closed: {
    label: "已结束",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: "🔒",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${config.color}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </motion.div>
  );
}