"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { StyleDisplayProps } from "./index";

// 颜色配置
const cardColors = [
  { bg: "from-blue-50 to-indigo-50", accent: "bg-blue-500", text: "text-blue-600" },
  { bg: "from-purple-50 to-pink-50", accent: "bg-purple-500", text: "text-purple-600" },
  { bg: "from-pink-50 to-rose-50", accent: "bg-pink-500", text: "text-pink-600" },
  { bg: "from-green-50 to-emerald-50", accent: "bg-green-500", text: "text-green-600" },
  { bg: "from-amber-50 to-yellow-50", accent: "bg-amber-500", text: "text-amber-600" },
  { bg: "from-cyan-50 to-sky-50", accent: "bg-cyan-500", text: "text-cyan-600" },
  { bg: "from-indigo-50 to-violet-50", accent: "bg-indigo-500", text: "text-indigo-600" },
  { bg: "from-rose-50 to-red-50", accent: "bg-rose-500", text: "text-rose-600" },
];

export default function CardFlowDisplay({
  title,
  options,
  totalVotes,
}: StyleDisplayProps) {
  // 按票数排序
  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(...options.map((o) => o.votes), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-8">
      {/* 顶部标题区 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          {title}
        </h1>
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <span className="text-2xl font-bold text-gray-800">{totalVotes}</span>
          <span className="text-gray-500 text-sm">总票数</span>
        </div>
      </motion.div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
        <AnimatePresence mode="popLayout">
          {sortedOptions.map((option, index) => {
            const color = cardColors[index % cardColors.length];
            const barWidth = (option.votes / maxVotes) * 100;

            return (
              <motion.div
                key={option.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: index * 0.05,
                }}
                className="group"
              >
                <div
                  className={`bg-gradient-to-br ${color.bg} rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-white/50 h-full`}
                >
                  {/* 排名徽章 */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-8 h-8 rounded-full ${color.accent} text-white flex items-center justify-center font-bold text-sm shadow-md`}
                    >
                      {index + 1}
                    </motion.span>
                    <div className="text-right">
                      <motion.span
                        key={option.votes}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-3xl font-bold ${color.text}`}
                      >
                        {option.votes}
                      </motion.span>
                      <span className="text-gray-400 text-sm ml-1">票</span>
                    </div>
                  </div>

                  {/* 选项图片（如果有） */}
                  {option.imageUrl && (
                    <div className="mb-4 relative overflow-hidden rounded-xl">
                      <img
                        src={option.imageUrl}
                        alt={option.text}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* 选项内容 */}
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 truncate">
                    {option.text}
                  </h3>

                  {/* 进度条 */}
                  <div className="space-y-2">
                    <div className="h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        className={`h-full ${color.accent} rounded-full shadow-sm`}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">占比</span>
                      <motion.span
                        key={option.percentage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`font-medium ${color.text}`}
                      >
                        {option.percentage}%
                      </motion.span>
                    </div>
                  </div>

                  {/* 投票比例可视化 */}
                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <div className="flex items-center gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1.5 rounded-full ${
                            i < Math.round(option.percentage / 10)
                              ? color.accent
                              : "bg-gray-200"
                          } transition-colors duration-300`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 底部提示 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-gray-400 text-sm mt-8"
      >
        数据每 2 秒自动刷新
      </motion.p>

      {/* 实时指示器 */}
      <div className="fixed top-4 right-4 flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-gray-600 text-xs font-medium">实时</span>
      </div>
    </div>
  );
}