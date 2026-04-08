"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LazyImage } from "@/components/ui/LazyImage";

interface Option {
  id: string;
  text: string;
  imageUrl?: string;
  votes: number;
  percentage?: number;
}

// P2新增：活动状态和规则类型
type Status = "draft" | "active" | "closed";
type RuleType = "single" | "multiple";

interface Activity {
  id: string;
  title: string;
  description?: string;
  options: Option[];
  totalVotes: number;
  // P2新增字段
  ruleType: RuleType;
  maxVotes?: number;
  startTime?: string;
  endTime?: string;
  status: Status;
}

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  // P2修改：selectedOptions改为数组，支持多选
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [error, setError] = useState("");

  // 获取或创建投票者ID
  const getVoterId = () => {
    if (typeof window === "undefined") return "";
    let voterId = localStorage.getItem("voter_id");
    if (!voterId) {
      voterId = crypto.randomUUID();
      localStorage.setItem("voter_id", voterId);
    }
    return voterId;
  };

  useEffect(() => {
    // 检查是否已投票
    const voterId = getVoterId();
    const votedActivities = JSON.parse(
      localStorage.getItem("voted_activities") || "{}"
    );
    if (votedActivities[params.id as string]) {
      setVoted(true);
      // P2修改：支持多选，votedActivities存储的是已投票的选项数组
      const votedOptions = votedActivities[params.id as string];
      setSelectedOptions(Array.isArray(votedOptions) ? votedOptions : [votedOptions]);
    }

    fetchActivity();
  }, [params.id]);

  const fetchActivity = async () => {
    try {
      const res = await fetch(`/api/activities/${params.id}/results`);
      if (res.ok) {
        const data = await res.json();
        setActivity(data);

        // P2新增：检查活动状态和有效期
        if (data.status === "draft") {
          setError("活动未开始，请等待管理员开启");
        } else if (data.status === "closed") {
          setError("活动已结束");
          setVoted(true); // 显示结果
        } else if (data.endTime && new Date(data.endTime) < new Date()) {
          setError("活动已过期");
          setVoted(true); // 显示结果
        } else if (data.startTime && new Date(data.startTime) > new Date()) {
          setError(`活动将于 ${new Date(data.startTime).toLocaleString()} 开始`);
        }
      } else {
        setError("活动不存在");
      }
    } catch (error) {
      console.error("获取活动失败:", error);
      setError("获取活动失败");
    } finally {
      setLoading(false);
    }
  };

  // P2新增：多选处理逻辑
  const handleOptionClick = (optionId: string) => {
    if (voted) return;

    if (activity?.ruleType === "single") {
      // 单选：直接设置
      setSelectedOptions([optionId]);
    } else {
      // 多选：切换选中状态
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        // 检查是否达到maxVotes限制
        if (activity?.maxVotes && selectedOptions.length >= activity.maxVotes) {
          setError(`最多可选 ${activity.maxVotes} 项`);
          return;
        }
        setSelectedOptions([...selectedOptions, optionId]);
      }
    }
    setError("");
  };

  // P2新增：检查是否可以投票
  const canVote = () => {
    if (!activity) return false;
    if (activity.status !== "active") return false;
    if (activity.endTime && new Date(activity.endTime) < new Date()) return false;
    if (activity.startTime && new Date(activity.startTime) > new Date()) return false;
    if (selectedOptions.length === 0) return false;
    return true;
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      setError("请选择投票选项");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const voterId = getVoterId();
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: params.id,
          optionIds: selectedOptions, // P2修改：传递数组
          voterId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "投票失败");
      }

      // 记录已投票
      const votedActivities = JSON.parse(
        localStorage.getItem("voted_activities") || "{}"
      );
      votedActivities[params.id as string] = selectedOptions;
      localStorage.setItem("voted_activities", JSON.stringify(votedActivities));

      setVoted(true);
      // 刷新活动数据
      await fetchActivity();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("投票失败，请重试");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // P2新增：格式化时间显示
  const formatTime = (time?: string) => {
    if (!time) return "";
    return new Date(time).toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full"></div>
          <div className="text-white text-xl">加载中...</div>
        </motion.div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-5xl mb-4">❌</div>
          <div className="text-xl mb-4">活动不存在</div>
          <button onClick={() => router.push("/")} className="underline hover:text-white/80">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">{activity.title}</h1>
          {activity.description && (
            <p className="text-white/70 text-sm mb-2">{activity.description}</p>
          )}

          {/* P2新增：活动状态和时间信息 */}
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {activity.status === "draft" && (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-100 rounded-full text-sm">
                ⏳ 未开始
              </span>
            )}
            {activity.status === "active" && (
              <span className="px-3 py-1 bg-green-500/20 text-green-100 rounded-full text-sm">
                ✅ 进行中
              </span>
            )}
            {activity.status === "closed" && (
              <span className="px-3 py-1 bg-red-500/20 text-red-100 rounded-full text-sm">
                🔒 已结束
              </span>
            )}
            {activity.startTime && activity.status === "active" && (
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                开始: {formatTime(activity.startTime)}
              </span>
            )}
            {activity.endTime && (
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                截止: {formatTime(activity.endTime)}
              </span>
            )}
          </div>

          {/* P2新增：投票规则提示 */}
          {!voted && activity.status === "active" && (
            <p className="text-white/80 text-sm">
              {activity.ruleType === "single"
                ? "请选择一个选项"
                : `请选择选项（最多 ${activity.maxVotes || activity.options.length} 项）`}
            </p>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-300 text-white rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {voted ? (
              // 已投票 - 显示结果
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-5xl mb-2"
                  >
                    ✅
                  </motion.div>
                  <p className="text-gray-600">您已成功投票</p>
                </div>
                <div className="space-y-4">
                  {activity.options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <div
                        className={`p-4 rounded-xl border-2 transition ${
                          selectedOptions.includes(option.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-100"
                        }`}
                      >
                        {/* 选项图片 */}
                        {option.imageUrl && (
                          <div className="mb-3 rounded-lg overflow-hidden">
                            <LazyImage
                              src={option.imageUrl}
                              alt={option.text}
                              className="w-full h-24 object-cover"
                              placeholderClassName="w-full h-24"
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{option.text}</span>
                          <span className="text-blue-600 font-bold">
                            {option.percentage || 0}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${option.percentage || 0}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {option.votes} 票
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 text-center text-gray-500">
                  共 {activity.totalVotes} 人参与投票
                </div>
              </motion.div>
            ) : (
              // 未投票 - 显示选项
              <motion.div
                key="options"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* P2新增：已选数量提示 */}
                {activity.ruleType === "multiple" && selectedOptions.length > 0 && (
                  <div className="mb-4 text-center text-sm text-gray-600">
                    已选择 {selectedOptions.length} / {activity.maxVotes || activity.options.length} 项
                  </div>
                )}

                <div className="space-y-3">
                  {activity.options.map((option, index) => {
                    // P2新增：多选时达到maxVotes后禁用未选项
                    const isDisabled = activity.ruleType === "multiple"
                      && activity.maxVotes
                      && selectedOptions.length >= activity.maxVotes
                      && !selectedOptions.includes(option.id);

                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id)}
                        disabled={isDisabled || activity.status !== "active"}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition ${
                          selectedOptions.includes(option.id)
                            ? "border-blue-500 bg-blue-50"
                            : isDisabled
                            ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        {/* 选项图片 */}
                        {option.imageUrl && (
                          <div className="mb-3 rounded-lg overflow-hidden">
                            <LazyImage
                              src={option.imageUrl}
                              alt={option.text}
                              className="w-full h-24 object-cover"
                              placeholderClassName="w-full h-24"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          {/* P2修改：多选使用checkbox样式 */}
                          <div
                            className={`w-5 h-5 ${
                              activity.ruleType === "single"
                                ? "rounded-full"
                                : "rounded"
                            } border-2 flex items-center justify-center transition ${
                              selectedOptions.includes(option.id)
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedOptions.includes(option.id) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`${activity.ruleType === "single" ? "w-2 h-2 rounded-full" : "w-3 h-3"} bg-white ${
                                  activity.ruleType === "multiple" ? "rounded-sm" : ""
                                }`}
                              />
                            )}
                          </div>
                          <span className={`font-medium ${isDisabled ? "text-gray-400" : ""}`}>
                            {option.text}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  onClick={handleVote}
                  disabled={submitting || !canVote()}
                  whileHover={{ scale: canVote() ? 1.02 : 1 }}
                  whileTap={{ scale: canVote() ? 0.98 : 1 }}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      提交中...
                    </span>
                  ) : (
                    `提交投票 ${selectedOptions.length > 0 ? `(${selectedOptions.length}项)` : ""}`
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 大屏入口 */}
        <div className="mt-6 text-center">
          <a
            href={`/screen/${activity.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition text-sm"
          >
            🖥️ 查看大屏展示
          </a>
        </div>
      </div>
    </div>
  );
}