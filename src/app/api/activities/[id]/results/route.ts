import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取投票结果（供大屏和投票页使用）- 优化版
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 并行查询活动数据和票数统计
    const [activity, voteCounts] = await Promise.all([
      prisma.activity.findUnique({
        where: { id },
        include: { style: true },
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

    // 更新选项的票数和百分比
    const optionsWithResults = (
      activity.options as Array<{ id: string; text: string; imageUrl?: string; votes: number }>
    ).map((opt) => ({
      id: opt.id,
      text: opt.text,
      imageUrl: opt.imageUrl || undefined,
      votes: votesMap.get(opt.id) || 0,
      percentage:
        totalVotes > 0
          ? Math.round(((votesMap.get(opt.id) || 0) / totalVotes) * 100)
          : 0,
    }));

    return NextResponse.json({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      options: optionsWithResults,
      totalVotes,
      style: activity.style,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      // P2新增字段
      ruleType: activity.ruleType,
      maxVotes: activity.maxVotes,
      voterIdType: activity.voterIdType,
      startTime: activity.startTime,
      endTime: activity.endTime,
      status: activity.status,
    }, {
      // 实时数据不缓存，每次重新请求
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("获取投票结果失败:", error);
    return NextResponse.json({ error: "获取投票结果失败" }, { status: 500 });
  }
}