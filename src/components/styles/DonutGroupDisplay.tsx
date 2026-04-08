"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { StyleDisplayProps } from "./index";

// 圆环颜色配置
const ringColors = [
  { stroke: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", glow: "rgba(59, 130, 246, 0.5)" },
  { stroke: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)", glow: "rgba(139, 92, 246, 0.5)" },
  { stroke: "#ec4899", bg: "rgba(236, 72, 153, 0.1)", glow: "rgba(236, 72, 153, 0.5)" },
  { stroke: "#10b981", bg: "rgba(16, 185, 129, 0.1)", glow: "rgba(16, 185, 129, 0.5)" },
  { stroke: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", glow: "rgba(245, 158, 11, 0.5)" },
  { stroke: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", glow: "rgba(239, 68, 68, 0.5)" },
  { stroke: "#06b6d4", bg: "rgba(6, 182, 212, 0.1)", glow: "rgba(6, 182, 212, 0.5)" },
  { stroke: "#f97316", bg: "rgba(249, 115, 22, 0.1)", glow: "rgba(249, 115, 22, 0.5)" },
];

export default function DonutGroupDisplay({
  title,
  options,
  totalVotes,
}: StyleDisplayProps) {
  // 按票数排序，最多显示6个
  const displayOptions = [...options]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 6);

  const circumference = 2 * Math.PI * 42; // r=42

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 p-4 sm:p-8 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/5 to-transparent rounded-full" />
      </div>

      {/* 标题区 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          ⭕ {title}
        </h1>
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20">
          <div className="text-3xl font-bold text-white">{totalVotes}</div>
          <div className="text-white/60 text-sm">总票数</div>
        </div>
      </motion.div>

      {/* 圆环网格 */}
      <div className="max-w-5xl mx-auto relative z-10">
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {displayOptions.map((option, index) => {
              const color = ringColors[index % ringColors.length];
              const strokeDasharray = `${(option.percentage / 100) * circumference} ${circumference}`;
              const delay = index * 0.1;

              return (
                <motion.div
                  key={option.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay,
                  }}
                  className="flex flex-col items-center"
                >
                  {/* SVG 圆环 */}
                  <div className="relative">
                    <svg
                      width="140"
                      height="140"
                      className="transform -rotate-90"
                    >
                      {/* 发光效果 */}
                      <defs>
                        <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* 背景圆环 */}
                      <circle
                        cx="70"
                        cy="70"
                        r="42"
                        fill="none"
                        stroke={color.bg}
                        strokeWidth="12"
                      />

                      {/* 进度圆环 */}
                      <motion.circle
                        cx="70"
                        cy="70"
                        r="42"
                        fill="none"
                        stroke={color.stroke}
                        strokeWidth="12"
                        strokeLinecap="round"
                        filter={`url(#glow-${index})`}
                        initial={{ strokeDasharray: `0 ${circumference}` }}
                        animate={{ strokeDasharray }}
                        transition={{ duration: 1, delay, ease: "easeOut" }}
                        style={{
                          boxShadow: `0 0 20px ${color.glow}`,
                        }}
                      />

                      {/* 内部装饰圆点 */}
                      {[...Array(8)].map((_, i) => {
                        const angle = (i * 45 * Math.PI) / 180;
                        const x = 70 + 52 * Math.cos(angle);
                        const y = 70 + 52 * Math.sin(angle);
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="2"
                            fill="rgba(255,255,255,0.1)"
                          />
                        );
                      })}
                    </svg>

                    {/* 中心内容 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        key={option.votes}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-2xl font-bold text-white"
                      >
                        {option.votes}
                      </motion.span>
                      <span className="text-white/60 text-sm">{option.percentage}%</span>
                    </div>

                    {/* 排名徽章 */}
                    {index < 3 && (
                      <div
                        className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900"
                            : index === 1
                            ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700"
                            : "bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100"
                        }`}
                      >
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* 选项名称 */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.2 }}
                    className="mt-4 text-center"
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color.stroke }}
                      />
                      <span className="text-white font-medium text-sm truncate max-w-32">
                        {option.text}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {/* 如果选项超过6个，显示更多提示 */}
        {options.length > 6 && (
          <div className="mt-8 text-center text-white/40 text-sm">
            仅显示前 6 名选项
          </div>
        )}
      </div>

      {/* 底部详情 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 max-w-4xl mx-auto relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
          <h3 className="text-white font-bold mb-4 text-sm">📊 详细数据</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {displayOptions.map((option, index) => {
              const color = ringColors[index % ringColors.length];
              return (
                <div
                  key={option.id}
                  className="bg-white/5 rounded-lg p-3 text-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: color.stroke }}
                  />
                  <div className="text-white font-bold">{option.votes}</div>
                  <div className="text-white/50 text-xs truncate">{option.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 实时指示器 */}
      <div className="fixed top-4 right-4 z-20">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-2 flex items-center gap-2 border border-white/20">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/80 text-xs font-medium">实时</span>
        </div>
      </div>
    </div>
  );
}