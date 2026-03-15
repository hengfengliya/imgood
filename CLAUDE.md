# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**i'm good openclaw** 是 OpenClaw Agent 库的前端展示站，基于 Next.js 16 App Router 构建。用户可在此浏览、预览并下载 OpenClaw workspace Agent 配置包（ZIP 格式）或单个文档文件。

线上地址：https://imgood-weld.vercel.app/

---

## 开发命令

```bash
npm run dev      # 启动开发服务器（http://localhost:3000）
npm run build    # 生产构建（部署前验证）
npm start        # 启动生产服务器
```

无测试框架，无 lint 脚本。

---

## 新增 Agent（核心操作）

**只需两步，无需改代码，推送后 Vercel 自动部署上线。**

### 第一步：创建目录 + meta.json

在 `workspace/agents/` 下新建一个文件夹，文件夹名即为 URL slug：

```
workspace/agents/
└── your-agent-name/       ← 文件夹名 = slug = URL 路径
    ├── meta.json          ← 必须有
    ├── AGENTS.md          ← 可选
    ├── IDENTITY.md        ← 可选
    ├── USER.md            ← 可选
    ├── SOUL.md            ← 可选
    ├── TOOLS.md           ← 可选
    ├── MEMORY.md          ← 可选
    ├── HEARTBEAT.md       ← 可选
    ├── BOOT.md            ← 可选
    └── BOOTSTRAP.md       ← 可选
```

### 第二步：填写 meta.json

复制以下模板，按需修改：

```json
{
  "slug": "your-agent-name",
  "title": "Agent 显示名称",
  "subtitle": "一句话定位",
  "description": "详细描述，展示在卡片和详情页。",
  "category": "分类标签（如：角色扮演 / 工具助手 / 写作）",
  "audience": ["目标用户1", "目标用户2"],
  "tags": ["Tag1", "Tag2", "Tag3"],
  "accent": "#5dba8c"
}
```

**字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `slug` | — | **可以随意填或不填**，URL 始终以文件夹名（转小写）为准，代码会自动覆盖此字段 |
| `title` | ✅ | 首页卡片和详情页大标题 |
| `subtitle` | ✅ | 卡片副标题 |
| `description` | ✅ | 卡片描述文字（建议 50 字以内） |
| `category` | ✅ | 显示在卡片左上角的分类 |
| `audience` | ✅ | 目标用户数组 |
| `tags` | ✅ | 标签数组，显示在卡片底部 |
| `accent` | ✅ | 统一填 `"#5dba8c"`（全局玉色） |
| `updatedAt` | — | 格式 `"YYYY-MM-DD"`，首页按此字段降序排列（最新在前）；缺失时排到最末 |

### 第三步：推送

```bash
git add workspace/agents/your-agent-name/
git commit -m "feat: add [Agent名称] agent"
git push
```

推送后 Vercel 自动部署，约 1 分钟上线。

---

## 文档文件规范

9 个官方文件均为 Markdown 格式，文件名固定（大写 + `.md`）：

| 文件名 | 作用 |
|--------|------|
| `AGENTS.md` | 运行规则、工作方式与上下文调用约定 |
| `IDENTITY.md` | 身份设定、命名方式与外显角色气质 |
| `USER.md` | 目标用户、服务对象与称呼方式 |
| `SOUL.md` | 核心人格、语气风格和长期行为边界 |
| `TOOLS.md` | 工具清单、技能约定与工作流描述 |
| `MEMORY.md` | 长期稳定记忆与关键偏好存储 |
| `HEARTBEAT.md` | 定时巡检或周期性心跳检查清单 |
| `BOOT.md` | 每次启动时执行的初始化检查步骤 |
| `BOOTSTRAP.md` | 首次初始化的一次性引导内容 |

- 文件不需要全部存在，缺少的会在详情页标记为 Missing
- 首页 Tab 栏会自动出现有内容的文档类型 Tab（如有多个 Agent 都有 SOUL.md，SOUL Tab 会聚合展示）

---

## 架构说明

### 数据流

```
workspace/agents/<slug>/  →  lib/agents.ts (Server)  →  page.tsx  →  UI
```

- `getAgentsWithDocuments()` — 首页用，取全量 Agent + 文档内容
- `getAgentBySlug(slug)` — 详情页用，取单个 Agent 完整数据
- 无数据库，无 API，纯文件系统读取（`node:fs`）

### 路由结构

| 路由 | 类型 | 说明 |
|------|------|------|
| `/` | Static | 首页：wordmark + tab 浏览（ALL + 文档类型 Tab） |
| `/agents/[slug]` | Dynamic | 详情页：Agent header + 文件导航 + 预览 |
| `/api/agents/[slug]/download` | Dynamic | 返回全部文件打包 ZIP |
| `/api/agents/[slug]/files/[fileName]` | Dynamic | 返回单个文件供下载 |

### Server / Client 组件

- `src/app/page.tsx` — Server Component，调用 `getAgentsWithDocuments()`
- `src/components/home/home-tabs.tsx` — **Client Component**，Tab 切换交互
- `src/app/agents/[slug]/page.tsx` — Server Component，调用 `getAgentBySlug()`
- `src/components/agent/agent-detail-client.tsx` — **Client Component**，文件选择与预览交互

### 设计主题

- 背景：深林墨绿 `#060c09`，带 Grain 噪点纹理
- 主色：玉色 `#5dba8c`
- 字体：Fraunces（斜体衬线，标题）+ Syne（几何无衬线，UI 文字）
- CSS 变量统一定义在 `src/app/globals.css`

---

## 变更记录规范

每次修改文件后，须按照全局 CLAUDE.md 规范追加更新本项目的 `change.md`（Append，不覆盖）。
