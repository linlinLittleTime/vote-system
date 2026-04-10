import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 验证访问码API
 *
 * 访问码逻辑：
 * - 访问码存储在用户的localStorage中
 * - 数据库中只存储userId
 * - 验证时，查找该userId是否有创建过活动
 *
 * 请求体：{ accessCode: string, userId: string }
 * 响应：{ valid: boolean, userId?: string }
 */
export async function POST(request: Request) {
  try {
    const { accessCode, userId } = await request.json();

    // 方式1：通过userId验证
    if (userId) {
      const activities = await prisma.activity.findFirst({
        where: { userId },
        select: { id: true },
      });

      if (activities) {
        return NextResponse.json({ valid: true, userId });
      }
    }

    // 方式2：尝试从已有活动中查找（不推荐，仅作为备选）
    // 注意：由于访问码不存储在数据库，无法直接通过访问码查找
    // 需要用户在新设备上输入userId

    return NextResponse.json({ valid: false });
  } catch (error) {
    console.error("验证访问码失败:", error);
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}