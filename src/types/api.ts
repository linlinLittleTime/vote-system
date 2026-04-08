/**
 * 类型定义文件
 */

// ===== Prisma 相关类型 =====

export type Status = "draft" | "active" | "closed";
export type RuleType = "single" | "multiple";
export type VoterIdType = "localStorage" | "phone" | "wechat" | "ip_ua_fingerprint";

// 活动选项类型
export interface ActivityOption {
  id: string;
  text: string;
  imageUrl?: string | null;
  votes?: number;
}

// 活动基础类型
export interface ActivityBase {
  id: string;
  title: string;
  description?: string | null;
  status: Status;
  ruleType: RuleType;
  maxVotes?: number | null;
  voterIdType: VoterIdType;
  startTime?: Date | null;
  endTime?: Date | null;
  options: ActivityOption[];
  createdAt: Date;
  updatedAt: Date;
}

// 样式类型
export interface Style {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
}

// ===== API 请求类型 =====

// 创建活动请求
export interface CreateActivityRequest {
  title: string;
  description?: string;
  options: Array<{ text: string; imageUrl?: string } | string>;
  styleId?: string;
  ruleType?: RuleType;
  maxVotes?: number;
  voterIdType?: VoterIdType;
  startTime?: string;
  endTime?: string;
  status?: Status;
  styleConfig?: Record<string, unknown>;
}

// 更新活动请求
export interface UpdateActivityRequest {
  title?: string;
  description?: string | null;
  options?: ActivityOption[];
  ruleType?: RuleType;
  maxVotes?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  styleConfig?: Record<string, unknown> | null;
}

// 投票请求
export interface VoteRequest {
  activityId: string;
  optionIds?: string[];
  optionId?: string; // 兼容旧版单选
  voterId: string;
}

// 批量操作请求
export interface BatchOperationRequest {
  action: "delete" | "changeStatus";
  activityIds: string[];
  targetStatus?: Status;
}

// ===== API 响应类型 =====

// 活动列表响应
export interface ActivityListResponse {
  activities: ActivityWithVotes[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  statistics: {
    totalActivities: number;
    draftCount: number;
    activeCount: number;
    closedCount: number;
    totalVotes: number;
  };
}

// 带投票数的活动类型
export interface ActivityWithVotes extends ActivityBase {
  totalVotes: number;
  style?: Style | null;
}

// 投票结果
export interface VoteResult {
  success: boolean;
  votesCount?: number;
  optionIds?: string[];
  error?: string;
}

// 统计数据响应
export interface DashboardResponse {
  overview: {
    totalActivities: number;
    totalVotes: number;
    activeActivities: number;
    avgVotesPerActivity: number;
  };
  statusDistribution: {
    draft: number;
    active: number;
    closed: number;
  };
  dailyTrend: Array<{
    date: string;
    votes: number;
    newActivities: number;
  }>;
  hourlyTrend: Array<{
    hour: string;
    votes: number;
  }>;
  topActivities: Array<{
    id: string;
    title: string;
    votes: number;
    status: string;
  }>;
  styleUsage: Array<{
    name: string;
    count: number;
  }>;
}

// ===== Prisma Where 类型 =====

import { Prisma } from "../generated/prisma/client";

export type ActivityWhereInput = Prisma.ActivityWhereInput;
export type ActivityOrderByWithRelationInput = Prisma.ActivityOrderByWithRelationInput;

// ===== 错误响应类型 =====

export interface ErrorResponse {
  error: string;
  details?: string;
}

// ===== Rate Limit 响应头 =====

export interface RateLimitHeaders {
  "X-RateLimit-Remaining"?: string;
  "X-RateLimit-Reset"?: string;
  "Retry-After"?: string;
}