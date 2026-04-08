"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ActivityTable } from "@/components/admin/ActivityTable";
import { ActivityFilters } from "@/components/admin/ActivityFilters";
import { Pagination } from "@/components/admin/Pagination";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Activity {
  id: string;
  title: string;
  status: string;
  totalVotes: number;
  createdAt: string;
  style?: { name: string };
}

interface Statistics {
  totalActivities: number;
  draftCount: number;
  activeCount: number;
  closedCount: number;
  totalVotes: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { loading: authLoading } = useAdminAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  // 分页和筛选
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // 选中的活动ID
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 加载活动列表
  const loadActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
        search,
        status,
      });

      const res = await fetch(`/api/admin/activities?${params}`);
      const data = await res.json();

      if (res.ok) {
        setActivities(data.activities);
        setTotalPages(data.pagination.totalPages);
        setStatistics(data.statistics);
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
      loadActivities();
    }
  }, [page, search, status, authLoading]);

  // 选择处理
  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  // 查看活动
  const handleView = (id: string) => {
    router.push(`/admin/activities/${id}`);
  };

  // 编辑活动
  const handleEdit = (id: string) => {
    router.push(`/admin/activities/${id}`);
  };

  // 删除活动
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此活动吗？此操作不可恢复。")) return;

    try {
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadActivities();
      }
    } catch (err) {
      console.error("删除失败:", err);
    }
  };

  // 状态切换
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/activities/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadActivities();
      }
    } catch (err) {
      console.error("状态切换失败:", err);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 个活动吗？`)) return;

    try {
      const res = await fetch("/api/admin/activities/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          activityIds: selectedIds,
        }),
      });

      if (res.ok) {
        setSelectedIds([]);
        loadActivities();
      }
    } catch (err) {
      console.error("批量删除失败:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-gray-400">验证登录状态...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {statistics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">活动总数</div>
            <div className="text-2xl font-bold text-white">{statistics.totalActivities}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">进行中</div>
            <div className="text-2xl font-bold text-green-400">{statistics.activeCount}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">草稿</div>
            <div className="text-2xl font-bold text-gray-400">{statistics.draftCount}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">已结束</div>
            <div className="text-2xl font-bold text-red-400">{statistics.closedCount}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">总票数</div>
            <div className="text-2xl font-bold text-purple-400">{statistics.totalVotes}</div>
          </div>
        </motion.div>
      )}

      {/* 筛选和搜索 */}
      <ActivityFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {/* 批量操作 */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 p-3 bg-purple-600/20 border border-purple-600/30 rounded-lg"
        >
          <span className="text-purple-400 text-sm">
            已选中 {selectedIds.length} 个活动
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBatchDelete}
            className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition text-sm"
          >
            批量删除
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedIds([])}
            className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition text-sm"
          >
            取消选择
          </motion.button>
        </motion.div>
      )}

      {/* 活动列表 */}
      <ActivityTable
        activities={activities}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        selectedIds={selectedIds}
        onSelect={handleSelect}
      />

      {/* 分页 */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}