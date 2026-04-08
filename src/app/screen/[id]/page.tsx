"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

// 类型定义
interface Option {
  id: string;
  text: string;
  votes: number;
  percentage: number;
  imageUrl?: string;
}

interface ActivityStyle {
  id: string;
  slug: string;
  name: string;
}

interface Activity {
  id: string;
  title: string;
  options: Option[];
  totalVotes: number;
  style: ActivityStyle | null;
}

// 轮询配置
const POLLING_INTERVAL = 5000; // 5秒轮询（优化：降低服务器压力）

// 动态加载样式组件
const styleComponents: Record<string, React.ComponentType<{
  activityId: string;
  title: string;
  options: Option[];
  totalVotes: number;
}>> = {
  "default-bar": dynamic(() => import("@/components/styles/DefaultBarDisplay"), { ssr: false }),
  "card-flow": dynamic(() => import("@/components/styles/CardFlowDisplay"), { ssr: false }),
  "crystal-bar": dynamic(() => import("@/components/styles/CrystalBarDisplay"), { ssr: false }),
  "liquid-bar": dynamic(() => import("@/components/styles/LiquidBarDisplay"), { ssr: false }),
  "donut-group": dynamic(() => import("@/components/styles/DonutGroupDisplay"), { ssr: false }),
  "particle-rank": dynamic(() => import("@/components/styles/ParticleRankDisplay"), { ssr: false }),
  "glass-card": dynamic(() => import("@/components/styles/GlassCardDisplay"), { ssr: false }),
};

export default function ScreenPage() {
  const params = useParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch(`/api/activities/${params.id}/results`);
      if (res.ok) {
        const data: Activity = await res.json();
        setActivity(data);
        setError(null);
      } else if (res.status === 404) {
        setError("活动不存在");
      } else {
        setError("加载失败");
      }
    } catch (err) {
      console.error("获取数据失败:", err);
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchActivity();
    // 定时刷新（优化：间隔改为5秒）
    const interval = setInterval(fetchActivity, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">加载中...</div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">{error || "活动不存在"}</div>
      </div>
    );
  }

  // 获取样式组件
  const styleSlug = activity.style?.slug || "default-bar";
  const StyleComponent = styleComponents[styleSlug] || styleComponents["default-bar"];

  return (
    <StyleComponent
      activityId={activity.id}
      title={activity.title}
      options={activity.options}
      totalVotes={activity.totalVotes}
    />
  );
}