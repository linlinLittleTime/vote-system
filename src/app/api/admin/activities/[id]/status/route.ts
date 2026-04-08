import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { validateCsrfRequest } from "@/lib/csrf";
import type { Status } from "@/types/api";

// PATCH - 更新活动状态（带认证和CSRF保护）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证登录状态
    const isAuthenticated = await getAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // CSRF 验证
    const csrfValid = await validateCsrfRequest(request);
    if (!csrfValid) {
      return NextResponse.json({ error: "CSRF验证失败" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["draft", "active", "closed"].includes(status)) {
      return NextResponse.json(
        { error: "无效的活动状态" },
        { status: 400 }
      );
    }

    // 检查活动是否存在
    const existing = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    // 更新状态
    const activity = await prisma.activity.update({
      where: { id },
      data: { status: status as Status },
      include: { style: true },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("更新状态失败:", error);
    return NextResponse.json({ error: "更新状态失败" }, { status: 500 });
  }
}