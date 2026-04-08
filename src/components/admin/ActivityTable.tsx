"use client";

import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";

interface Activity {
  id: string;
  title: string;
  status: string;
  totalVotes: number;
  createdAt: string;
  style?: { name: string };
}

interface ActivityTableProps {
  activities: Activity[];
  loading?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  selectedIds: string[];
  onSelect: (id: string, selected: boolean) => void;
}

export function ActivityTable({
  activities,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  selectedIds,
  onSelect,
}: ActivityTableProps) {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center">
        <div className="animate-pulse flex justify-center">
          <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
        </div>
        <p className="text-gray-400 mt-4">加载中...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">📭</div>
        <p className="text-gray-400">暂无活动数据</p>
        <a
          href="/"
          className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          创建第一个活动
        </a>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700/50">
              <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={selectedIds.length === activities.length}
                  onChange={(e) => {
                    activities.forEach((a) => onSelect(a.id, e.target.checked));
                  }}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-purple-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">标题</th>
              <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">状态</th>
              <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">样式</th>
              <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">票数</th>
              <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">创建时间</th>
              <th className="px-4 py-3 text-right text-gray-400 text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {activities.map((activity, index) => (
                <motion.tr
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-slate-700 hover:bg-slate-700/30 transition"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(activity.id)}
                      onChange={(e) => onSelect(activity.id, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-purple-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium truncate max-w-[200px]">
                      {activity.title}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={activity.status as any} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {activity.style?.name || "默认"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-purple-400 font-medium">{activity.totalVotes}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {format(new Date(activity.createdAt), "yyyy-MM-dd HH:mm")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onView(activity.id)}
                        className="px-2 py-1 text-xs bg-slate-700 text-gray-300 rounded hover:bg-slate-600"
                      >
                        查看
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(activity.id)}
                        className="px-2 py-1 text-xs bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/30"
                      >
                        编辑
                      </motion.button>
                      {/* 状态切换 */}
                      {activity.status === "draft" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onStatusChange(activity.id, "active")}
                          className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded hover:bg-green-600/30"
                        >
                          启动
                        </motion.button>
                      )}
                      {activity.status === "active" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onStatusChange(activity.id, "closed")}
                          className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
                        >
                          结束
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(activity.id)}
                        className="px-2 py-1 text-xs bg-red-600/10 text-red-400 rounded hover:bg-red-600/20"
                      >
                        删除
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}