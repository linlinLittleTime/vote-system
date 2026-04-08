/**
 * 项目通用类型定义
 */

// ===== 活动相关类型 =====

export interface ActivityOption {
  id: string;
  text: string;
  imageUrl?: string | null;
  votes?: number;
}

export interface ActivityOptionWithVotes extends ActivityOption {
  votes: number;
  voteCount: number;
}

export interface ActivityStyle {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
  createdAt: Date;
}

export type RuleType = "single" | "multiple";
export type ActivityStatus = "draft" | "active" | "closed";
export type VoterIdType = "localStorage" | "phone" | "wechat" | "ip_ua_fingerprint";

export interface Activity {
  id: string;
  title: string;
  description?: string | null;
  styleId: string;
  style?: ActivityStyle;
  options: ActivityOption[];
  ruleType: RuleType;
  maxVotes?: number | null;
  voterIdType: VoterIdType;
  startTime?: Date | null;
  endTime?: Date | null;
  status: ActivityStatus;
  styleConfig?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityWithVotes extends Activity {
  totalVotes: number;
}

// ===== 投票相关类型 =====

export interface Vote {
  id: string;
  activityId: string;
  optionId: string;
  voterId: string;
  createdAt: Date;
}

// ===== API 请求/响应类型 =====

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
  status?: ActivityStatus;
  styleConfig?: Record<string, unknown>;
}

export interface VoteRequest {
  activityId: string;
  optionIds?: string[];
  optionId?: string; // 兼容旧版
  voterId: string;
}

export interface VoteResponse {
  success: boolean;
  votesCount: number;
  optionIds: string[];
}

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

export interface ActivityWhereInput {
  title?: { contains: string; mode: "insensitive" };
  status?: ActivityStatus;
}

// ===== 样式组件 Props =====

export interface StyleDisplayProps {
  activityId: string;
  title: string;
  options: Array<{
    id: string;
    text: string;
    imageUrl?: string;
    votes: number;
    percentage: number;
  }>;
  totalVotes: number;
}