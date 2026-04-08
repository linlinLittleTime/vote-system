# 投票系统部署指南

## 一、前置准备

### 1. 注册账号

| 服务 | 用途 | 注册地址 |
|------|------|---------|
| GitHub | 代码托管 | https://github.com |
| Vercel | 应用部署 | https://vercel.com |
| Neon | PostgreSQL数据库 | https://neon.tech |

### 2. 创建 Neon 数据库

1. 登录 Neon 控制台
2. 点击 "Create a project"
3. 填写项目名称，选择区域（建议选 Singapore）
4. 创建完成后，复制连接字符串

```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 二、部署步骤

### 步骤 1：下载源代码

```bash
# 克隆仓库
git clone https://github.com/你的用户名/vote-system.git
cd vote-system
```

### 步骤 2：配置环境变量

创建 `.env` 文件：

```env
# 数据库连接（从 Neon 获取）
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# 管理员密码（自己设置，建议16位以上）
ADMIN_TOKEN="YourSecureToken123!"

# 可选：自定义域名
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
```

### 步骤 3：推送到 GitHub

```bash
git add .
git commit -m "初始化投票系统"
git push origin main
```

### 步骤 4：在 Vercel 部署

1. 登录 https://vercel.com
2. 点击 "Add New Project"
3. 选择 GitHub 仓库 "vote-system"
4. 点击 "Import"
5. 在 "Environment Variables" 中添加：
   - `DATABASE_URL` = 你的数据库连接
   - `ADMIN_TOKEN` = 你的管理员密码
6. 点击 "Deploy"
7. 等待 2-3 分钟完成部署

### 步骤 5：初始化数据库

部署完成后，在本地执行：

```bash
# 安装依赖
npm install

# 推送数据库结构
npx prisma db push
```

或者使用 Prisma Studio 查看数据：

```bash
npx prisma studio
```

---

## 三、访问地址

部署成功后，你会获得一个 Vercel 域名：

```
https://vote-system-xxx.vercel.app
```

### 功能入口

| 功能 | 地址 | 说明 |
|------|------|------|
| 首页 | `/` | 创建投票活动 |
| 操作手册 | `/manual` | 带图示的使用教程 |
| 投票页 | `/vote/[id]` | 参与投票 |
| 大屏页 | `/screen/[id]` | 实时展示 |
| 管理登录 | `/admin/login` | 输入 ADMIN_TOKEN 登录 |
| 管理后台 | `/admin` | 活动管理、数据导出 |

---

## 四、自定义域名（可选）

### 1. 在 Vercel 添加域名

1. 进入项目设置 → Domains
2. 输入你的域名，如 `vote.yourcompany.com`
3. 按提示添加 DNS 记录

### 2. 更新环境变量

```env
NEXT_PUBLIC_BASE_URL="https://vote.yourcompany.com"
```

---

## 五、常见问题

### Q: 部署后访问报错？

检查：
1. 环境变量是否正确配置
2. 数据库连接是否正常
3. 查看 Vercel 的部署日志

### Q: 管理员密码忘记？

在 Vercel 环境变量中修改 `ADMIN_TOKEN`，重新部署即可。

### Q: 数据库连接失败？

1. 检查 DATABASE_URL 格式是否正确
2. 确认 Neon 数据库是否正常运行
3. 检查 IP 白名单设置

---

## 六、技术支持

- 操作手册：访问 `/manual` 页面
- 问题反馈：GitHub Issues
- 文档更新：查看 README.md