import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { generateVoteCSV, generateActivityExcel } from "@/lib/export";
import type { ActivityOption } from "@/types/api";

// GET - 导出单个活动数据
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
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    // 并行查询活动和投票记录
    const [activity, votes] = await Promise.all([
      prisma.activity.findUnique({ where: { id } }),
      prisma.vote.findMany({
        where: { activityId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!activity) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    const options = activity.options as ActivityOption[];

    if (format === "csv") {
      const csv = generateVoteCSV(votes, options);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="activity_${id}.csv"`,
        },
      });
    } else if (format === "excel") {
      const votesMap = new Map([[id, votes]]);
      const buffer = await generateActivityExcel(
        [{
          ...activity,
          options,
        }],
        votesMap
      );

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="activity_${id}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "不支持的格式" }, { status: 400 });
  } catch (error) {
    console.error("导出失败:", error);
    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }
}