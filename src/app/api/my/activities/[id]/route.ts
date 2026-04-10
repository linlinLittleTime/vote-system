import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

/**
 * 用户活动管理API - 单个活动的CRUD操作
 *
 * 所有操作都需要验证userId与活动的归属关系
 */

// GET - 获取活动详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "缺少userId参数" }, { status: 400 });
    }

    // 验证活动归属
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { style: true },
    });

    if (!activity) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    if (activity.userId !== userId) {
      return NextResponse.json({ error: "无权访问此活动" }, { status: 403 });
    }

    // 获取投票统计
    const [voteCounts, votes] = await Promise.all([
      prisma.vote.groupBy({
        by: ["optionId"],
        where: { activityId: id },
        _count: { id: true },
      }),
      prisma.vote.findMany({
        where: { activityId: id },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    const countMap = new Map(voteCounts.map((v) => [v.optionId, v._count.id]));
    const options = activity.options as unknown as Array<{ id: string; text: string; imageUrl?: string }>;
    const optionsWithVotes = options.map((opt) => ({
      ...opt,
      voteCount: countMap.get(opt.id) || 0,
    }));

    // 按时间段统计
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      activity,
      optionsWithVotes,
      votes,
      statistics: {
        totalVotes: votes.length,
        votesLast24h: votes.filter((v) => new Date(v.createdAt) >= last24h).length,
        votesLast7d: votes.filter((v) => new Date(v.createdAt) >= last7d).length,
      },
    });
  } catch (error) {
    console.error("获取活动详情失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// PUT - 编辑活动（仅草稿状态可编辑）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, title, description, options, ruleType, maxVotes, startTime, endTime, styleConfig } = body;

    if (!userId) {
      return NextResponse.json({ error: "缺少userId参数" }, { status: 400 });
    }

    // 检查活动归属和状态
    const existing = await prisma.activity.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "无权修改此活动" }, { status: 403 });
    }

    if (existing.status !== "draft") {
      return NextResponse.json({ error: "只有草稿状态的活动可以编辑" }, { status: 400 });
    }

    // 更新活动
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        options: (options || existing.options) as unknown as Prisma.InputJsonValue,
        ruleType: ruleType || existing.ruleType,
        maxVotes: maxVotes !== undefined ? maxVotes : existing.maxVotes,
        startTime: startTime !== undefined ? (startTime ? new Date(startTime) : null) : existing.startTime,
        endTime: endTime !== undefined ? (endTime ? new Date(endTime) : null) : existing.endTime,
        styleConfig: styleConfig !== undefined ? styleConfig : existing.styleConfig as unknown as Prisma.InputJsonValue,
      },
      include: { style: true },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("更新活动失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// DELETE - 删除活动（仅草稿状态可删除）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "缺少userId参数" }, { status: 400 });
    }

    const existing = await prisma.activity.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "无权删除此活动" }, { status: 403 });
    }

    if (existing.status !== "draft") {
      return NextResponse.json({ error: "只有草稿状态的活动可以删除" }, { status: 400 });
    }

    await prisma.activity.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "活动已删除" });
  } catch (error) {
    console.error("删除活动失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}