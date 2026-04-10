"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

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

// localStorage key
const MY_ACTIVITIES_KEY = "vote_system_my_activities";

// 保存活动到localStorage
function saveActivityToLocalStorage(activity: { id: string; title: string; createdAt: string }) {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(MY_ACTIVITIES_KEY);
  const activities = stored ? JSON.parse(stored) : [];

  // 避免重复
  if (!activities.find((a: { id: string }) => a.id === activity.id)) {
    activities.unshift(activity);
    // 最多保存50个
    if (activities.length > 50) activities.pop();
    localStorage.setItem(MY_ACTIVITIES_KEY, JSON.stringify(activities));
  }
}

// 从localStorage获取活动列表
function getActivitiesFromLocalStorage(): Array<{ id: string; title: string; createdAt: string }> {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(MY_ACTIVITIES_KEY);
  return stored ? JSON.parse(stored) : [];
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

  // P2新增：投票规则和活动设置
  const [ruleType, setRuleType] = useState<"single" | "multiple">("single");
  const [maxVotes, setMaxVotes] = useState<number>(3);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "active">("active");

  // 我的活动
  const [myActivities, setMyActivities] = useState<MyActivity[]>([]);
  const [loadingMyActivities, setLoadingMyActivities] = useState(false);

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
    loadMyActivities();
  }, []);

  const loadMyActivities = async () => {
    const localActivities = getActivitiesFromLocalStorage();
    if (localActivities.length === 0) {
      setMyActivities([]);
      return;
    }

    setLoadingMyActivities(true);
    try {
      // 批量获取活动详情
      const ids = localActivities.map((a) => a.id);
      const res = await fetch("/api/activities/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (res.ok) {
        const activities = await res.json();
        // 合并本地存储的顺序和服务器数据
        const merged = localActivities.map((local) => {
          const server = activities.find((a: MyActivity) => a.id === local.id);
          return server || local;
        }).filter((a): a is MyActivity => !!a);
        setMyActivities(merged);
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

  // 处理图片上传
  const handleImageUpload = (optionId: number, file: File) => {
    setUploadError(null);

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      setUploadError("请上传图片文件");
      return;
    }

    // 验证文件大小 (<100KB)
    const maxSize = 100 * 1024; // 100KB
    if (file.size > maxSize) {
      setUploadError(`图片大小不能超过100KB（当前${Math.round(file.size / 1024)}KB）`);
      return;
    }

    // 转换为Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateOption(optionId, "imageUrl", base64);
    };
    reader.onerror = () => {
      setUploadError("图片读取失败");
    };
    reader.readAsDataURL(file);
  };

  // 清除图片
  const clearImage = (optionId: number) => {
    updateOption(optionId, "imageUrl", "");
    // 清空文件输入
    const inputRef = fileInputRefs.current.get(optionId);
    if (inputRef) {
      inputRef.value = "";
    }
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
          // P2新增字段
          ruleType,
          maxVotes: ruleType === "multiple" ? maxVotes : undefined,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error("创建失败");
      }

      const activity = await res.json();

      // 保存到localStorage
      saveActivityToLocalStorage({
        id: activity.id,
        title: activity.title,
        createdAt: activity.createdAt,
      });

      router.push(`/activity/${activity.id}`);
    } catch (err) {
      setError("创建活动失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 获取当前选中的样式组件
  const selectedStyleData = styles.find((s) => s.id === selectedStyle);
  const styleSlug = selectedStyleData?.slug || "default-bar";
  const StyleComponent = styleComponents[styleSlug];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* 左侧：创建活动表单 */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-[440px] p-4 sm:p-6 flex-shrink-0"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sticky top-6">
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  活动标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setActiveField("title")}
                  onBlur={() => setActiveField(null)}
                  placeholder="例如：最佳创意奖投票"
                  className={`w-full px-3 py-2.5 border rounded-lg outline-none transition text-sm ${
                    activeField === "title"
                      ? "border-purple-500 ring-2 ring-purple-500/20"
                      : "border-gray-300 focus:border-purple-500"
                  }`}
                />
                <div className="text-gray-400 text-xs mt-1 text-right">{title.length}/50</div>
              </motion.div>

              {/* 活动描述 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  活动描述 <span className="text-gray-400 text-xs">(选填)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setActiveField("description")}
                  onBlur={() => setActiveField(null)}
                  placeholder="活动简介或说明"
                  rows={2}
                  className={`w-full px-3 py-2.5 border rounded-lg outline-none transition resize-none text-sm ${
                    activeField === "description"
                      ? "border-purple-500 ring-2 ring-purple-500/20"
                      : "border-gray-300 focus:border-purple-500"
                  }`}
                />
              </motion.div>

              {/* 投票选项 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  投票选项 <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-xs ml-2">({options.length}/10)</span>
                </label>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
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
                        <div className="flex gap-2 mb-1.5">
                          <span className="flex items-center justify-center w-6 h-8 bg-purple-100 text-purple-600 rounded-md font-medium text-xs flex-shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(option.id, "text", e.target.value)}
                            placeholder={`选项 ${index + 1}`}
                            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(option.id)}
                            disabled={options.length <= 2}
                            className="px-2 py-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-md transition text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            ✕
                          </button>
                        </div>
                        {/* 图片上传区域 */}
                        <div className="space-y-1.5">
                          {/* 上传错误提示 */}
                          <AnimatePresence>
                            {uploadError && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-red-500 px-1"
                              >
                                ⚠️ {uploadError}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 图片预览 */}
                          {option.imageUrl && (
                            <div className="relative inline-block">
                              <img
                                src={option.imageUrl}
                                alt="选项图片"
                                className="h-16 w-auto rounded-md border border-gray-200 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => clearImage(option.id)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition"
                              >
                                ×
                              </button>
                            </div>
                          )}

                          {/* 上传和URL输入 */}
                          <div className="flex items-center gap-2">
                            {/* 本地上传按钮 */}
                            <input
                              ref={(el) => {
                                if (el) fileInputRefs.current.set(option.id, el);
                              }}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(option.id, file);
                              }}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current.get(option.id)?.click()}
                              className="px-2 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded-md text-xs hover:bg-purple-100 transition flex items-center gap-1"
                            >
                              📤 上传
                            </button>

                            {/* 或分隔 */}
                            <span className="text-gray-300 text-xs">或</span>

                            {/* URL输入 */}
                            <input
                              type="text"
                              value={option.imageUrl && !option.imageUrl.startsWith("data:") ? option.imageUrl : ""}
                              onChange={(e) => updateOption(option.id, "imageUrl", e.target.value)}
                              placeholder="图片URL"
                              className="flex-1 px-2 py-1 border border-gray-100 rounded-md focus:ring-1 focus:ring-purple-400 outline-none transition text-xs bg-white text-gray-600"
                              disabled={option.imageUrl?.startsWith("data:")}
                            />
                          </div>
                          <p className="text-gray-400 text-xs pl-1">支持本地上传(&lt;100KB)或URL链接</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <motion.button
                  type="button"
                  onClick={addOption}
                  disabled={options.length >= 10}
                  whileHover={{ scale: options.length < 10 ? 1.01 : 1 }}
                  whileTap={{ scale: options.length < 10 ? 0.99 : 1 }}
                  className="mt-2 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-purple-400 hover:text-purple-500 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + 添加选项
                </motion.button>
              </motion.div>

              {/* P2新增：投票规则 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  投票规则
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRuleType("single")}
                    className={`flex-1 py-2.5 rounded-lg border-2 transition text-sm font-medium ${
                      ruleType === "single"
                        ? "border-purple-500 bg-purple-50 text-purple-600"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    🔘 单选
                  </button>
                  <button
                    type="button"
                    onClick={() => setRuleType("multiple")}
                    className={`flex-1 py-2.5 rounded-lg border-2 transition text-sm font-medium ${
                      ruleType === "multiple"
                        ? "border-purple-500 bg-purple-50 text-purple-600"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    ☑️ 多选
                  </button>
                </div>
                {/* 多选时显示最大可选数 */}
                {ruleType === "multiple" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <label className="block text-xs text-gray-500 mb-1">
                      最大可选数
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={options.length}
                      value={maxVotes}
                      onChange={(e) => setMaxVotes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      当前可选 1-{options.length} 项
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* P2新增：活动有效期 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  活动有效期 <span className="text-gray-400 text-xs">(选填)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">开始时间</label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">结束时间</label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                {startTime && endTime && new Date(endTime) <= new Date(startTime) && (
                  <p className="text-xs text-red-500 mt-1">结束时间需大于开始时间</p>
                )}
              </motion.div>

              {/* P2新增：活动状态 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  活动状态
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "draft" | "active")}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none bg-white"
                >
                  <option value="active">🚀 立即开始</option>
                  <option value="draft">📝 保存为草稿</option>
                </select>
              </motion.div>

              {/* 提交按钮 */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-purple-500/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity:75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    创建中...
                  </span>
                ) : (
                  "🚀 创建活动"
                )}
              </motion.button>
            </form>

            {/* 我的活动 */}
            {myActivities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800">📁 我创建的活动</h3>
                  <button
                    onClick={() => router.push("/my-activities")}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    查看全部 →
                  </button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {myActivities.slice(0, 3).map((activity) => (
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
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* 右侧：样式选择与预览 */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col min-h-0">
          {/* 样式选择栏 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4"
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-white text-sm font-medium flex-shrink-0 px-2">🎨 样式：</span>
              {styles.map((style, index) => (
                <motion.button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition flex-shrink-0 ${
                    selectedStyle === style.id
                      ? "bg-white text-purple-600 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{styleIcons[style.slug] || "📊"}</span>
                    <span>{style.name}</span>
                  </span>
                  {selectedStyle === style.id && (
                    <motion.div
                      layoutId="styleIndicator"
                      className="absolute inset-0 bg-white rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            {/* 样式描述 */}
            <div className="mt-2 text-white/60 text-xs px-2">
              {styleDescriptions[styleSlug] || "选择展示样式"}
            </div>
          </motion.div>

          {/* 预览区域 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative min-h-[400px]"
          >
            {/* 预览标签 */}
            <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              实时预览
            </div>

            {/* 当前样式名称 */}
            <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/10">
              {selectedStyleData?.name}
            </div>

            {/* 样式组件预览 */}
            <AnimatePresence mode="wait">
              {StyleComponent && (
                <motion.div
                  key={styleSlug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full overflow-auto"
                >
                  <StyleComponent
                    activityId="preview"
                    title={title || "示例投票活动"}
                    options={mockOptions}
                    totalVotes={120}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}