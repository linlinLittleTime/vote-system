"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { StyleDisplayProps } from "./index";

// 玻璃渐变配置
const glassGradients = [
  {
    bg: "from-blue-500/30 to-purple-500/30",
    border: "border-blue-400/30",
    accent: "bg-blue-500",
    glow: "rgba(59, 130, 246, 0.3)",
  },
  {
    bg: "from-purple-500/30 to-pink-500/30",
    border: "border-purple-400/30",
    accent: "bg-purple-500",
    glow: "rgba(139, 92, 246, 0.3)",
  },
  {
    bg: "from-pink-500/30 to-rose-500/30",
    border: "border-pink-400/30",
    accent: "bg-pink-500",
    glow: "rgba(236, 72, 153, 0.3)",
  },
  {
    bg: "from-green-500/30 to-emerald-500/30",
    border: "border-green-400/30",
    accent: "bg-green-500",
    glow: "rgba(34, 197, 94, 0.3)",
  },
  {
    bg: "from-amber-500/30 to-orange-500/30",
    border: "border-amber-400/30",
    accent: "bg-amber-500",
    glow: "rgba(245, 158, 11, 0.3)",
  },
  {
    bg: "from-indigo-500/30 to-violet-500/30",
    border: "border-indigo-400/30",
    accent: "bg-indigo-500",
    glow: "rgba(99, 102, 241, 0.3)",
  },
  {
    bg: "from-cyan-500/30 to-teal-500/30",
    border: "border-cyan-400/30",
    accent: "bg-cyan-500",
    glow: "rgba(6, 182, 212, 0.3)",
  },
  {
    bg: "from-rose-500/30 to-red-500/30",
    border: "border-rose-400/30",
    accent: "bg-rose-500",
    glow: "rgba(244, 63, 94, 0.3)",
  },
];

export default function GlassCardDisplay({
  title,
  options,
  totalVotes,
}: StyleDisplayProps) {
  // 按票数排序
  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(...options.map((o) => o.votes), 1);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 动态渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600" />

      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* 内容 */}
      <div className="relative z-10 p-4 sm:p-8">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-3xl sm:text-4xl font-bold text-white mb-3 drop-shadow-lg"
            style={{ textShadow: "0 2px 20px rgba(255,255,255,0.3)" }}
          >
            🪟 {title}
          </motion.h1>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/30 shadow-lg"
          >
            <div className="text-3xl font-bold text-white">{totalVotes}</div>
            <div className="text-white/80 text-sm">总票数</div>
          </motion.div>
        </motion.div>

        {/* 卡片网格 */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedOptions.map((option, index) => {
                const gradient = glassGradients[index % glassGradients.length];
                const barWidth = (option.votes / maxVotes) * 100;
                const delay = index * 0.08;

                return (
                  <motion.div
                    key={option.id}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                      delay,
                    }}
                    className="group"
                  >
                    <div
                      className={`relative bg-gradient-to-br ${gradient.bg} backdrop-blur-xl rounded-2xl border ${gradient.border} shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                      style={{
                        boxShadow: `0 8px 32px ${gradient.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                      }}
                    >
                      {/* 顶部光泽 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 pointer-events-none" />

                      {/* 侧边光泽 */}
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-white/40 via-white/20 to-transparent" />

                      {/* 排名徽章 */}
                      {index < 3 && (
                        <div className="absolute top-3 right-3 z-10">
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: delay + 0.2, type: "spring" }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                              index === 0
                                ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-yellow-900"
                                : index === 1
                                ? "bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700"
                                : "bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100"
                            }`}
                          >
                            {index + 1}
                          </motion.div>
                        </div>
                      )}

                      {/* 选项图片 */}
                      {option.imageUrl && (
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={option.imageUrl}
                            alt={option.text}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>
                      )}

                      <div className="p-5">
                        {/* 票数和百分比 */}
                        <div className="flex items-end justify-between mb-4">
                          <motion.div
                            key={option.votes}
                            initial={{ scale: 1.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl font-bold text-white drop-shadow-lg"
                          >
                            {option.votes}
                          </motion.div>
                          <div className="text-white/70 text-lg font-medium">
                            {option.percentage}%
                          </div>
                        </div>

                        {/* 进度条 */}
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm mb-4">
                          <motion.div
                            className="h-full bg-white/40 rounded-full backdrop-blur-md"
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.6, delay, ease: "easeOut" }}
                          />
                        </div>

                        {/* 分段指示器 */}
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                                i < Math.round(option.percentage / 10)
                                  ? "bg-white/50"
                                  : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>

                        {/* 选项名称 */}
                        <h3 className="text-lg font-semibold text-white truncate drop-shadow">
                          {option.text}
                        </h3>
                      </div>

                      {/* 悬停发光效果 */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, ${gradient.glow}, transparent 70%)`,
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>

        {/* 底部提示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/50 text-sm mt-8"
        >
          数据每 2 秒自动刷新
        </motion.p>
      </div>

      {/* 实时指示器 */}
      <div className="fixed top-4 right-4 z-20">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 border border-white/30 shadow-lg"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-medium">实时</span>
        </motion.div>
      </div>
    </div>
  );
}