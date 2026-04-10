"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LazyImage } from "@/components/ui/LazyImage";

interface Activity {
  id: string;
  title: string;
  description?: string;
  options: Array<{ id: string; text: string; imageUrl?: string; votes: number }>;
  createdAt: string;
}

export default function ActivityPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, [params.id]);

  const fetchActivity = async () => {
    try {
      const res = await fetch(`/api/activities/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setActivity(data);
      }
    } catch (error) {
      console.error("获取活动失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 复制链接
  const copyLink = async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const voteUrl = `${baseUrl}/vote/${activity?.id}`;
    try {
      await navigator.clipboard.writeText(voteUrl);
      alert("链接已复制到剪贴板！");
    } catch {
      // 降级方案
      const input = document.createElement("input");
      input.value = voteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      alert("链接已复制到剪贴板！");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">活动不存在</div>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-white text-purple-600 rounded-lg font-medium"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const voteUrl = `${baseUrl}/vote/${activity.id}`;
  const screenUrl = `${baseUrl}/screen/${activity.id}`;

  // 生成二维码URL (使用免费二维码API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(voteUrl)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 顶部导航栏 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-3"
        >
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition"
          >
            <span>←</span>
            <span>返回首页</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/my-activities")}
              className="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              📁 我的活动
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
            >
              + 创建新活动
            </button>
          </div>
        </motion.div>

        {/* 成功提示 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm mb-4">
            ✅ 活动创建成功！
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{activity.title}</h1>
          <p className="text-white/80">分享下方链接或二维码邀请参与者投票</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 二维码卡片 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-2xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              📱 扫码投票
            </h2>
            <div className="flex justify-center mb-4">
              <img
                src={qrCodeUrl}
                alt="投票二维码"
                className="w-48 h-48 border-4 border-gray-100 rounded-xl"
              />
            </div>
            <p className="text-center text-gray-500 text-sm mb-4">
              扫描二维码或分享链接参与投票
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">投票链接：</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-purple-600 break-all flex-1">{voteUrl}</p>
                <button
                  onClick={copyLink}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition flex-shrink-0"
                >
                  复制
                </button>
              </div>
            </div>
          </motion.div>

          {/* 大屏入口 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              🖥️ 大屏展示
            </h2>
            <div className="flex flex-col items-center justify-center h-48">
              <a
                href={screenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition text-lg"
              >
                打开大屏展示
              </a>
              <p className="text-gray-400 text-sm mt-4">
                适合投屏到电视或投影仪
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mt-4">
              <p className="text-xs text-gray-400 mb-1">大屏链接：</p>
              <p className="text-sm text-purple-600 break-all">{screenUrl}</p>
            </div>
          </motion.div>
        </div>

        {/* 快捷操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white rounded-2xl shadow-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 快捷操作</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => router.push(`/vote/${activity.id}`)}
              className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition text-center"
            >
              <div className="text-2xl mb-1">🗳️</div>
              <div className="text-sm text-gray-700">参与投票</div>
            </button>
            <button
              onClick={() => router.push(`/screen/${activity.id}`)}
              className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-center"
            >
              <div className="text-2xl mb-1">🖥️</div>
              <div className="text-sm text-gray-700">大屏展示</div>
            </button>
            <button
              onClick={() => router.push("/my-activities")}
              className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition text-center"
            >
              <div className="text-2xl mb-1">📊</div>
              <div className="text-sm text-gray-700">查看统计</div>
            </button>
            <button
              onClick={copyLink}
              className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition text-center"
            >
              <div className="text-2xl mb-1">📋</div>
              <div className="text-sm text-gray-700">复制链接</div>
            </button>
          </div>
        </motion.div>

        {/* 选项预览 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white rounded-2xl shadow-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 投票选项</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activity.options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                {option.imageUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden">
                    <LazyImage
                      src={option.imageUrl}
                      alt={option.text}
                      className="w-full h-20 object-cover"
                      placeholderClassName="w-full h-20"
                    />
                  </div>
                )}
                <span className="text-gray-700">{option.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 底部提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-white/60 text-sm"
        >
          💡 活动已自动保存到"我的活动"，随时可以查看投票统计和导出数据
        </motion.div>
      </div>
    </div>
  );
}