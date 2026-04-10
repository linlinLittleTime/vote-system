import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 用户工作台API - 获取用户创建的活动
 *
 * 请求参数：userId (query param)
 * 响应：用户的活动列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "缺少userId参数" }, { status: 400 });
    }

    // 获取用户的所有活动
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { style: true },
    });

    // 批量获取票数
    const activityIds = activities.map((a) => a.id);
    const votesByActivity = await prisma.vote.groupBy({
      by: ["activityId"],
      where: { activityId: { in: activityIds } },
      _count: { id: true },
    });

    const votesMap = new Map(
      votesByActivity.map((v) => [v.activityId, v._count.id])
    );

    // 合并数据
    const activitiesWithVotes = activities.map((activity) => ({
      ...activity,
      options: activity.options as Array<{ id: string; text: string; votes?: number }>,
      totalVotes: votesMap.get(activity.id) || 0,
    }));

    // 统计摘要
    const statistics = {
      totalActivities: activities.length,
      draftCount: activities.filter((a) => a.status === "draft").length,
      activeCount: activities.filter((a) => a.status === "active").length,
      closedCount: activities.filter((a) => a.status === "closed").length,
      totalVotes: votesByActivity.reduce((sum, v) => sum + v._count.id, 0),
    };

    return NextResponse.json({
      activities: activitiesWithVotes,
      statistics,
    });
  } catch (error) {
    console.error("获取用户活动失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}