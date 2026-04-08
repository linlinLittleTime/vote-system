"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
        <div className="text-white text-xl">活动不存在</div>
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{activity.title}</h1>
          <p className="text-white/80">活动已创建成功！</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 二维码卡片 */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
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
              <p className="text-sm text-purple-600 break-all">{voteUrl}</p>
            </div>
          </div>

          {/* 大屏入口 */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
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
          </div>
        </div>

        {/* 选项预览 */}
        <div className="mt-6 bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 投票选项</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activity.options.map((option) => (
              <div
                key={option.id}
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
              </div>
            ))}
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 text-white/80 hover:text-white transition"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  );
}