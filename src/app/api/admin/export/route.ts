import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { generateActivityCSV, generateActivityExcel } from "@/lib/export";
import type { ActivityWhereInput } from "@/types/api";

// GET - 导出全部活动数据（优化版：批量查询避免N+1问题）
export async function GET(request: Request) {
  try {
    // 验证登录状态
    const isAuthenticated = await getAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const status = searchParams.get("status");

    // 构建查询条件（使用类型定义）
    const where: ActivityWhereInput = {};
    if (status && status !== "all") {
      where.status = status as "draft" | "active" | "closed";
    }

    // 并行查询活动列表和所有投票记录（优化：2次查询替代N+1次）
    const [activities, allVotes] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      // 批量获取所有投票记录（一次查询）
      prisma.vote.findMany({
        where: status && status !== "all"
          ? { activity: { status: status as "draft" | "active" | "closed" } }
          : {},
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          activityId: true,
          optionId: true,
          voterId: true,
          createdAt: true,
        },
      }),
    ]);

    // 按活动ID分组投票记录（内存操作，避免多次查询）
    const votesMap = new Map<string, typeof allVotes>();
    for (const vote of allVotes) {
      const activityVotes = votesMap.get(vote.activityId) || [];
      activityVotes.push(vote);
      votesMap.set(vote.activityId, activityVotes);
    }

    // 为没有投票的活动添加空数组
    for (const activity of activities) {
      if (!votesMap.has(activity.id)) {
        votesMap.set(activity.id, []);
      }
    }

    if (format === "csv") {
      const csv = generateActivityCSV(activities.map(a => ({
        ...a,
        options: a.options as Array<{ id: string; text: string; votes?: number }>,
      })));
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="activities_${Date.now()}.csv"`,
        },
      });
    } else if (format === "excel") {
      const buffer = await generateActivityExcel(
        activities.map(a => ({
          ...a,
          options: a.options as Array<{ id: string; text: string; votes?: number }>,
        })),
        votesMap
      );
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="activities_${Date.now()}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "不支持的格式" }, { status: 400 });
  } catch (error) {
    console.error("导出失败:", error);
    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }
}