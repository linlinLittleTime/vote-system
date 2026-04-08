# 炫酷实时投票系统

一款面向企业/学生场景的炫酷实时投票系统，支持多种可视化展示样式、扫码投票、大屏实时展示等功能。

## 功能特点

- 🎨 **6种炫酷展示样式**: 2.5D水晶柱、极简卡片流、液态渐变柱、圆环进度图、粒子特效排行、毛玻璃质感
- 📱 **扫码投票**: 生成二维码，用户扫码即可参与投票
- 🖥️ **大屏实时展示**: 支持投屏到电视或投影仪，数据实时刷新
- 🗳️ **多选投票**: 支持单选和多选，可设置最大可选数
- 📊 **数据导出**: 支持CSV和Excel格式导出
- 🔐 **管理后台**: 活动管理、状态控制、统计看板
- 🖼️ **图片上传**: 支持本地上传(Base64)或URL链接

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS + Framer Motion
- **图表库**: Recharts + Canvas + CSS 3D
- **数据库**: PostgreSQL (Neon)
- **ORM**: Prisma
- **部署**: Vercel

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd vote-system
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
# 数据库连接
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# 管理员Token（用于管理后台登录）
ADMIN_TOKEN="your-secure-admin-token"
```

### 4. 初始化数据库

```bash
# 生成Prisma客户端
npm run build

# 推送数据库schema（开发环境）
npx prisma db push

# 或使用迁移（生产环境）
npx prisma migrate deploy
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/                    # 页面路由
│   ├── page.tsx           # 创建活动页（首页）
│   ├── activity/[id]/     # 活动详情页
│   ├── vote/[id]/         # 投票页面
│   ├── screen/[id]/       # 大屏展示页
│   ├── admin/             # 管理后台
│   ├── api/               # API接口
│   ├── error.tsx          # 全局错误边界
│   └── not-found.tsx      # 404页面
├── components/
│   ├── styles/            # 投票展示样式组件
│   ├── admin/             # 管理后台组件
│   └── ui/                # UI组件（Toast、Loading、LazyImage）
├── lib/
│   ├── prisma.ts          # Prisma客户端
│   ├── auth.ts            # 认证工具
│   ├── csrf.ts            # CSRF保护
│   ├── rateLimit.ts       # 请求限流
│   └── export.ts          # 数据导出工具
├── hooks/                 # React Hooks
└── types/                 # TypeScript类型定义
```

## API接口

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/styles` | GET | 获取所有展示样式 |
| `/api/activities` | POST | 创建活动 |
| `/api/activities/[id]` | GET | 获取活动详情 |
| `/api/activities/[id]/results` | GET | 获取投票结果 |
| `/api/activities/[id]/status` | PATCH | 更改活动状态 |
| `/api/vote` | POST | 提交投票 |
| `/api/admin/auth` | POST/DELETE | 管理员登录/退出 |
| `/api/admin/activities` | GET | 获取活动列表 |
| `/api/admin/dashboard` | GET | 获取统计数据 |
| `/api/admin/export` | GET | 批量导出数据 |

## 部署到Vercel

### 1. 创建Vercel项目

访问 https://vercel.com/new 导入GitHub仓库

### 2. 配置环境变量

在Vercel项目设置中添加：
- `DATABASE_URL`: Neon数据库连接字符串
- `ADMIN_TOKEN`: 管理员登录密码

### 3. 部署

Vercel会自动检测Next.js项目并部署

### 4. 访问地址

- 首页: `https://your-app.vercel.app`
- 管理后台: `https://your-app.vercel.app/admin`
- 投票页: `https://your-app.vercel.app/vote/[id]`
- 大屏页: `https://your-app.vercel.app/screen/[id]`

## 使用说明

### 📖 在线操作手册

访问 `/manual` 查看带图示的交互式操作手册。

### 创建活动

1. 访问首页
2. 选择喜欢的展示样式（右侧实时预览）
3. 填写活动标题和选项
4. 设置投票规则（单选/多选）
5. 点击"创建活动"

### 投票

1. 扫描二维码或访问投票链接
2. 选择选项
3. 点击"提交投票"
4. 查看实时结果

### 管理后台

1. 访问 `/admin/login`
2. 输入管理员Token登录
3. 管理活动列表、查看统计、导出数据

## 安全特性

- ✅ CSRF保护（Token + Origin验证）
- ✅ Rate Limiting（请求限流）
- ✅ Timing-safe认证比较
- ✅ 输入验证和XSS防护
- ✅ 类型安全的API

## 性能优化

- ✅ 图片懒加载
- ✅ API缓存策略
- ✅ 并行数据库查询
- ✅ N+1查询优化
- ✅ 轮询间隔优化（5秒）

## License

MIT

## 贡献

欢迎提交Issue和Pull Request！