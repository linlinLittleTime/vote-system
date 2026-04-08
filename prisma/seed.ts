import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const styles = [
  {
    id: "default",
    name: "极简柱状图",
    slug: "default-bar",
    thumbnail: null,
  },
  {
    name: "极简卡片流",
    slug: "card-flow",
    thumbnail: null,
  },
  {
    name: "2.5D水晶柱",
    slug: "crystal-bar",
    thumbnail: null,
  },
  {
    name: "液态渐变柱状图",
    slug: "liquid-bar",
    thumbnail: null,
  },
  {
    name: "圆环进度组",
    slug: "donut-group",
    thumbnail: null,
  },
  {
    name: "粒子特效排行",
    slug: "particle-rank",
    thumbnail: null,
  },
  {
    name: "玻璃拟态投票卡",
    slug: "glass-card",
    thumbnail: null,
  },
];

async function main() {
  console.log("开始 seeding 样式数据...");

  for (const style of styles) {
    const existing = await prisma.style.findUnique({
      where: { slug: style.slug },
    });

    if (!existing) {
      await prisma.style.create({
        data: style,
      });
      console.log(`创建样式: ${style.name}`);
    } else {
      console.log(`样式已存在: ${style.name}`);
    }
  }

  console.log("Seeding 完成!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });