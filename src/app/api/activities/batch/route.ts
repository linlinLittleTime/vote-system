import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 批量获取活动信息（供用户查看自己创建的活动）
export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json([]);
    }

    // 限制最多查询50个
    const limitedIds = ids.slice(0, 50);

    // 并行查询活动和票数
    const [activities, voteCounts] = await Promise.all([
      prisma.activity.findMany({
        where: { id: { in: limitedIds } },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          startTime: true,
          endTime: true,
          ruleType: true,
        },
      }),
      prisma.vote.groupBy({
        by: ["activityId"],
        where: { activityId: { in: limitedIds } },
        _count: { id: true },
      }),
    ]);

    // 构建票数映射
    const votesMap = new Map(voteCounts.map((v) => [v.activityId, v._count.id]));

    // 合并数据
    const result = activities.map((activity) => ({
      ...activity,
      totalVotes: votesMap.get(activity.id) || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("批量获取活动失败:", error);
    return NextResponse.json({ error: "获取活动失败" }, { status: 500 });
  }
}