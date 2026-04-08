import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { validateCsrfRequest } from "@/lib/csrf";
import type { BatchOperationRequest, Status } from "@/types/api";

// POST - 批量操作
export async function POST(request: Request) {
  try {
    // 验证登录状态
    const isAuthenticated = await getAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // CSRF 验证
    const csrfValid = await validateCsrfRequest(request);
    if (!csrfValid) {
      return NextResponse.json({ error: "CSRF验证失败" }, { status: 403 });
    }

    const body: BatchOperationRequest = await request.json();
    const { action, activityIds, targetStatus } = body;

    if (!action || !activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      return NextResponse.json(
        { error: "参数无效" },
        { status: 400 }
      );
    }

    let affectedCount = 0;

    switch (action) {
      case "delete":
        // 批量删除（级联删除投票记录）
        const deleteResult = await prisma.activity.deleteMany({
          where: { id: { in: activityIds } },
        });
        affectedCount = deleteResult.count;
        break;

      case "changeStatus":
        if (!targetStatus || !["draft", "active", "closed"].includes(targetStatus)) {
          return NextResponse.json(
            { error: "无效的目标状态" },
            { status: 400 }
          );
        }
        const updateResult = await prisma.activity.updateMany({
          where: { id: { in: activityIds } },
          data: { status: targetStatus as Status },
        });
        affectedCount = updateResult.count;
        break;

      default:
        return NextResponse.json(
          { error: "未知的操作类型" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      affectedCount,
      message: `成功处理 ${affectedCount} 个活动`,
    });
  } catch (error) {
    console.error("批量操作失败:", error);
    return NextResponse.json({ error: "批量操作失败" }, { status: 500 });
  }
}