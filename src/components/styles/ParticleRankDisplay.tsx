"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StyleDisplayProps } from "./index";

// 粒子颜色配置
const particleColors = [
  { primary: "#fbbf24", secondary: "#f59e0b", glow: "rgba(251, 191, 36, 0.6)" }, // gold
  { primary: "#94a3b8", secondary: "#64748b", glow: "rgba(148, 163, 184, 0.6)" }, // silver
  { primary: "#cd7f32", secondary: "#b45309", glow: "rgba(205, 127, 50, 0.6)" }, // bronze
  { primary: "#3b82f6", secondary: "#2563eb", glow: "rgba(59, 130, 246, 0.6)" },
  { primary: "#8b5cf6", secondary: "#7c3aed", glow: "rgba(139, 92, 246, 0.6)" },
  { primary: "#ec4899", secondary: "#db2777", glow: "rgba(236, 72, 153, 0.6)" },
  { primary: "#10b981", secondary: "#059669", glow: "rgba(16, 185, 129, 0.6)" },
  { primary: "#f97316", secondary: "#ea580c", glow: "rgba(249, 115, 22, 0.6)" },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  alpha: number;
  speed: number;
}

export default function ParticleRankDisplay({
  title,
  options,
  totalVotes,
}: StyleDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);

  // 按票数排序
  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(...options.map((o) => o.votes), 1);

  // 更新尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 创建随机粒子
  const createRandomParticle = useCallback((targetX: number, targetY: number, color: string) => {
    const id = Date.now() + Math.random();
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 200;

    return {
      id,
      x: targetX + Math.cos(angle) * distance,
      y: targetY + Math.sin(angle) * distance,
      targetX,
      targetY,
      size: 2 + Math.random() * 4,
      color,
      alpha: 0.8 + Math.random() * 0.2,
      speed: 0.02 + Math.random() * 0.03,
    };
  }, []);

  // Canvas 动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const animate = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制粒子
      particlesRef.current = particlesRef.current.filter((p) => {
        // 向目标移动
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.x += dx * p.speed;
        p.y += dy * p.speed;
        p.alpha -= 0.005;

        if (p.alpha <= 0 || Math.abs(dx) < 1) return false;

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // 创建径向渐变
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, p.color.replace("0.6", String(p.alpha)));
        gradient.addColorStop(1, p.color.replace("0.6", "0"));

        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制尾迹
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - dx * 0.1, p.y - dy * 0.1);
        ctx.strokeStyle = p.color.replace("0.6", String(p.alpha * 0.3));
        ctx.lineWidth = p.size * 0.5;
        ctx.stroke();

        return true;
      });

      // 添加环境粒子（漂浮效果）
      for (let i = 0; i < 2; i++) {
        if (Math.random() < 0.1) {
          const x = Math.random() * canvas.width;
          const y = canvas.height + 10;
          particlesRef.current.push({
            id: Date.now() + Math.random(),
            x,
            y,
            targetX: x + (Math.random() - 0.5) * 100,
            targetY: -10,
            size: 1 + Math.random() * 2,
            color: "rgba(255, 255, 255, 0.3)",
            alpha: 0.3,
            speed: 0.005 + Math.random() * 0.01,
          });
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [dimensions]);

  // 触发粒子效果
  const triggerParticles = (index: number) => {
    const color = particleColors[index % particleColors.length].glow;
    const itemHeight = 80;
    const y = 120 + index * itemHeight + itemHeight / 2;
    const x = dimensions.width / 2;

    for (let i = 0; i < 15; i++) {
      particlesRef.current.push(createRandomParticle(x, y, color));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4 sm:p-8 overflow-hidden">
      {/* Canvas 背景 */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ width: dimensions.width, height: dimensions.height }}
      />

      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* 标题区 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          ✨ {title}
        </h1>
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20">
          <div className="text-3xl font-bold text-white">{totalVotes}</div>
          <div className="text-white/60 text-sm">总票数</div>
        </div>
      </motion.div>

      {/* 排行榜 */}
      <div ref={containerRef} className="max-w-2xl mx-auto relative z-10">
        <AnimatePresence mode="popLayout">
          {sortedOptions.map((option, index) => {
            const color = particleColors[index % particleColors.length];
            const barWidth = (option.votes / maxVotes) * 100;
            const isTop3 = index < 3;

            return (
              <motion.div
                key={option.id}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                  delay: index * 0.05,
                }}
                onClick={() => triggerParticles(index)}
                className="mb-3 cursor-pointer"
              >
                <div
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    isTop3
                      ? "bg-gradient-to-r from-white/10 to-white/5"
                      : "bg-white/5"
                  } border border-white/10 hover:border-white/20`}
                >
                  {/* 背景进度条 */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r opacity-20"
                    style={{
                      background: `linear-gradient(90deg, ${color.primary}, ${color.secondary})`,
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: barWidth / 100 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />

                  <div className="relative flex items-center gap-4 p-4">
                    {/* 排名 */}
                    <motion.div
                      layout
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900 shadow-lg shadow-yellow-500/30"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-lg shadow-gray-400/30"
                          : index === 2
                          ? "bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100 shadow-lg shadow-amber-600/30"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {index + 1}
                    </motion.div>

                    {/* 选项信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium truncate">
                          {option.text}
                        </span>
                        <div className="flex items-baseline gap-1 flex-shrink-0">
                          <motion.span
                            key={option.votes}
                            initial={{ scale: 1.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-xl font-bold text-white"
                          >
                            {option.votes}
                          </motion.span>
                          <span className="text-white/50 text-sm">票</span>
                        </div>
                      </div>

                      {/* 进度条 */}
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${color.primary}, ${color.secondary})`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${option.percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                        />
                      </div>
                    </div>

                    {/* 百分比 */}
                    <div className="text-right flex-shrink-0 w-14">
                      <span
                        className="text-lg font-bold"
                        style={{ color: color.primary }}
                      >
                        {option.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* 闪光效果（前三名） */}
                  {isTop3 && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: index * 0.3,
                      }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 底部提示 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-white/30 text-xs mt-8 relative z-10"
      >
        点击排行榜项可触发粒子效果 ✨
      </motion.p>

      {/* 实时指示器 */}
      <div className="fixed top-4 right-4 z-20">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-2 flex items-center gap-2 border border-white/20">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          <span className="text-white/80 text-xs font-medium">实时</span>
        </div>
      </div>
    </div>
  );
}