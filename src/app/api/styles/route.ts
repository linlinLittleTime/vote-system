import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取所有可用样式
export async function GET() {
  try {
    const styles = await prisma.style.findMany({
      orderBy: { createdAt: "asc" },
    });

    // 样式列表可以缓存1小时（样式不频繁变化）
    return NextResponse.json(styles, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("获取样式列表失败:", error);
    return NextResponse.json({ error: "获取样式列表失败" }, { status: 500 });
  }
}