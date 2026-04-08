import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { format, subDays, subHours, startOfDay, endOfDay, startOfHour, endOfHour } from "date-fns";
import type { DashboardResponse } from "@/types/api";

// GET - 获取统计数据（优化版：减少数据库查询次数）
export async function GET(): Promise<NextResponse<DashboardResponse | { error: string }>> {
  try {
    // 验证登录状态
    const isAuthenticated = await getAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = subDays(now, 6);
    const todayStart = startOfDay(now);

    // 并行执行所有查询
    const [
      statusStats,
      totalVotes,
      recentVotes,
      activities,
      styles,
      todayVotes,
    ] = await Promise.all([
      // 1. 活动状态分布（一次查询）
      prisma.activity.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // 2. 总票数
      prisma.vote.count(),

      // 3. 最近7天的投票（一次查询，前端分组）
      prisma.vote.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
      }),

      // 4. 所有活动及其票数（两次查询合并）
      prisma.activity.findMany({
        take: 100,
        include: { style: true },
      }),

      // 5. 样式使用统计
      prisma.style.findMany({
        include: { _count: { select: { activities: true } } },
      }),

      // 6. 今日按小时统计（一次查询）
      prisma.vote.findMany({
        where: {
          createdAt: { gte: todayStart },
        },
        select: { createdAt: true },
      }),
    ]);

    // 处理状态分布
    const statusMap = new Map(statusStats.map((s) => [s.status, s._count.id]));
    const totalActivities = statusStats.reduce((sum, s) => sum + s._count.id, 0);

    // 处理最近7天趋势（前端分组）
    const dailyTrend: DashboardResponse["dailyTrend"] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const votes = recentVotes.filter(
        (v) => v.createdAt >= dayStart && v.createdAt <= dayEnd
      ).length;

      dailyTrend.push({
        date: format(dayStart, "MM-dd"),
        votes,
        newActivities: 0, // 暂时忽略，减少查询
      });
    }

    // 处理今日按小时统计（前端分组）
    const hourlyTrend: DashboardResponse["hourlyTrend"] = [];
    for (let i = 23; i >= 0; i--) {
      const hour = subHours(now, i);
      const hourStart = startOfHour(hour);
      const hourEnd = endOfHour(hour);

      const votes = todayVotes.filter(
        (v) => v.createdAt >= hourStart && v.createdAt <= hourEnd
      ).length;

      hourlyTrend.push({
        hour: format(hourStart, "HH:00"),
        votes,
      });
    }

    // 处理热门活动（批量查询票数）
    const activityIds = activities.map((a) => a.id);
    const votesByActivity = await prisma.vote.groupBy({
      by: ["activityId"],
      where: { activityId: { in: activityIds } },
      _count: { id: true },
    });

    const votesMap = new Map(votesByActivity.map((v) => [v.activityId, v._count.id]));

    const activitiesWithVotes = activities.map((a) => ({
      ...a,
      options: a.options as Array<{ id: string; text: string; votes?: number }>,
      votes: votesMap.get(a.id) || 0,
    }));

    const topActivities = activitiesWithVotes
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        title: a.title,
        votes: a.votes,
        status: a.status,
      }));

    // 处理样式使用统计
    const styleUsage = styles.map((s) => ({
      name: s.name,
      count: s._count.activities,
    }));

    return NextResponse.json({
      overview: {
        totalActivities,
        totalVotes,
        activeActivities: statusMap.get("active") || 0,
        avgVotesPerActivity: totalActivities > 0 ? Math.round(totalVotes / totalActivities) : 0,
      },
      statusDistribution: {
        draft: statusMap.get("draft") || 0,
        active: statusMap.get("active") || 0,
        closed: statusMap.get("closed") || 0,
      },
      dailyTrend,
      hourlyTrend,
      topActivities,
      styleUsage,
    });
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}