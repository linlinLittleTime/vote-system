import { cookies } from "next/headers";

// 时序安全的Token比较（防止时序攻击）
export function validateAdminToken(token: string): boolean {
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken || !token) {
    return false;
  }

  // 长度不同时返回false，但仍然执行比较以防止时序攻击
  if (token.length !== expectedToken.length) {
    // 执行虚假比较以保持恒定时间
    const fakeToken = expectedToken;
    let _ = 0;
    for (let i = 0; i < fakeToken.length; i++) {
      _ |= token.charCodeAt(i % token.length) ^ fakeToken.charCodeAt(i);
    }
    return false;
  }

  // 恒定时间比较
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  return result === 0;
}

// 获取当前登录状态（服务端）
export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token")?.value;
  return validateAdminToken(adminToken || "");
}

// 设置管理员Cookie
export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: "/",
  });
}

// 清除管理员Cookie
export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
}