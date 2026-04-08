/**
 * 简单的内存限流器
 * 注意：在多实例部署时需要使用 Redis 替代
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// 存储限流数据
const rateLimitStore = new Map<string, RateLimitEntry>();

// 清理过期条目（每分钟执行一次）
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export interface RateLimitConfig {
  windowMs: number;  // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * 检查是否允许请求
 * @param key 限流键（如 IP + 路径）
 * @param config 限流配置
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // 新窗口
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  if (entry.count >= config.maxRequests) {
    // 超过限制
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // 增加计数
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * 获取客户端标识（用于限流）
 */
export function getClientIdentifier(request: Request): string {
  // 优先使用 X-Forwarded-For（代理后的真实IP）
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // 使用 X-Real-IP
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // 降级：使用 User-Agent 作为标识
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `ua_${hashString(userAgent)}`;
}

/**
 * 简单字符串哈希
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// 预定义的限流配置
export const RATE_LIMITS = {
  // 投票：每分钟最多 10 次
  vote: { windowMs: 60000, maxRequests: 10 },
  // 创建活动：每分钟最多 5 次
  createActivity: { windowMs: 60000, maxRequests: 5 },
  // 管理后台API：每分钟最多 100 次
  adminApi: { windowMs: 60000, maxRequests: 100 },
} as const;