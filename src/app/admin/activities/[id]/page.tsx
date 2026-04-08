"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Activity {
  id: string;
  title: string;
  description?: string;
  status: string;
  ruleType: string;
  maxVotes?: number;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  options: any[];
  style?: { name: string };
}

interface Vote {
  id: string;
  optionId: string;
  voterId: string;
  createdAt: string;
}

interface OptionWithVotes {
  id: string;
  text: string;
  imageUrl?: string;
  votes: number;
  voteCount: number;
}

export default function ActivityDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { loading: authLoading } = useAdminAuth();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [options, setOptions] = useState<OptionWithVotes[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [statistics, setStatistics] = useState({ totalVotes: 0, votesLast24h: 0, votesLast7d: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // 编辑表单
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // 加载活动详情
  const loadActivity = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/activities/${id}`);
      const data = await res.json();

      if (res.ok) {
        setActivity(data.activity);
        setOptions(data.optionsWithVotes);
        setVotes(data.votes);
        setStatistics(data.statistics);
        setEditTitle(data.activity.title);
        setEditDescription(data.activity.description || "");
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
    if (!authLoading && id) {
      loadActivity();
    }
  }, [id, authLoading]);

  // 保存编辑
  const handleSave = async () => {
    try {
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      if (res.ok) {
        setEditing(false);
        loadActivity();
      }
    } catch (err) {
      console.error("保存失败:", err);
    }
  };

  // 状态切换
  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/activities/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadActivity();
      }
    } catch (err) {
      console.error("状态切换失败:", err);
    }
  };

  // 删除活动
  const handleDelete = async () => {
    if (!confirm("确定要删除此活动吗？此操作不可恢复。")) return;

    try {
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin");
      }
    } catch (err) {
      console.error("删除失败:", err);
    }
  };

  // 导出数据
  const handleExport = async (format: "csv" | "excel") => {
    try {
      const res = await fetch(`/api/admin/activities/${id}/export?format=${format}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_${id}.${format === "csv" ? "csv" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("导出失败:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">活动不存在</div>
      </div>
    );
  }

  const totalVotes = statistics.totalVotes;

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="text-gray-400 hover:text-white transition"
          >
            ← 返回列表
          </button>
          <h1 className="text-xl font-bold text-white">活动详情</h1>
        </div>

        <div className="flex items-center gap-3">
          {activity.status === "draft" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusChange("active")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              🚀 启动活动
            </motion.button>
          )}
          {activity.status === "active" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusChange("closed")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              🔒 结束活动
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="px-4 py-2 bg-slate-700 text-red-400 rounded-lg hover:bg-slate-600 transition"
          >
            🗑️ 删除
          </motion.button>
        </div>
      </div>

      {/* 基本信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">基本信息</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            {editing ? "取消" : "编辑"}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">活动标题</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">活动描述</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 outline-none resize-none"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              保存修改
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">标题</div>
              <div className="text-white font-medium">{activity.title}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">状态</div>
              <div className="text-white font-medium">
                {activity.status === "draft" && "📝 草稿"}
                {activity.status === "active" && "🚀 进行中"}
                {activity.status === "closed" && "🔒 已结束"}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">投票规则</div>
              <div className="text-white font-medium">
                {activity.ruleType === "single" ? "单选" : `多选（最多${activity.maxVotes}项）`}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">展示样式</div>
              <div className="text-white font-medium">{activity.style?.name || "默认"}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">创建时间</div>
              <div className="text-white font-medium">
                {format(new Date(activity.createdAt), "yyyy-MM-dd HH:mm")}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">有效期</div>
              <div className="text-white font-medium">
                {activity.startTime && activity.endTime
                  ? `${format(new Date(activity.startTime), "MM-dd HH:mm")} 至 ${format(new Date(activity.endTime), "MM-dd HH:mm")}`
                  : "无限期"}
              </div>
            </div>
            {activity.description && (
              <div className="col-span-2">
                <div className="text-gray-400 text-sm">描述</div>
                <div className="text-white">{activity.description}</div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* 统计卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-gray-400 text-sm mb-1">总票数</div>
          <div className="text-2xl font-bold text-purple-400">{statistics.totalVotes}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-gray-400 text-sm mb-1">最近24小时</div>
          <div className="text-2xl font-bold text-green-400">{statistics.votesLast24h}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-gray-400 text-sm mb-1">最近7天</div>
          <div className="text-2xl font-bold text-blue-400">{statistics.votesLast7d}</div>
        </div>
      </motion.div>

      {/* 选项投票情况 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
      >
        <h2 className="text-lg font-bold text-white mb-4">选项投票情况</h2>
        <div className="space-y-3">
          {options.map((opt, index) => {
            const percentage = totalVotes > 0 ? ((opt.voteCount / totalVotes) * 100).toFixed(1) : "0";
            return (
              <div key={opt.id} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">{index + 1}</span>
                    <span className="text-white font-medium">{opt.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">{opt.voteCount}</span>
                    <span className="text-gray-400 text-sm">票 ({percentage}%)</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 快捷链接 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
      >
        <h2 className="text-lg font-bold text-white mb-4">快捷链接</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`/vote/${activity.id}`}
            target="_blank"
            className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition"
          >
            🗳️ 投票页面
          </a>
          <a
            href={`/screen/${activity.id}`}
            target="_blank"
            className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition"
          >
            🖥️ 大屏展示
          </a>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleExport("csv")}
            className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition"
          >
            📄 导出CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleExport("excel")}
            className="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition"
          >
            📊 导出Excel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}