import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { validateCsrfRequest } from "@/lib/csrf";
import type { ActivityWhereInput, ActivityWithVotes } from "@/types/api";

// GET: 获取活动列表（支持搜索、筛选、分页）- 优化版
export async function GET(request: Request) {
  try {
    // 验证登录状态
    const isAuthenticated = await getAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // 构建查询条件（使用类型定义）
    const where: ActivityWhereInput = {};
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (status !== "all") {
      where.status = status as "draft" | "active" | "closed";
    }

    // 并行执行所有查询（优化：减少等待时间）
    const [activities, total, votesByActivity, statistics] = await Promise.all([
      // 查询活动列表
      prisma.activity.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { style: true },
      }),
      // 获取总数
      prisma.activity.count({ where }),
      // 批量获取所有活动的票数（一次查询）
      prisma.vote.groupBy({
        by: ["activityId"],
        _count: { id: true },
      }),
      // 统计摘要（一次查询获取所有状态）
      prisma.activity.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // 构建票数映射
    const votesMap = new Map(
      votesByActivity.map((v) => [v.activityId, v._count.id])
    );

    // 计算统计摘要
    const statsMap = new Map(
      statistics.map((s) => [s.status, s._count.id])
    );

    // 合并活动数据
    const activitiesWithVotes: ActivityWithVotes[] = activities.map((activity) => ({
      ...activity,
      options: activity.options as Array<{ id: string; text: string; votes?: number }>,
      totalVotes: votesMap.get(activity.id) || 0,
    }));

    // 计算总票数
    const totalVotes = votesByActivity.reduce((sum, v) => sum + v._count.id, 0);

    return NextResponse.json({
      activities: activitiesWithVotes,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      statistics: {
        totalActivities: total,
        draftCount: statsMap.get("draft") || 0,
        activeCount: statsMap.get("active") || 0,
        closedCount: statsMap.get("closed") || 0,
        totalVotes,
      },
    });
  } catch (error) {
    console.error("获取活动列表失败:", error);
    return NextResponse.json({ error: "获取活动列表失败" }, { status: 500 });
  }
}