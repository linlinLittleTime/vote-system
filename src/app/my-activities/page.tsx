"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  ruleType: string;
  maxVotes?: number | null;
  createdAt: string;
  updatedAt: string;
  startTime?: string | null;
  endTime?: string | null;
  totalVotes: number;
}

interface ActivityDetail extends Activity {
  options: Array<{
    id: string;
    text: string;
    imageUrl?: string;
    votes: number;
    percentage: number;
  }>;
}

// localStorage key
const MY_ACTIVITIES_KEY = "vote_system_my_activities";

// 状态配置
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: "草稿", color: "text-gray-600", bgColor: "bg-gray-100" },
  active: { label: "进行中", color: "text-green-600", bgColor: "bg-green-100" },
  closed: { label: "已结束", color: "text-red-600", bgColor: "bg-red-100" },
};

export default function MyActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityDetail | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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
    try {
      const res = await fetch(`/api/activities/${activityId}/results`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      console.error("加载详情失败:", error);
    }
    return null;
  };

  // 开始活动
  const startActivity = async (activityId: string) => {
    if (!confirm("确定要开始此活动吗？开始后将无法编辑选项内容。")) return;

    try {
      const res = await fetch(`/api/activities/${activityId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });

      if (res.ok) {
        loadActivities();
      } else {
        alert("操作失败");
      }
    } catch (error) {
      console.error("开始活动失败:", error);
      alert("操作失败");
    }
  };

  // 结束活动
  const closeActivity = async (activityId: string) => {
    if (!confirm("确定要结束此活动吗？结束后将无法继续投票。")) return;

    try {
      const res = await fetch(`/api/activities/${activityId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });

      if (res.ok) {
        loadActivities();
        if (selectedActivity?.id === activityId) {
          setSelectedActivity(await loadActivityDetail(activityId));
        }
      } else {
        alert("操作失败");
      }
    } catch (error) {
      console.error("结束活动失败:", error);
      alert("操作失败");
    }
  };

  // 从列表移除
  const removeFromList = (activityId: string) => {
    if (!confirm("确定要从列表中移除此活动吗？移除后可通过活动链接重新找到。")) return;

    const stored = localStorage.getItem(MY_ACTIVITIES_KEY);
    const localActivities = stored ? JSON.parse(stored) : [];
    const filtered = localActivities.filter((a: { id: string }) => a.id !== activityId);
    localStorage.setItem(MY_ACTIVITIES_KEY, JSON.stringify(filtered));

    setActivities((prev) => prev.filter((a) => a.id !== activityId));
    if (selectedActivity?.id === activityId) {
      setSelectedActivity(null);
      setShowDetail(false);
    }
  };

  // 导出数据
  const handleExport = async (activityId: string, format: "csv" | "excel") => {
    setExporting(true);
    try {
      const res = await fetch(`/api/activities/${activityId}/export?format=${format}`);
      if (!res.ok) throw new Error("导出失败");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_${activityId}.${format === "csv" ? "csv" : "xlsx"}`;
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

  // 复制链接
  const copyLink = async (activityId: string) => {
    const baseUrl = window.location.origin;
    const voteUrl = `${baseUrl}/vote/${activityId}`;
    try {
      await navigator.clipboard.writeText(voteUrl);
      alert("投票链接已复制！");
    } catch {
      const input = document.createElement("input");
      input.value = voteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      alert("投票链接已复制！");
    }
  };

  // 判断是否可编辑
  const canEdit = (activity: Activity) => {
    return activity.status === "draft";
  };

  // 查看详情
  const viewDetail = async (activity: Activity) => {
    const detail = await loadActivityDetail(activity.id);
    if (detail) {
      setSelectedActivity(detail);
      setShowDetail(true);
    }
  };

  // 打开编辑
  const openEdit = async (activity: Activity) => {
    if (!canEdit(activity)) {
      alert("只有草稿状态的活动才能编辑");
      return;
    }
    const detail = await loadActivityDetail(activity.id);
    if (detail) {
      setEditingActivity(detail);
      setShowEditModal(true);
    }
  };

  // 保存编辑
  const saveEdit = async (updatedData: { title: string; description: string | null; options: Array<{ id: string; text: string }> }) => {
    if (!editingActivity) return;

    try {
      const res = await fetch(`/api/activities/${editingActivity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingActivity(null);
        loadActivities();
      } else {
        const data = await res.json();
        alert(data.error || "保存失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-white/60 hover:text-white transition"
            >
              ← 返回首页
            </button>
            <h1 className="text-2xl font-bold text-white">📁 我的活动</h1>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
          >
            + 创建新活动
          </button>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white/60">加载中...</div>
          </div>
        ) : activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-white mb-2">暂无活动</h2>
            <p className="text-white/60 mb-6">创建活动后会自动保存在这里</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
            >
              创建第一个活动
            </button>
          </motion.div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden">
            {/* 表格头部 */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-white/5 text-white/60 text-sm font-medium">
              <div className="col-span-3">活动名称</div>
              <div className="col-span-1 text-center">状态</div>
              <div className="col-span-1 text-center">票数</div>
              <div className="col-span-2 text-center">创建时间</div>
              <div className="col-span-5 text-center">操作</div>
            </div>

            {/* 活动列表 */}
            <div className="divide-y divide-white/10">
              {activities.map((activity, index) => {
                const config = statusConfig[activity.status] || statusConfig.draft;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-white/5 transition items-center"
                  >
                    {/* 活动名称 */}
                    <div className="md:col-span-3">
                      <p className="font-medium text-white truncate">{activity.title}</p>
                      <p className="text-white/40 text-xs md:hidden mt-1">
                        {activity.totalVotes} 票 · {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* 状态 */}
                    <div className="md:col-span-1 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>

                    {/* 票数 */}
                    <div className="hidden md:block md:col-span-1 text-center text-white/80">
                      {activity.totalVotes}
                    </div>

                    {/* 创建时间 */}
                    <div className="hidden md:block md:col-span-2 text-center text-white/60 text-sm">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>

                    {/* 操作按钮 */}
                    <div className="md:col-span-5 flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => viewDetail(activity)}
                        className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                      >
                        📊 统计
                      </button>
                      <button
                        onClick={() => router.push(`/vote/${activity.id}`)}
                        className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition"
                      >
                        🗳️ 投票
                      </button>
                      <button
                        onClick={() => router.push(`/activity/${activity.id}`)}
                        className="px-3 py-1.5 text-xs bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition"
                      >
                        🔗 分享
                      </button>
                      <button
                        onClick={() => copyLink(activity.id)}
                        className="px-3 py-1.5 text-xs bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition"
                      >
                        📋 复制
                      </button>

                      {canEdit(activity) && (
                        <button
                          onClick={() => openEdit(activity)}
                          className="px-3 py-1.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition"
                        >
                          ✏️ 编辑
                        </button>
                      )}

                      {activity.status === "draft" && (
                        <button
                          onClick={() => startActivity(activity.id)}
                          className="px-3 py-1.5 text-xs bg-green-500/30 text-green-400 rounded-lg hover:bg-green-500/40 transition"
                        >
                          ▶️ 开始
                        </button>
                      )}

                      {activity.status === "active" && (
                        <button
                          onClick={() => closeActivity(activity.id)}
                          className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                        >
                          ⏹️ 结束
                        </button>
                      )}

                      <button
                        onClick={() => handleExport(activity.id, "csv")}
                        disabled={exporting}
                        className="px-3 py-1.5 text-xs bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition disabled:opacity-50"
                      >
                        📥 导出
                      </button>

                      <button
                        onClick={() => removeFromList(activity.id)}
                        className="px-3 py-1.5 text-xs bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition"
                      >
                        🗑️ 移除
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* 统计详情弹窗 */}
        <AnimatePresence>
          {showDetail && selectedActivity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDetail(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedActivity.title}</h3>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="text-white/60 hover:text-white text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-center py-4 bg-white/5 rounded-xl">
                    <div className="text-4xl font-bold text-white">{selectedActivity.totalVotes}</div>
                    <div className="text-white/60 text-sm">总票数</div>
                  </div>

                  <h4 className="text-white/80 font-medium">投票分布</h4>
                  <div className="space-y-3">
                    {selectedActivity.options.map((option, index) => (
                      <div key={option.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/80">{option.text}</span>
                          <span className="text-white/60">{option.votes} 票 ({option.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleExport(selectedActivity.id, "csv")}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    导出 CSV
                  </button>
                  <button
                    onClick={() => handleExport(selectedActivity.id, "excel")}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    导出 Excel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 编辑弹窗 */}
        <AnimatePresence>
          {showEditModal && editingActivity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">编辑活动</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-white/60 hover:text-white text-xl"
                  >
                    ✕
                  </button>
                </div>

                <EditForm
                  activity={editingActivity}
                  onSave={saveEdit}
                  onCancel={() => setShowEditModal(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// 编辑表单组件
function EditForm({
  activity,
  onSave,
  onCancel
}: {
  activity: ActivityDetail;
  onSave: (data: { title: string; description: string | null; options: Array<{ id: string; text: string }> }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description || "");
  const [options, setOptions] = useState(activity.options.map(o => ({ id: o.id, text: o.text })));
  const [saving, setSaving] = useState(false);

  const addOption = () => {
    setOptions([...options, { id: `opt_${Date.now()}`, text: "" }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("请输入活动标题");
      return;
    }
    const validOptions = options.filter(o => o.text.trim());
    if (validOptions.length < 2) {
      alert("至少需要2个选项");
      return;
    }

    setSaving(true);
    await onSave({
      title: title.trim(),
      description: description.trim() || null,
      options: validOptions,
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white/80 text-sm mb-1">活动标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-white/80 text-sm mb-1">活动描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-white/80 text-sm mb-1">投票选项</label>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {options.map((option, index) => (
            <div key={option.id} className="flex gap-2">
              <span className="flex items-center justify-center w-8 h-10 bg-white/10 rounded-lg text-white/60 text-sm">
                {index + 1}
              </span>
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOption(option.id, e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                placeholder={`选项 ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                disabled={options.length <= 2}
                className="px-3 text-red-400 hover:bg-red-500/20 rounded-lg disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= 10}
          className="mt-2 w-full py-2 border border-dashed border-white/30 text-white/60 rounded-lg hover:border-white/50 hover:text-white/80 transition disabled:opacity-50"
        >
          + 添加选项
        </button>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存修改"}
        </button>
      </div>
    </form>
  );
}