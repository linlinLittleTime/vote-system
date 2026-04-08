"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 全局错误边界组件
 * - 捕获客户端渲染错误
 * - 提供友好的错误提示
 * - 支持重试按钮
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到控制台（生产环境可上报到监控服务）
    console.error("全局错误:", error);
  }, [error]);

  // 根据错误类型显示不同提示
  const getErrorMessage = () => {
    if (error.message.includes("fetch")) {
      return "网络连接失败，请检查网络后重试";
    }
    if (error.message.includes("chunk")) {
      return "页面加载失败，请刷新页面";
    }
    return error.message || "发生未知错误";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-6xl mb-4"
        >
          😵
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          出错了
        </h1>

        <p className="text-gray-600 mb-6">
          {getErrorMessage()}
        </p>

        <div className="space-y-3">
          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
          >
            🔄 重试
          </motion.button>

          <button
            onClick={() => window.location.href = "/"}
            className="w-full py-3 text-gray-500 hover:text-gray-700 transition"
          >
            返回首页
          </button>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-400 mt-4">
            错误码: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}