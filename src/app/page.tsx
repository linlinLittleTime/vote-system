"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { getOrCreateUser, getCurrentUserId } from "@/lib/user";

interface Option {
  id: number;
  text: string;
  imageUrl: string;
}

interface Style {
  id: string;
  name: string;
  slug: string;
}

interface MyActivity {
  id: string;
  title: string;
  createdAt: string;
  totalVotes: number;
  status: string;
}

// 动态加载样式组件用于预览
const styleComponents: Record<string, React.ComponentType<any>> = {
  "default-bar": dynamic(() => import("@/components/styles/DefaultBarDisplay").then(mod => ({ default: mod.default || mod })), { ssr: false }),
  "card-flow": dynamic(() => import("@/components/styles/CardFlowDisplay").then(mod => ({ default: mod.default || mod })), { ssr: false }),
  "crystal-bar": dynamic(() => import("@/components/styles/CrystalBarDisplay").then(mod => ({ default: mod.default || mod })), { ssr: false }),
  "liquid-bar": dynamic(() => import("@/components/styles/LiquidBarDisplay").then(mod => ({ default: mod.default || mod })), { ssr: false }),
  "donut-group": dynamic(() => import("@/components/styles/DonutGroupDisplay").then(mod => ({ default: mod.default || mod })), { ssr: false }),
  "particle-rank": dynamic(() => import("@/components/styles/ParticleRankDisplay").then(mod => ({ default: mod.default || mod })), { ssr: false }),
  "glass-card": dynamic(() => import("@/components/styles/GlassCardDisplay").then(mod => ({ default: mod.default || mod })), { ssr: false }),
};

// 样式图标映射
const styleIcons: Record<string, string> = {
  "default-bar": "📊",
  "card-flow": "🎴",
  "crystal-bar": "💎",
  "liquid-bar": "🌊",
  "donut-group": "⭕",
  "particle-rank": "✨",
  "glass-card": "🪟",
};

// 样式描述映射
const styleDescriptions: Record<string, string> = {
  "default-bar": "经典柱状图",
  "card-flow": "清爽卡片布局",
  "crystal-bar": "立体水晶效果",
  "liquid-bar": "动态液态波纹",
  "donut-group": "圆环进度展示",
  "particle-rank": "粒子动画排行",
  "glass-card": "毛玻璃质感",
};

// 模拟数据用于预览
const mockOptions = [
  { id: "1", text: "选项 A", votes: 42, percentage: 35 },
  { id: "2", text: "选项 B", votes: 38, percentage: 32 },
  { id: "3", text: "选项 C", votes: 25, percentage: 21 },
  { id: "4", text: "选项 D", votes: 15, percentage: 12 },
];

// 状态标签颜色
const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-600",
  closed: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  draft: "草稿",
  active: "进行中",
  closed: "已结束",
};

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("示例投票活动");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { id: 1, text: "", imageUrl: "" },
    { id: 2, text: "", imageUrl: "" },
  ]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState<string | null>(null);

  // 文件上传相关
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 投票规则和活动设置
  const [ruleType, setRuleType] = useState<"single" | "multiple">("single");
  const [maxVotes, setMaxVotes] = useState<number>(3);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "active">("active");

  // 用户身份
  const [userId, setUserId] = useState<string>("");
  const [accessCode, setAccessCode] = useState<string>("");
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);

  // 我的活动
  const [myActivities, setMyActivities] = useState<MyActivity[]>([]);
  const [loadingMyActivities, setLoadingMyActivities] = useState(false);

  // 初始化用户身份
  useEffect(() => {
    const { userId, accessCode, isNew } = getOrCreateUser();
    setUserId(userId);
    setAccessCode(accessCode);
    if (isNew) {
      setShowAccessCodeModal(true);
    }
  }, []);

  // 获取样式列表
  useEffect(() => {
    fetch("/api/styles")
      .then((res) => res.json())
      .then((data) => {
        setStyles(data);
        if (data.length > 0) {
          setSelectedStyle(data[0].id);
        }
      })
      .catch((err) => console.error("获取样式失败:", err));
  }, []);

  // 加载我的活动
  useEffect(() => {
    if (userId) {
      loadMyActivities();
    }
  }, [userId]);

  const loadMyActivities = async () => {
    if (!userId) return;
    setLoadingMyActivities(true);
    try {
      const res = await fetch(`/api/my/activities?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMyActivities(data.activities.slice(0, 3));
      }
    } catch (err) {
      console.error("加载活动失败:", err);
    } finally {
      setLoadingMyActivities(false);
    }
  };

  const addOption = () => {
    if (options.length >= 10) {
      setError("最多添加10个选项");
      return;
    }
    setOptions([...options, { id: Date.now(), text: "", imageUrl: "" }]);
  };

  const removeOption = (id: number) => {
    if (options.length <= 2) {
      setError("至少需要2个选项");
      return;
    }
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const updateOption = (id: number, field: "text" | "imageUrl", value: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)));
  };

  const handleImageUpload = (optionId: number, file: File) => {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("请上传图片文件");
      return;
    }
    const maxSize = 100 * 1024;
    if (file.size > maxSize) {
      setUploadError(`图片大小不能超过100KB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateOption(optionId, "imageUrl", base64);
    };
    reader.onerror = () => setUploadError("图片读取失败");
    reader.readAsDataURL(file);
  };

  const clearImage = (optionId: number) => {
    updateOption(optionId, "imageUrl", "");
    const inputRef = fileInputRefs.current.get(optionId);
    if (inputRef) inputRef.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("请输入活动标题");
      return;
    }

    const validOptions = options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      setError("请填写至少2个选项");
      return;
    }

    if (!userId) {
      setError("请刷新页面重试");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          options: validOptions.map((opt) => ({
            text: opt.text.trim(),
            imageUrl: opt.imageUrl.trim() || undefined,
          })),
          styleId: selectedStyle,
          userId,
          ruleType,
          maxVotes: ruleType === "multiple" ? maxVotes : undefined,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          status,
        }),
      });

      if (!res.ok) throw new Error("创建失败");

      const activity = await res.json();
      router.push(`/activity/${activity.id}`);
    } catch (err) {
      setError("创建活动失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const copyAccessCode = async () => {
    try {
      await navigator.clipboard.writeText(accessCode);
      alert("访问码已复制！");
    } catch {
      alert("复制失败，请手动复制: " + accessCode);
    }
  };

  const selectedStyleData = styles.find((s) => s.id === selectedStyle);
  const styleSlug = selectedStyleData?.slug || "default-bar";
  const StyleComponent = styleComponents[styleSlug];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* 顶部导航栏 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold">🗳️ 投票系统</span>
            {accessCode && (
              <div className="hidden sm:flex items-center gap-2 text-white/80 text-sm">
                <span>访问码:</span>
                <code className="bg-white/20 px-2 py-0.5 rounded">{accessCode}</code>
                <button onClick={copyAccessCode} className="hover:text-white">📋</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              📊 我的工作台
            </button>
            <button
              onClick={() => setShowAccessCodeModal(true)}
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition"
            >
              🔑
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row min-h-screen pt-12">
        {/* 左侧：创建活动表单 */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-[440px] p-4 sm:p-6 flex-shrink-0"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sticky top-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
                🗳️
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">创建投票活动</h1>
                <p className="text-gray-500 text-xs">填写信息，选择样式，一键创建</p>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm overflow-hidden"
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 活动标题 */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  活动标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：最佳创意奖投票"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none transition text-sm focus:border-purple-500"
                />
              </motion.div>

              {/* 活动描述 */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  活动描述 <span className="text-gray-400 text-xs">(选填)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="活动简介或说明"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none transition resize-none text-sm focus:border-purple-500"
                />
              </motion.div>

              {/* 投票选项 */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  投票选项 <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-xs ml-2">({options.length}/10)</span>
                </label>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {options.map((option, index) => (
                      <motion.div
                        key={option.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, height: 0 }}
                        className="bg-gray-50 rounded-lg p-2.5 border border-gray-100"
                      >
                        <div className="flex gap-2">
                          <span className="flex items-center justify-center w-6 h-8 bg-purple-100 text-purple-600 rounded-md font-medium text-xs flex-shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(option.id, "text", e.target.value)}
                            placeholder={`选项 ${index + 1}`}
                            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md outline-none text-sm bg-white focus:border-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(option.id)}
                            disabled={options.length <= 2}
                            className="px-2 py-1.5 text-red-400 hover:text-red-500 rounded-md text-sm disabled:opacity-30"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  disabled={options.length >= 10}
                  className="mt-2 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-purple-400 hover:text-purple-500 transition text-sm disabled:opacity-50"
                >
                  + 添加选项
                </button>
              </motion.div>

              {/* 投票规则 */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">投票规则</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRuleType("single")}
                    className={`flex-1 py-2.5 rounded-lg border-2 transition text-sm font-medium ${
                      ruleType === "single" ? "border-purple-500 bg-purple-50 text-purple-600" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    🔘 单选
                  </button>
                  <button
                    type="button"
                    onClick={() => setRuleType("multiple")}
                    className={`flex-1 py-2.5 rounded-lg border-2 transition text-sm font-medium ${
                      ruleType === "multiple" ? "border-purple-500 bg-purple-50 text-purple-600" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    ☑️ 多选
                  </button>
                </div>
                {ruleType === "multiple" && (
                  <div className="mt-2">
                    <input
                      type="number"
                      min={1}
                      max={options.length}
                      value={maxVotes}
                      onChange={(e) => setMaxVotes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none"
                    />
                  </div>
                )}
              </motion.div>

              {/* 提交按钮 */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 text-sm shadow-lg"
              >
                {loading ? "创建中..." : "🚀 创建活动"}
              </motion.button>
            </form>

            {/* 我的活动 - 始终显示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">📁 我创建的活动</h3>
                <button onClick={() => router.push("/dashboard")} className="text-xs text-purple-600 hover:text-purple-700">
                  我的工作台 →
                </button>
              </div>
              {myActivities.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  暂无活动，创建后会自动保存在这里
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {myActivities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => router.push(`/activity/${activity.id}`)}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500">
                            {activity.totalVotes ?? 0} 票 · {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[activity.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabels[activity.status] || activity.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* 右侧：样式选择与预览 */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col min-h-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4"
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-white text-sm font-medium flex-shrink-0 px-2">🎨 样式：</span>
              {styles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex-shrink-0 ${
                    selectedStyle === style.id ? "bg-white text-purple-600 shadow-lg" : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {styleIcons[style.slug] || "📊"} {style.name}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative min-h-[400px]"
          >
            <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              实时预览
            </div>
            {StyleComponent && (
              <StyleComponent activityId="preview" title={title || "示例投票活动"} options={mockOptions} totalVotes={120} />
            )}
          </motion.div>
        </div>
      </div>

      {/* 访问码弹窗 */}
      <AnimatePresence>
        {showAccessCodeModal && accessCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAccessCodeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🔑</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">你的专属访问码</h3>
                <p className="text-gray-500 text-sm mb-6">请保存此码，换设备时可用于恢复数据</p>

                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6">
                  <code className="text-3xl font-bold text-purple-600 tracking-widest">{accessCode}</code>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { copyAccessCode(); }}
                    className="flex-1 py-3 bg-purple-100 text-purple-600 font-bold rounded-xl hover:bg-purple-200 transition"
                  >
                    📋 复制访问码
                  </button>
                  <button
                    onClick={() => setShowAccessCodeModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
                  >
                    我已保存
                  </button>
                </div>

                <p className="text-gray-400 text-xs mt-4">
                  💡 提示：访问码可在右上角 🔑 图标随时查看
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}