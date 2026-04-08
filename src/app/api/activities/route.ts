import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rateLimit";

// 输入验证配置
const INPUT_LIMITS = {
  titleMaxLength: 100,
  descriptionMaxLength: 500,
  optionTextMaxLength: 50,
  optionImageUrlMaxLength: 500,
  maxOptions: 20,
  minOptions: 2,
};

// 生成唯一ID（避免高并发重复）
function generateOptionId(index: number): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `opt_${timestamp}_${random}_${index}`;
}

// 创建活动 - P2增强：支持投票规则、有效期、状态等新字段
export async function POST(request: Request) {
  try {
    // ===== Rate Limiting 保护 =====
    const clientId = getClientIdentifier(request);
    const rateLimitKey = `createActivity:${clientId}`;
    const rateResult = checkRateLimit(rateLimitKey, RATE_LIMITS.createActivity);

    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          error: "请求过于频繁，请稍后再试",
          retryAfter: Math.ceil((rateResult.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      options,
      styleId,
      // P2新增字段
      ruleType = "single",
      maxVotes,
      voterIdType = "localStorage",
      startTime,
      endTime,
      status = "active",
      styleConfig,
    } = body;

    // ===== 输入验证 =====
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "请提供活动标题" }, { status: 400 });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      return NextResponse.json({ error: "活动标题不能为空" }, { status: 400 });
    }
    if (trimmedTitle.length > INPUT_LIMITS.titleMaxLength) {
      return NextResponse.json(
        { error: `活动标题不能超过${INPUT_LIMITS.titleMaxLength}字符` },
        { status: 400 }
      );
    }

    // 描述验证
    if (description && typeof description === "string" && description.length > INPUT_LIMITS.descriptionMaxLength) {
      return NextResponse.json(
        { error: `活动描述不能超过${INPUT_LIMITS.descriptionMaxLength}字符` },
        { status: 400 }
      );
    }

    // 选项验证
    if (!options || !Array.isArray(options)) {
      return NextResponse.json({ error: "请提供投票选项" }, { status: 400 });
    }

    if (options.length < INPUT_LIMITS.minOptions) {
      return NextResponse.json({ error: `至少需要${INPUT_LIMITS.minOptions}个选项` }, { status: 400 });
    }

    if (options.length > INPUT_LIMITS.maxOptions) {
      return NextResponse.json({ error: `最多支持${INPUT_LIMITS.maxOptions}个选项` }, { status: 400 });
    }

    // 验证每个选项
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const optText = typeof opt === "string" ? opt : opt?.text;

      if (!optText || typeof optText !== "string" || optText.trim().length === 0) {
        return NextResponse.json({ error: `选项${i + 1}不能为空` }, { status: 400 });
      }

      if (optText.length > INPUT_LIMITS.optionTextMaxLength) {
        return NextResponse.json(
          { error: `选项${i + 1}文本不能超过${INPUT_LIMITS.optionTextMaxLength}字符` },
          { status: 400 }
        );
      }

      // 验证图片URL长度
      if (opt?.imageUrl && typeof opt.imageUrl === "string" && opt.imageUrl.length > INPUT_LIMITS.optionImageUrlMaxLength) {
        return NextResponse.json(
          { error: `选项${i + 1}图片URL过长` },
          { status: 400 }
        );
      }
    }

    // P2校验：多选时maxVotes合理性
    if (ruleType === "multiple" && maxVotes) {
      if (maxVotes < 1) {
        return NextResponse.json({ error: "最大可选数必须大于0" }, { status: 400 });
      }
      if (maxVotes > options.length) {
        return NextResponse.json({ error: "最大可选数不能超过选项总数" }, { status: 400 });
      }
    }

    // P2校验：时间有效性
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json({ error: "时间格式无效" }, { status: 400 });
      }
      if (end <= start) {
        return NextResponse.json({ error: "结束时间必须大于开始时间" }, { status: 400 });
      }
    }

    // 初始化每个选项的票数为0（使用唯一ID生成器）
    const optionsWithVotes = options.map((opt, index) => ({
      id: generateOptionId(index),
      text: (typeof opt === "string" ? opt : opt.text).trim(),
      imageUrl: typeof opt === "object" && opt.imageUrl ? opt.imageUrl.trim() : null,
      votes: 0,
    }));

    const activity = await prisma.activity.create({
      data: {
        title: trimmedTitle,
        description: description?.trim() || null,
        styleId: styleId || "default",
        options: optionsWithVotes,
        // P2新增字段
        ruleType,
        maxVotes: maxVotes || null,
        voterIdType,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        status,
        styleConfig: styleConfig || null,
      },
      include: { style: true },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("创建活动失败:", error);
    return NextResponse.json({ error: "创建活动失败" }, { status: 500 });
  }
}

// 获取活动列表
export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { style: true },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("获取活动列表失败:", error);
    return NextResponse.json({ error: "获取活动列表失败" }, { status: 500 });
  }
}