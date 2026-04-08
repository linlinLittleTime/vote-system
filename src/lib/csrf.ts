import { randomBytes } from "crypto";
import { cookies } from "next/headers";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf_token";

/**
 * 生成 CSRF Token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * 设置 CSRF Cookie
 */
export async function setCsrfCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1小时
    path: "/",
  });
}

/**
 * 获取 CSRF Token
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * 验证 CSRF Token
 */
async function validateCsrfTokenValue(token: string): Promise<boolean> {
  const expectedToken = await getCsrfToken();
  if (!expectedToken || !token) {
    return false;
  }

  // 恒定时间比较
  if (token.length !== expectedToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  return result === 0;
}

/**
 * 验证请求的 CSRF Token 或同源请求
 *
 * 简化版验证逻辑：
 * 1. 如果请求头包含有效的 X-CSRF-Token，验证通过
 * 2. 如果请求来自同源（检查 Origin/Referer），验证通过
 * 3. 否则验证失败
 */
export async function validateCsrfRequest(request: Request): Promise<boolean> {
  // 方法1：检查 CSRF Token 请求头
  const headerToken = request.headers.get("X-CSRF-Token");
  if (headerToken) {
    return validateCsrfTokenValue(headerToken);
  }

  // 方法2：检查同源请求（通过 Origin 或 Referer 头）
  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");

  // 获取当前主机
  const host = request.headers.get("Host") || "localhost:3000";
  const allowedOrigins = [
    `http://${host}`,
    `https://${host}`,
    // 开发环境允许 localhost
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  // 检查 Origin 头
  if (origin && allowedOrigins.some((o) => origin.startsWith(o))) {
    return true;
  }

  // 检查 Referer 头
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (allowedOrigins.some((o) => refererUrl.origin === new URL(o).origin)) {
        return true;
      }
    } catch {
      // URL 解析失败，忽略
    }
  }

  // 如果没有任何验证信息，返回 false
  return false;
}