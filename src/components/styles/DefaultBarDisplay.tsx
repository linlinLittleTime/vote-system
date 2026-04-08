"use client";

import type { StyleDisplayProps } from "./index";

// 颜色数组
const colors = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-green-500 to-green-600",
  "from-yellow-500 to-yellow-600",
  "from-red-500 to-red-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
];

export default function DefaultBarDisplay({
  title,
  options,
  totalVotes,
}: StyleDisplayProps) {
  // 获取最大票数用于计算柱状图高度
  const maxVotes = Math.max(...options.map((o) => o.votes), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      {/* 顶部栏 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            🗳️ {title}
          </h1>
          <p className="text-white/60">实时投票统计</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white">{totalVotes}</div>
          <div className="text-white/60 text-sm">总票数</div>
        </div>
      </div>

      {/* 柱状图 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6">
        <div className="flex items-end justify-center gap-4 sm:gap-8 h-64 sm:h-80">
          {options.map((option, index) => (
            <div
              key={option.id}
              className="flex flex-col items-center flex-1 max-w-32"
            >
              <div className="relative w-full flex flex-col items-center">
                {/* 票数标签 */}
                <div className="text-white font-bold text-lg mb-2">
                  {option.votes}
                  <span className="text-white/60 text-sm ml-1">
                    ({option.percentage}%)
                  </span>
                </div>
                {/* 柱子 */}
                <div
                  className={`w-full bg-gradient-to-t ${
                    colors[index % colors.length]
                  } rounded-t-xl transition-all duration-500 ease-out`}
                  style={{
                    height: `${Math.max((option.votes / maxVotes) * 200, 20)}px`,
                  }}
                >
                  <div className="w-full h-full bg-white/20 rounded-t-xl" />
                </div>
              </div>
              {/* 选项名称 */}
              <div className="mt-4 text-center">
                <div className="text-white font-medium text-sm sm:text-base truncate max-w-24 sm:max-w-32">
                  {option.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 详细选项卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {options.map((option, index) => (
          <div
            key={option.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
          >
            {/* 选项图片 */}
            {option.imageUrl && (
              <div className="mb-3 overflow-hidden rounded-lg">
                <img
                  src={option.imageUrl}
                  alt={option.text}
                  className="w-full h-20 object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                  colors[index % colors.length]
                }`}
              />
              <span className="text-white/80 text-sm truncate">{option.text}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{option.votes}</span>
              <span className="text-white/60 text-sm">票</span>
            </div>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${
                  colors[index % colors.length]
                } rounded-full transition-all duration-500`}
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 实时指示器 */}
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-white/60 text-xs">实时</span>
      </div>
    </div>
  );
}