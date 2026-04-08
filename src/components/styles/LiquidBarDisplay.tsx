"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { StyleDisplayProps } from "./index";

// 液态颜色配置
const liquidColors = [
  { start: "#06b6d4", end: "#3b82f6", glow: "rgba(6, 182, 212, 0.5)" }, // cyan-blue
  { start: "#8b5cf6", end: "#ec4899", glow: "rgba(139, 92, 246, 0.5)" }, // purple-pink
  { start: "#f43f5e", end: "#f97316", glow: "rgba(244, 63, 94, 0.5)" }, // rose-orange
  { start: "#10b981", end: "#06b6d4", glow: "rgba(16, 185, 129, 0.5)" }, // green-cyan
  { start: "#f59e0b", end: "#ef4444", glow: "rgba(245, 158, 11, 0.5)" }, // amber-red
  { start: "#6366f1", end: "#a855f7", glow: "rgba(99, 102, 241, 0.5)" }, // indigo-purple
  { start: "#14b8a6", end: "#22d3ee", glow: "rgba(20, 184, 166, 0.5)" }, // teal-cyan
  { start: "#f472b6", end: "#fb7185", glow: "rgba(244, 114, 182, 0.5)" }, // pink-rose
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export default function LiquidBarDisplay({
  title,
  options,
  totalVotes,
}: StyleDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const prevVotesRef = useRef<Record<string, number>>({});

  // 初始化之前的票数
  useEffect(() => {
    options.forEach((opt) => {
      if (prevVotesRef.current[opt.id] === undefined) {
        prevVotesRef.current[opt.id] = opt.votes;
      }
    });
  }, [options]);

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

  // 创建粒子
  const createParticles = useCallback((x: number, y: number, color: string, count: number = 5) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 2,
        size: Math.random() * 4 + 2,
        alpha: 1,
        color,
      });
    }
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
      timeRef.current += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const maxVotes = Math.max(...options.map((o) => o.votes), 1);
      const barWidth = Math.min(80, (canvas.width - 100) / options.length - 20);
      const gap = 30;
      const totalWidth = options.length * (barWidth + gap) - gap;
      const startX = (canvas.width - totalWidth) / 2;
      const baseY = canvas.height - 100;
      const maxHeight = canvas.height - 200;

      // 更新和绘制粒子
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // 重力
        p.alpha -= 0.02;

        if (p.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("0.5", String(p.alpha));
        ctx.fill();

        return true;
      });

      // 绘制每个柱体
      options.forEach((option, index) => {
        const targetHeight = Math.max((option.votes / maxVotes) * maxHeight, 20);
        const currentHeight = prevVotesRef.current[option.id] || targetHeight;

        // 平滑过渡
        const newHeight = currentHeight + (targetHeight - currentHeight) * 0.1;
        prevVotesRef.current[option.id] = newHeight;

        // 检测票数变化，创建粒子
        if (option.votes > (prevVotesRef.current[`${option.id}_prev`] || 0)) {
          const x = startX + index * (barWidth + gap) + barWidth / 2;
          const y = baseY - newHeight;
          createParticles(x, y, liquidColors[index % liquidColors.length].glow, 8);
        }
        prevVotesRef.current[`${option.id}_prev`] = option.votes;

        const x = startX + index * (barWidth + gap);
        const y = baseY - newHeight;
        const color = liquidColors[index % liquidColors.length];

        // 绘制发光效果
        ctx.shadowColor = color.glow;
        ctx.shadowBlur = 20;

        // 绘制柱体渐变
        const gradient = ctx.createLinearGradient(x, baseY, x, y);
        gradient.addColorStop(0, color.start);
        gradient.addColorStop(1, color.end);

        // 绘制柱体主体
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, newHeight, [8, 8, 0, 0]);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制液态波纹
        ctx.shadowBlur = 0;
        ctx.beginPath();
        const waveAmplitude = 5;
        const waveFrequency = 0.1;

        for (let i = 0; i <= barWidth; i++) {
          const waveY = y + Math.sin((i + timeRef.current * 50) * waveFrequency) * waveAmplitude;
          if (i === 0) {
            ctx.moveTo(x + i, waveY);
          } else {
            ctx.lineTo(x + i, waveY);
          }
        }
        ctx.lineTo(x + barWidth, y + 20);
        ctx.lineTo(x, y + 20);
        ctx.closePath();

        const waveGradient = ctx.createLinearGradient(x, y, x, y + 30);
        waveGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
        waveGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = waveGradient;
        ctx.fill();

        // 绘制高光
        ctx.beginPath();
        ctx.roundRect(x + 5, y + 10, barWidth / 3, newHeight - 30, 4);
        const highlightGradient = ctx.createLinearGradient(x, y, x + barWidth / 3, y);
        highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
        highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = highlightGradient;
        ctx.fill();

        // 绘制票数
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(`${option.votes}`, x + barWidth / 2, y - 25);

        // 绘制百分比
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "12px system-ui";
        ctx.fillText(`${option.percentage}%`, x + barWidth / 2, y - 45);

        // 绘制选项名称
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "14px system-ui";
        ctx.fillText(option.text, x + barWidth / 2, baseY + 30);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [options, dimensions, createParticles]);

  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-8 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          🌊 {title}
        </h1>
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20">
          <div className="text-3xl font-bold text-white">{totalVotes}</div>
          <div className="text-white/60 text-sm">总票数</div>
        </div>
      </motion.div>

      {/* Canvas 容器 */}
      <div
        ref={containerRef}
        className="relative z-10 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
        style={{ height: "calc(100vh - 350px)", minHeight: "400px" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />

        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
      </div>

      {/* 底部排行榜 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 relative z-10"
      >
        <div className="flex flex-wrap justify-center gap-3">
          {sortedOptions.map((option, index) => {
            const color = liquidColors[index % liquidColors.length];
            return (
              <div
                key={option.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 min-w-[140px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${color.start}, ${color.end})` }}
                  />
                  <span className="text-white/80 text-sm truncate">{option.text}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-white">{option.votes}</span>
                  <span className="text-white/50 text-xs">票</span>
                  <span className="text-white/40 text-xs ml-auto">{option.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 实时指示器 */}
      <div className="fixed top-4 right-4 z-20">
        <div className="bg-blue-500/20 backdrop-blur-md rounded-full px-3 py-2 flex items-center gap-2 border border-blue-500/30">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-blue-300 text-xs font-medium">实时</span>
        </div>
      </div>
    </div>
  );
}