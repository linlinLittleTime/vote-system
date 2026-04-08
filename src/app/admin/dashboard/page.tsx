"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface DashboardData {
  overview: {
    totalActivities: number;
    totalVotes: number;
    activeActivities: number;
    avgVotesPerActivity: number;
  };
  statusDistribution: {
    draft: number;
    active: number;
    closed: number;
  };
  dailyTrend: Array<{ date: string; votes: number; newActivities: number }>;
  hourlyTrend: Array<{ hour: string; votes: number }>;
  topActivities: Array<{ id: string; title: string; votes: number; status: string }>;
  styleUsage: Array<{ name: string; count: number }>;
}

const COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"];

export default function DashboardPage() {
  const router = useRouter();
  const { loading: authLoading } = useAdminAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      const result = await res.json();

      if (res.ok) {
        setData(result);
      } else if (res.status === 401) {
        router.push("/admin/login");
      }
    } catch (err) {
      console.error("加载失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-gray-400">加载统计数据...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">暂无数据</div>
      </div>
    );
  }

  // 饼图数据
  const pieData = [
    { name: "进行中", value: data.statusDistribution.active, color: "#10B981" },
    { name: "草稿", value: data.statusDistribution.draft, color: "#6B7280" },
    { name: "已结束", value: data.statusDistribution.closed, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">统计看板</h1>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition text-sm"
        >
          🔄 刷新数据
        </button>
      </div>

      {/* 概览卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-500/30">
          <div className="text-purple-400 text-sm mb-1">活动总数</div>
          <div className="text-3xl font-bold text-white">{data.overview.totalActivities}</div>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-4 border border-green-500/30">
          <div className="text-green-400 text-sm mb-1">进行中</div>
          <div className="text-3xl font-bold text-white">{data.overview.activeActivities}</div>
        </div>
        <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 rounded-xl p-4 border border-pink-500/30">
          <div className="text-pink-400 text-sm mb-1">总票数</div>
          <div className="text-3xl font-bold text-white">{data.overview.totalVotes}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-4 border border-blue-500/30">
          <div className="text-blue-400 text-sm mb-1">平均票数</div>
          <div className="text-3xl font-bold text-white">{data.overview.avgVotesPerActivity}</div>
        </div>
      </motion.div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 投票趋势 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-white font-bold mb-4">📈 最近7天投票趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Line
                  type="monotone"
                  dataKey="votes"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6", strokeWidth: 2 }}
                  name="投票数"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 状态分布 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-white font-bold mb-4">🎯 活动状态分布</h3>
          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500">暂无数据</div>
            )}
          </div>
          {/* 图例 */}
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400 text-sm">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 今日投票 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-white font-bold mb-4">⏰ 今日投票分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourlyTrend.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="votes" fill="#EC4899" radius={[4, 4, 0, 0]} name="投票数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 热门活动 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-white font-bold mb-4">🏆 热门活动 Top 5</h3>
          <div className="space-y-3">
            {data.topActivities.length > 0 ? (
              data.topActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: COLORS[index] }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{activity.title}</div>
                    <div className="text-gray-400 text-xs">
                      {activity.status === "active" ? "进行中" : activity.status === "draft" ? "草稿" : "已结束"}
                    </div>
                  </div>
                  <div className="text-purple-400 font-bold">{activity.votes} 票</div>
                </motion.div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">暂无活动数据</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 样式使用统计 */}
      {data.styleUsage.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-white font-bold mb-4">🎨 样式使用统计</h3>
          <div className="flex flex-wrap gap-4">
            {data.styleUsage.map((style, index) => (
              <div key={style.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-300">{style.name}</span>
                <span className="text-purple-400 font-medium">{style.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}