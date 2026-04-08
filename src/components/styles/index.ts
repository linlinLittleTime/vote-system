// 样式组件注册表
// 根据样式 slug 动态加载对应的展示组件

import type { ComponentType } from "react";

// 样式组件的统一 Props 类型
export interface StyleDisplayProps {
  activityId: string;
  title: string;
  options: Array<{
    id: string;
    text: string;
    imageUrl?: string; // 选项图片（可选）
    votes: number;
    percentage: number;
  }>;
  totalVotes: number;
}

// 懒加载样式组件映射
const styleComponents: Record<string, () => Promise<{ default: ComponentType<StyleDisplayProps> }>> = {
  "default-bar": () => import("./DefaultBarDisplay"),
  "card-flow": () => import("./CardFlowDisplay"),
  "crystal-bar": () => import("./CrystalBarDisplay"),
  "liquid-bar": () => import("./LiquidBarDisplay"),
  "donut-group": () => import("./DonutGroupDisplay"),
  "particle-rank": () => import("./ParticleRankDisplay"),
  "glass-card": () => import("./GlassCardDisplay"),
};

// 获取样式组件（动态加载）
export function getStyleComponent(slug: string) {
  const loader = styleComponents[slug];
  if (!loader) {
    // 默认使用极简柱状图
    return styleComponents["default-bar"];
  }
  return loader;
}

// 样式 slug 列表（用于验证）
export const styleSlugs = Object.keys(styleComponents);