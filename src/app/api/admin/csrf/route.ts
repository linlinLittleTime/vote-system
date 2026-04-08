import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";
import { getAdminSession } from "@/lib/auth";

// GET - 获取 CSRF Token
export async function GET() {
  try {
    // 验证登录状态
    const isAuthenticated = await getAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 生成并设置 CSRF Token
    const token = generateCsrfToken();
    await setCsrfCookie(token);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("获取CSRF Token失败:", error);
    return NextResponse.json({ error: "获取CSRF Token失败" }, { status: 500 });
  }
}