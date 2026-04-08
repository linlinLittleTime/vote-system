import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { validateCsrfRequest } from "@/lib/csrf";
import type { ActivityOption, UpdateActivityRequest } from "@/types/api";

// GET - 获取活动详情（包含投票记录）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证登录状态
    const isAuthenticated = await getAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id } = await params;

    // 并行查询活动和投票统计
    const [activity, voteCounts, votes] = await Promise.all([
      prisma.activity.findUnique({
        where: { id },
        include: { style: true },
      }),
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

    if (!activity) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    // 构建票数映射
    const countMap = new Map(voteCounts.map((v) => [v.optionId, v._count.id]));

    // 计算每个选项的票数
    const options = activity.options as ActivityOption[];
    const optionsWithVotes = options.map((opt) => ({
      ...opt,
      voteCount: countMap.get(opt.id) || 0,
    }));

    // 按时间段统计投票
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const votesLast24h = votes.filter((v) => new Date(v.createdAt) >= last24h).length;
    const votesLast7d = votes.filter((v) => new Date(v.createdAt) >= last7d).length;

    return NextResponse.json({
      activity,
      optionsWithVotes,
      votes,
      statistics: {
        totalVotes: votes.length,
        votesLast24h,
        votesLast7d,
      },
    });
  } catch (error) {
    console.error("获取活动详情失败:", error);
    return NextResponse.json({ error: "获取活动详情失败" }, { status: 500 });
  }
}

// PUT - 编辑活动
export async function PUT(
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
    const body: UpdateActivityRequest = await request.json();
    const {
      title,
      description,
      options,
      ruleType,
      maxVotes,
      startTime,
      endTime,
      styleConfig,
    } = body;

    // 检查活动是否存在
    const existing = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    // 更新活动
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        options: options || existing.options,
        ruleType: ruleType || existing.ruleType,
        maxVotes: maxVotes !== undefined ? maxVotes : existing.maxVotes,
        startTime: startTime !== undefined ? (startTime ? new Date(startTime) : null) : existing.startTime,
        endTime: endTime !== undefined ? (endTime ? new Date(endTime) : null) : existing.endTime,
        styleConfig: styleConfig !== undefined ? styleConfig : existing.styleConfig,
      },
      include: { style: true },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("更新活动失败:", error);
    return NextResponse.json({ error: "更新活动失败" }, { status: 500 });
  }
}

// DELETE - 删除活动
export async function DELETE(
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

    // 检查活动是否存在
    const existing = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    // 删除活动（级联删除投票记录）
    await prisma.activity.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "活动已删除" });
  } catch (error) {
    console.error("删除活动失败:", error);
    return NextResponse.json({ error: "删除活动失败" }, { status: 500 });
  }
}