import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 时序安全的Token比较（Edge Runtime 兼容版本）
function safeCompareToken(token: string, expected: string): boolean {
  if (!token || !expected) {
    return false;
  }

  // 长度不同时返回false，但仍然执行比较以防止时序攻击
  if (token.length !== expected.length) {
    // 执行虚假比较以保持恒定时间
    let _ = 0;
    for (let i = 0; i < expected.length; i++) {
      _ |= token.charCodeAt(i % token.length) ^ expected.charCodeAt(i);
    }
    return false;
  }

  // 恒定时间比较
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保护 /admin 路径（排除登录页）
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get("admin_token")?.value;
    const expectedToken = process.env.ADMIN_TOKEN;

    if (!adminToken || !safeCompareToken(adminToken, expectedToken || "")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};