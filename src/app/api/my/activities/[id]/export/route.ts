import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 用户活动数据导出API
 *
 * GET - 导出活动的投票数据为CSV
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "缺少userId参数" }, { status: 400 });
    }

    const activity = await prisma.activity.findUnique({ where: { id } });

    if (!activity) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    if (activity.userId !== userId) {
      return NextResponse.json({ error: "无权访问此活动" }, { status: 403 });
    }

    // 获取投票数据
    const votes = await prisma.vote.findMany({
      where: { activityId: id },
      orderBy: { createdAt: "desc" },
    });

    // 构建选项映射
    const options = activity.options as unknown as Array<{ id: string; text: string }>;
    const optionMap = new Map(options.map((opt) => [opt.id, opt.text]));

    // 构建CSV内容
    const headers = ["时间", "选项ID", "选项内容", "投票者标识"];
    const rows = votes.map((vote) => [
      new Date(vote.createdAt).toLocaleString("zh-CN"),
      vote.optionId,
      optionMap.get(vote.optionId) || "未知",
      vote.voterId,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    // 返回CSV文件
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="activity_${id}_votes.csv"`,
      },
    });
  } catch (error) {
    console.error("导出失败:", error);
    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }
}