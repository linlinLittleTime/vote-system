import { NextResponse } from "next/server";
import { setAdminCookie, clearAdminCookie, validateAdminToken } from "@/lib/auth";

// POST: 登录验证
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "请输入管理员Token" },
        { status: 400 }
      );
    }

    if (!validateAdminToken(token)) {
      return NextResponse.json(
        { success: false, error: "Token无效" },
        { status: 401 }
      );
    }

    await setAdminCookie(token);

    return NextResponse.json({
      success: true,
      message: "登录成功",
    });
  } catch (error) {
    console.error("登录失败:", error);
    return NextResponse.json(
      { success: false, error: "登录失败" },
      { status: 500 }
    );
  }
}

// DELETE: 退出登录
export async function DELETE() {
  try {
    await clearAdminCookie();
    return NextResponse.json({
      success: true,
      message: "已退出登录",
    });
  } catch (error) {
    console.error("退出登录失败:", error);
    return NextResponse.json(
      { success: false, error: "退出登录失败" },
      { status: 500 }
    );
  }
}