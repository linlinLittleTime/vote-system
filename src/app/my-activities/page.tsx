"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  startTime?: string | null;
  endTime?: string | null;
  ruleType: string;
  totalVotes: number;
}

interface ActivityDetail {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  ruleType: string;
  maxVotes?: number | null;
  createdAt: string;
  options: Array<{
    id: string;
    text: string;
    imageUrl?: string;
    votes: number;
    percentage: number;
  }>;
  totalVotes: number;
}

// localStorage key
const MY_ACTIVITIES_KEY = "vote_system_my_activities";

// 状态标签颜色
const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-600",
  closed: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  draft: "草稿",
  active: "进行中",
  closed: "已结束",
};

export default function MyActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(MY_ACTIVITIES_KEY);
      const ids = stored ? JSON.parse(stored) : [];

      if (ids.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/activities/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids.map((a: { id: string }) => a.id) }),
      });

      if (res.ok) {
        const data = await res.json();
        // 按本地存储顺序排列
        const sorted = ids
          .map((local: { id: string }) => data.find((a: Activity) => a.id === local.id))
          .filter(Boolean);
        setActivities(sorted);
      }
    } catch (error) {
      console.error("加载活动失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityDetail = async (activityId: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/activities/${activityId}/results`);
      if (res.ok) {
        const data = await res.json();
        setSelectedActivity(data);
      }
    } catch (error) {
      console.error("加载详情失败:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExport = async (format: "csv" | "excel") => {
    if (!selectedActivity) return;

    setExporting(true);
    try {
      const res = await fetch(`/api/activities/${selectedActivity.id}/export?format=${format}`);
      if (!res.ok) {
        throw new Error("导出失败");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_${selectedActivity.id}.${format === "csv" ? "csv" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("导出失败:", error);
      alert("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  };

  const removeActivity = (activityId: string) => {
    const stored = localStorage.getItem(MY_ACTIVITIES_KEY);
    const activities = stored ? JSON.parse(stored) : [];
    const filtered = activities.filter((a: { id: string }) => a.id !== activityId);
    localStorage.setItem(MY_ACTIVITIES_KEY, JSON.stringify(filtered));
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
    if (selectedActivity?.id === activityId) {
      setSelectedActivity(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-white/80 hover:text-white transition"
            >
              ← 返回
            </button>
            <h1 className="text-2xl font-bold text-white">📁 我的活动</h1>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition text-sm"
          >
            + 创建新活动
          </button>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">加载中...</div>
          </div>
        ) : activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 rounded-2xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">暂无活动</h2>
            <p className="text-gray-500 mb-6">创建活动后会自动保存在这里</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
            >
              创建第一个活动
            </button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 活动列表 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/95 rounded-2xl p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  活动列表 ({activities.length})
                </h2>
                <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => loadActivityDetail(activity.id)}
                      className={`p-4 rounded-lg cursor-pointer transition ${
                        selectedActivity?.id === activity.id
                          ? "bg-purple-100 border-2 border-purple-500"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-800 truncate">{activity.title}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[activity.status]}`}>
                          {statusLabels[activity.status]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{activity.totalVotes} 票</span>
                        <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 活动详情 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {loadingDetail ? (
                <div className="bg-white/95 rounded-2xl p-12 text-center">
                  <div className="text-gray-500">加载详情...</div>
                </div>
              ) : !selectedActivity ? (
                <div className="bg-white/95 rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <p className="text-gray-500">选择一个活动查看详情</p>
                </div>
              ) : (
                <div className="bg-white/95 rounded-2xl p-6">
                  {/* 标题和操作 */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{selectedActivity.title}</h2>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full ${statusColors[selectedActivity.status]}`}>
                          {statusLabels[selectedActivity.status]}
                        </span>
                        <span>
                          {selectedActivity.ruleType === "single" ? "单选" : `多选(最多${selectedActivity.maxVotes}项)`}
                        </span>
                        <span>{selectedActivity.totalVotes} 票</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/activity/${selectedActivity.id}`)}
                        className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      >
                        🔗 分享
                      </button>
                      <button
                        onClick={() => router.push(`/vote/${selectedActivity.id}`)}
                        className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      >
                        🗳️ 投票
                      </button>
                      <button
                        onClick={() => removeActivity(selectedActivity.id)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        🗑️ 移除
                      </button>
                    </div>
                  </div>

                  {/* 投票统计 */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">📊 投票统计</h3>
                    <div className="space-y-3">
                      {selectedActivity.options.map((option, index) => (
                        <div key={option.id}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-700">{option.text}</span>
                            <span className="text-gray-500">
                              {option.votes} 票 ({option.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${option.percentage}%` }}
                              transition={{ delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 导出按钮 */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">导出数据：</span>
                    <button
                      onClick={() => handleExport("csv")}
                      disabled={exporting}
                      className="px-4 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                    >
                      {exporting ? "导出中..." : "📥 导出 CSV"}
                    </button>
                    <button
                      onClick={() => handleExport("excel")}
                      disabled={exporting}
                      className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                    >
                      {exporting ? "导出中..." : "📥 导出 Excel"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}