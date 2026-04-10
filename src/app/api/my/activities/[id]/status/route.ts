import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 用户活动状态管理API
 *
 * PUT - 更改活动状态
 * 草稿 → 进行中：开始活动
 * 进行中 → 已结束：结束活动
 */

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "缺少userId参数" }, { status: 400 });
    }

    if (!status || !["draft", "active", "closed"].includes(status)) {
      return NextResponse.json({ error: "无效的状态" }, { status: 400 });
    }

    const existing = await prisma.activity.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "无权操作此活动" }, { status: 403 });
    }

    // 状态转换验证
    // draft → active: 允许（开始活动）
    // active → closed: 允许（结束活动）
    // 其他转换：不允许
    const validTransitions: Record<string, string[]> = {
      draft: ["active"],
      active: ["closed"],
      closed: [],
    };

    if (!validTransitions[existing.status]?.includes(status)) {
      return NextResponse.json({
        error: `无法从 ${existing.status} 状态切换到 ${status} 状态`
      }, { status: 400 });
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: { status },
      include: { style: true },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("更新状态失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}