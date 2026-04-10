"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getOrCreateUser, getCurrentUserId, clearUserIdentity } from "@/lib/user";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  totalVotes: number;
  style: { name: string };
}

interface Statistics {
  totalActivities: number;
  draftCount: number;
  activeCount: number;
  closedCount: number;
  totalVotes: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCodeModal, setShowCodeModal] = useState(false);

  // 初始化用户身份
  useEffect(() => {
    const user = getOrCreateUser();
    setUserId(user.userId);
    setAccessCode(user.accessCode);
  }, []);

  // 加载用户活动
  const loadActivities = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/my/activities?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setActivities(data.activities);
        setStatistics(data.statistics);
      } else {
        console.error("加载失败:", data.error);
      }
    } catch (err) {
      console.error("加载失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadActivities();
    }
  }, [userId]);

  // 筛选活动
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 状态转换
  const handleStatusChange = async (activityId: string, newStatus: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/my/activities/${activityId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (res.ok) {
        loadActivities();
      } else {
        const data = await res.json();
        alert(data.error || "操作失败");
      }
    } catch (err) {
      alert("操作失败");
    }
  };

  // 删除活动
  const handleDelete = async (activityId: string) => {
    if (!userId) return;
    if (!confirm("确定要删除这个活动吗？此操作不可恢复。")) return;
    try {
      const res = await fetch(`/api/my/activities/${activityId}?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadActivities();
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } catch (err) {
      alert("删除失败");
    }
  };

  // 导出数据
  const handleExport = async (activityId: string) => {
    if (!userId) return;
    window.open(`/api/my/activities/${activityId}/export?userId=${userId}`, "_blank");
  };

  // 清除身份（重新开始）
  const handleClearIdentity = () => {
    if (!confirm("确定要清除当前身份吗？清除后将无法访问之前创建的活动。")) return;
    clearUserIdentity();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← 返回首页
          </Link>
          <h1 className="text-2xl font-bold text-white">我的工作台</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCodeModal(true)}
            className="px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30 text-sm hover:bg-purple-600/30 transition"
          >
            访问码: {accessCode}
          </button>
          <button
            onClick={handleClearIdentity}
            className="px-3 py-1.5 text-gray-400 hover:text-red-400 text-sm transition"
          >
            清除身份
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      {statistics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
        >
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">活动总数</div>
            <div className="text-2xl font-bold text-white">{statistics.totalActivities}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-600/20 to-gray-800/20 rounded-xl p-4 border border-gray-500/30">
            <div className="text-gray-400 text-sm mb-1">草稿</div>
            <div className="text-2xl font-bold text-white">{statistics.draftCount}</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-4 border border-green-500/30">
            <div className="text-green-400 text-sm mb-1">进行中</div>
            <div className="text-2xl font-bold text-white">{statistics.activeCount}</div>
          </div>
          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-xl p-4 border border-red-500/30">
            <div className="text-red-400 text-sm mb-1">已结束</div>
            <div className="text-2xl font-bold text-white">{statistics.closedCount}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-500/30">
            <div className="text-purple-400 text-sm mb-1">总票数</div>
            <div className="text-2xl font-bold text-white">{statistics.totalVotes}</div>
          </div>
        </motion.div>
      )}

      {/* 工具栏 */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="搜索活动..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="active">进行中</option>
          <option value="closed">已结束</option>
        </select>
        <Link
          href="/"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
        >
          + 创建活动
        </Link>
      </div>

      {/* 活动列表 */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {activities.length === 0 ? "暂无活动，去创建一个吧！" : "没有找到匹配的活动"}
          </div>
          {activities.length === 0 && (
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
            >
              创建第一个活动
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-medium">{activity.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        activity.status === "draft"
                          ? "bg-gray-600/50 text-gray-400"
                          : activity.status === "active"
                          ? "bg-green-600/50 text-green-400"
                          : "bg-red-600/50 text-red-400"
                      }`}
                    >
                      {activity.status === "draft" ? "草稿" : activity.status === "active" ? "进行中" : "已结束"}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-gray-500 text-sm mb-2">{activity.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>样式: {activity.style.name}</span>
                    <span>票数: {activity.totalVotes}</span>
                    <span>创建: {new Date(activity.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  {/* 查看投票页 */}
                  <Link
                    href={`/vote/${activity.id}`}
                    className="px-3 py-1.5 text-purple-400 hover:text-purple-300 text-sm transition"
                  >
                    查看投票页
                  </Link>

                  {/* 状态操作 */}
                  {activity.status === "draft" && (
                    <button
                      onClick={() => handleStatusChange(activity.id, "active")}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 transition"
                    >
                      开始活动
                    </button>
                  )}
                  {activity.status === "active" && (
                    <button
                      onClick={() => handleStatusChange(activity.id, "closed")}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500 transition"
                    >
                      结束活动
                    </button>
                  )}

                  {/* 编辑（仅草稿） */}
                  {activity.status === "draft" && (
                    <Link
                      href={`/edit/${activity.id}`}
                      className="px-3 py-1.5 text-blue-400 hover:text-blue-300 text-sm transition"
                    >
                      编辑
                    </Link>
                  )}

                  {/* 导出 */}
                  {activity.totalVotes > 0 && (
                    <button
                      onClick={() => handleExport(activity.id)}
                      className="px-3 py-1.5 text-gray-400 hover:text-gray-300 text-sm transition"
                    >
                      导出CSV
                    </button>
                  )}

                  {/* 删除（仅草稿） */}
                  {activity.status === "draft" && (
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="px-3 py-1.5 text-red-400 hover:text-red-300 text-sm transition"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 访问码弹窗 */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">您的访问码</h2>
            <div className="bg-slate-900 rounded-lg p-4 mb-4 text-center">
              <div className="text-3xl font-bold text-purple-400 tracking-widest">
                {accessCode}
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              请保存此访问码。在新设备上访问时，可通过输入访问码恢复您的身份并访问之前创建的活动。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(accessCode || "");
                  alert("已复制到剪贴板");
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
              >
                复制访问码
              </button>
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}