"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

/**
 * 加载动画组件
 */
export function LoadingSpinner({
  size = "md",
  text,
  className = "",
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <div
        className={`${sizeMap[size]} animate-spin border-4 border-current border-t-transparent rounded-full`}
        style={{ borderColor: "currentColor" }}
      />
      {text && <div className="text-current">{text}</div>}
    </motion.div>
  );
}

/**
 * 全页加载组件
 */
export function PageLoading({ text = "加载中..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} className="text-white" />
    </div>
  );
}

/**
 * 骨架屏组件
 */
export function Skeleton({
  className = "",
  rounded = "rounded-lg",
}: {
  className?: string;
  rounded?: "rounded" | "rounded-lg" | "rounded-xl" | "rounded-full";
}) {
  return (
    <div
      className={`${className} bg-gray-200 animate-pulse ${rounded}`}
    />
  );
}

/**
 * 卡片骨架屏
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-3/4 h-3 mb-4" />
      <Skeleton className="w-full h-20" rounded="rounded-lg" />
    </div>
  );
}

/**
 * 表格行骨架屏
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="w-full h-4" />
        </td>
      ))}
    </tr>
  );
}