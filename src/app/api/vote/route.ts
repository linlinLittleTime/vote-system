import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rateLimit";

// 提交投票 - P2增强：支持多选、状态校验、有效期校验、限流保护
export async function POST(request: Request) {
  try {
    // ===== Rate Limiting 保护 =====
    const clientId = getClientIdentifier(request);
    const rateLimitKey = `vote:${clientId}`;
    const rateResult = checkRateLimit(rateLimitKey, RATE_LIMITS.vote);

    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          error: "请求过于频繁，请稍后再试",
          retryAfter: Math.ceil((rateResult.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateResult.resetTime - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateResult.resetTime),
          }
        }
      );
    }

    const body = await request.json();
    const { activityId, optionIds, voterId } = body;

    // 兼容旧版单选请求（optionId -> optionIds）
    const submitOptionIds = optionIds || (body.optionId ? [body.optionId] : null);

    if (!activityId || !submitOptionIds || !voterId) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    if (!Array.isArray(submitOptionIds) || submitOptionIds.length === 0) {
      return NextResponse.json(
        { error: "请选择投票选项" },
        { status: 400 }
      );
    }

    // 检查活动是否存在
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    // ===== P2新增：状态校验 =====
    if (activity.status === "draft") {
      return NextResponse.json({ error: "活动未开始，无法投票" }, { status: 400 });
    }

    if (activity.status === "closed") {
      return NextResponse.json({ error: "活动已结束，无法投票" }, { status: 400 });
    }

    // ===== P2新增：有效期校验 =====
    const now = new Date();
    if (activity.startTime && now < activity.startTime) {
      return NextResponse.json({ error: "活动未开始，请等待活动开启" }, { status: 400 });
    }

    if (activity.endTime && now > activity.endTime) {
      return NextResponse.json({ error: "活动已过期，无法投票" }, { status: 400 });
    }

    // 检查选项是否有效
    const options = activity.options as Array<{ id: string; text: string }>;
    const validOptionIds = submitOptionIds.filter((id) =>
      options.some((opt) => opt.id === id)
    );

    if (validOptionIds.length === 0) {
      return NextResponse.json({ error: "无效的选项" }, { status: 400 });
    }

    // ===== P2新增：投票规则校验 =====
    // 单选校验
    if (activity.ruleType === "single" && validOptionIds.length > 1) {
      return NextResponse.json({ error: "本活动仅支持单选" }, { status: 400 });
    }

    // 多选校验 - 检查已投票数量
    if (activity.ruleType === "multiple" && activity.maxVotes) {
      const existingVotesCount = await prisma.vote.count({
        where: { activityId, voterId },
      });

      if (existingVotesCount + validOptionIds.length > activity.maxVotes) {
        return NextResponse.json(
          {
            error: `最多可选${activity.maxVotes}项，您已选${existingVotesCount}项，本次还可选${activity.maxVotes - existingVotesCount}项`
          },
          { status: 400 }
        );
      }
    }

    // ===== P2新增：批量创建投票（事务） =====
    // 检查是否已对某些选项投票（支持多选后，同一选项不能重复投）
    const existingVotes = await prisma.vote.findMany({
      where: {
        activityId,
        voterId,
        optionId: { in: validOptionIds },
      },
      select: { optionId: true },
    });

    const alreadyVotedIds = existingVotes.map((v) => v.optionId);
    const newOptionIds = validOptionIds.filter((id) => !alreadyVotedIds.includes(id));

    if (newOptionIds.length === 0) {
      return NextResponse.json({ error: "您已对这些选项投票了" }, { status: 400 });
    }

    // 批量创建投票记录
    const votes = await prisma.$transaction(
      newOptionIds.map((optionId) =>
        prisma.vote.create({
          data: { activityId, optionId, voterId },
        })
      )
    );

    return NextResponse.json(
      {
        success: true,
        votesCount: votes.length,
        optionIds: newOptionIds,
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": String(rateResult.remaining),
        }
      }
    );
  } catch (error) {
    console.error("投票失败:", error);
    return NextResponse.json({ error: "投票失败" }, { status: 500 });
  }
}