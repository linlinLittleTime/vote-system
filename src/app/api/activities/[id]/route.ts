import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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