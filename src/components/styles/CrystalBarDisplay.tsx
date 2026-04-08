"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { StyleDisplayProps } from "./index";

// 水晶渐变色配置
const crystalGradients = [
  {
    front: "from-cyan-400 via-blue-500 to-indigo-600",
    side: "from-blue-600 to-indigo-800",
    top: "from-cyan-300 to-blue-400",
    glow: "rgba(34, 211, 238, 0.5)",
  },
  {
    front: "from-purple-400 via-violet-500 to-purple-700",
    side: "from-purple-700 to-purple-900",
    top: "from-purple-300 to-violet-400",
    glow: "rgba(168, 85, 247, 0.5)",
  },
  {
    front: "from-pink-400 via-rose-500 to-pink-700",
    side: "from-pink-700 to-rose-900",
    top: "from-pink-300 to-rose-400",
    glow: "rgba(244, 114, 182, 0.5)",
  },
  {
    front: "from-emerald-400 via-green-500 to-teal-700",
    side: "from-teal-700 to-green-900",
    top: "from-emerald-300 to-green-400",
    glow: "rgba(52, 211, 153, 0.5)",
  },
  {
    front: "from-amber-400 via-orange-500 to-red-600",
    side: "from-orange-700 to-red-900",
    top: "from-amber-300 to-orange-400",
    glow: "rgba(251, 191, 36, 0.5)",
  },
  {
    front: "from-indigo-400 via-blue-500 to-violet-700",
    side: "from-violet-700 to-indigo-900",
    top: "from-indigo-300 to-violet-400",
    glow: "rgba(129, 140, 248, 0.5)",
  },
  {
    front: "from-rose-400 via-pink-500 to-red-700",
    side: "from-red-700 to-rose-900",
    top: "from-rose-300 to-pink-400",
    glow: "rgba(251, 113, 133, 0.5)",
  },
  {
    front: "from-teal-400 via-cyan-500 to-blue-700",
    side: "from-blue-700 to-teal-900",
    top: "from-teal-300 to-cyan-400",
    glow: "rgba(45, 212, 191, 0.5)",
  },
];

export default function CrystalBarDisplay({
  title,
  options,
  totalVotes,
}: StyleDisplayProps) {
  const maxVotes = Math.max(...options.map((o) => o.votes), 1);
  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-8 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* 顶部标题区 */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 drop-shadow-lg">
          💎 {title}
        </h1>
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20">
          <div className="text-3xl font-bold text-white">{totalVotes}</div>
          <div className="text-white/60 text-sm">总票数</div>
        </div>
      </motion.div>

      {/* 3D 柱状图区域 */}
      <div className="flex items-end justify-center gap-4 sm:gap-8 lg:gap-12 px-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {sortedOptions.map((option, index) => {
            const height = Math.max((option.votes / maxVotes) * 280, 40);
            const gradient = crystalGradients[index % crystalGradients.length];

            return (
              <motion.div
                key={option.id}
                layout
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: index * 0.1,
                }}
                className="flex flex-col items-center"
                style={{ perspective: "1000px" }}
              >
                {/* 票数和百分比 */}
                <motion.div
                  key={option.votes}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-4 text-center"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                    {option.votes}
                  </div>
                  <div className="text-white/60 text-sm">({option.percentage}%)</div>
                </motion.div>

                {/* 3D 水晶柱体 */}
                <div
                  className="relative"
                  style={{
                    width: "70px",
                    height: `${height}px`,
                    transformStyle: "preserve-3d",
                    transform: "rotateX(-5deg) rotateY(-15deg)",
                  }}
                >
                  {/* 发光效果 */}
                  <div
                    className="absolute inset-0 rounded-t-xl blur-xl opacity-60"
                    style={{
                      background: gradient.glow,
                      transform: "scale(1.2)",
                    }}
                  />

                  {/* 正面 */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${gradient.front} rounded-t-xl`}
                    style={{
                      boxShadow: `
                        inset 0 2px 20px rgba(255,255,255,0.3),
                        inset 0 -20px 40px rgba(0,0,0,0.2),
                        0 10px 40px ${gradient.glow}
                      `,
                    }}
                  >
                    {/* 水晶光泽条纹 */}
                    <div className="absolute inset-0 overflow-hidden rounded-t-xl">
                      <div className="absolute top-0 left-1/4 w-1 h-full bg-white/30 blur-sm" />
                      <div className="absolute top-0 right-1/3 w-0.5 h-3/4 bg-white/20 blur-sm" />
                    </div>
                    {/* 顶部高光 */}
                    <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-white/40 to-transparent rounded-t-xl" />
                  </div>

                  {/* 右侧面 */}
                  <div
                    className={`absolute bg-gradient-to-b ${gradient.side} rounded-tr-xl`}
                    style={{
                      width: "25px",
                      height: `${height}px`,
                      right: "-12px",
                      transform: "skewY(-45deg)",
                      transformOrigin: "left bottom",
                      boxShadow: "inset -5px 0 15px rgba(0,0,0,0.3)",
                    }}
                  />

                  {/* 顶面 */}
                  <div
                    className={`absolute bg-gradient-to-r ${gradient.top} rounded-t-xl`}
                    style={{
                      width: "70px",
                      height: "20px",
                      top: "-10px",
                      transform: "skewX(-45deg)",
                      transformOrigin: "bottom left",
                      boxShadow: "inset 0 5px 15px rgba(255,255,255,0.3)",
                    }}
                  />

                  {/* 底部反光 */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/10 to-transparent"
                    style={{
                      filter: "blur(2px)",
                    }}
                  />
                </div>

                {/* 选项名称 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="mt-6 text-center"
                >
                  <div className="relative">
                    {/* 排名徽章 */}
                    {index < 3 && (
                      <div
                        className={`absolute -top-5 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-yellow-400 text-yellow-900"
                            : index === 1
                            ? "bg-gray-300 text-gray-700"
                            : "bg-amber-600 text-amber-100"
                        }`}
                      >
                        {index + 1}
                      </div>
                    )}
                    <span className="text-white font-medium text-sm sm:text-base truncate max-w-24 sm:max-w-32 block drop-shadow">
                      {option.text}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 排行榜卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 max-w-4xl mx-auto relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10">
          <h3 className="text-white font-bold mb-4 text-sm">📊 实时排行</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sortedOptions.map((option, index) => {
              const gradient = crystalGradients[index % crystalGradients.length];
              return (
                <div
                  key={option.id}
                  className="bg-white/5 rounded-xl p-3 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient.front}`}
                    />
                    <span className="text-white/80 text-xs truncate">{option.text}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{option.votes}</span>
                    <span className="text-white/50 text-xs">票</span>
                  </div>
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${gradient.front} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${option.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 底部提示 */}
      <p className="text-center text-white/30 text-xs mt-8 relative z-10">
        数据每 2 秒自动刷新
      </p>

      {/* 实时指示器 */}
      <div className="fixed top-4 right-4 z-20">
        <div className="bg-cyan-500/20 backdrop-blur-md rounded-full px-3 py-2 flex items-center gap-2 border border-cyan-500/30">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <span className="text-cyan-300 text-xs font-medium">实时</span>
        </div>
      </div>
    </div>
  );
}