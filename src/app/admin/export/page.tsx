"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function ExportPage() {
  const { loading: authLoading } = useAdminAuth();
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState("all");
  const [format, setFormat] = useState<"csv" | "excel">("csv");

  // 导出全部数据
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/export?format=${format}&status=${status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activities_${Date.now()}.${format === "csv" ? "csv" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("导出失败:", err);
      alert("导出失败，请重试");
    } finally {
      setExporting(false);
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">数据导出</h1>
        <p className="text-gray-400">导出活动数据和投票记录</p>
      </motion.div>

      {/* 导出配置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-6"
      >
        {/* 导出范围 */}
        <div>
          <label className="block text-white font-medium mb-3">导出范围</label>
          <div className="flex gap-3">
            {[
              { value: "all", label: "全部活动" },
              { value: "active", label: "进行中" },
              { value: "closed", label: "已结束" },
              { value: "draft", label: "草稿" },
            ].map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatus(opt.value)}
                className={`px-4 py-2 rounded-lg border transition ${
                  status === opt.value
                    ? "border-purple-500 bg-purple-500/20 text-purple-400"
                    : "border-slate-600 text-gray-400 hover:border-slate-500"
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 导出格式 */}
        <div>
          <label className="block text-white font-medium mb-3">导出格式</label>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormat("csv")}
              className={`flex-1 px-4 py-4 rounded-lg border transition ${
                format === "csv"
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-slate-600 hover:border-slate-500"
              }`}
            >
              <div className="text-2xl mb-2">📄</div>
              <div className={`font-medium ${format === "csv" ? "text-purple-400" : "text-white"}`}>
                CSV格式
              </div>
              <div className="text-gray-400 text-sm mt-1">通用表格格式</div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormat("excel")}
              className={`flex-1 px-4 py-4 rounded-lg border transition ${
                format === "excel"
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-slate-600 hover:border-slate-500"
              }`}
            >
              <div className="text-2xl mb-2">📊</div>
              <div className={`font-medium ${format === "excel" ? "text-purple-400" : "text-white"}`}>
                Excel格式
              </div>
              <div className="text-gray-400 text-sm mt-1">含投票记录明细</div>
            </motion.button>
          </div>
        </div>

        {/* 导出按钮 */}
        <motion.button
          whileHover={{ scale: exporting ? 1 : 1.02 }}
          whileTap={{ scale: exporting ? 1 : 0.98 }}
          onClick={handleExport}
          disabled={exporting}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              导出中...
            </span>
          ) : (
            "📤 开始导出"
          )}
        </motion.button>
      </motion.div>

      {/* 说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
      >
        <h3 className="text-white font-medium mb-2">导出说明</h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• CSV格式：适合数据处理和导入其他系统</li>
          <li>• Excel格式：包含活动列表和每个活动的投票记录明细</li>
          <li>• 导出文件将自动下载到您的设备</li>
        </ul>
      </motion.div>
    </div>
  );
}