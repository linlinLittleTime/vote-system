import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// 获取活动详情（优化版）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 并行查询活动和票数统计
    const [activity, voteCounts] = await Promise.all([
      prisma.activity.findUnique({
        where: { id },
      }),
      prisma.vote.groupBy({
        by: ["optionId"],
        where: { activityId: id },
        _count: { id: true },
      }),
    ]);

    if (!activity) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    // 构建票数映射
    const votesMap = new Map(voteCounts.map((v) => [v.optionId, v._count.id]));
    const totalVotes = voteCounts.reduce((sum, v) => sum + v._count.id, 0);

    // 更新选项的票数
    const optionsWithCounts = (activity.options as Array<{ id: string; text: string; votes: number }>).map(
      (opt) => ({
        ...opt,
        votes: votesMap.get(opt.id) || 0,
      })
    );

    return NextResponse.json({
      ...activity,
      options: optionsWithCounts,
      totalVotes,
    });
  } catch (error) {
    console.error("获取活动详情失败:", error);
    return NextResponse.json({ error: "获取活动详情失败" }, { status: 500 });
  }
}

// 更新活动内容（公开API，仅允许草稿状态的活动编辑）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, options } = body;

    // 检查活动是否存在
    const existing = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    // 只允许草稿状态的活动编辑
    if (existing.status !== "draft") {
      return NextResponse.json({ error: "只有草稿状态的活动才能编辑" }, { status: 400 });
    }

    // 验证输入
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "活动标题不能为空" }, { status: 400 });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: "至少需要2个选项" }, { status: 400 });
    }

    // 构建选项数据（保留票数为0）
    const optionsWithVotes = options.map((opt, index) => ({
      id: opt.id || `opt_${Date.now()}_${index}`,
      text: typeof opt === "string" ? opt.trim() : opt.text.trim(),
      imageUrl: typeof opt === "object" && opt.imageUrl ? opt.imageUrl.trim() : null,
      votes: 0,
    }));

    // 更新活动
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        options: optionsWithVotes as unknown as Prisma.InputJsonValue,
      },
      include: { style: true },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("更新活动失败:", error);
    return NextResponse.json({ error: "更新活动失败" }, { status: 500 });
  }
}