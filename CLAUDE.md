# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**imgood** 是 OpenClaw Agent 库的前端展示站，基于 Next.js 16 App Router 构建。用户可在此浏览、预览并下载 OpenClaw 工作区 Agent 配置包（ZIP 格式）或单个文档文件。

线上地址：https://imgood-weld.vercel.app/

---

## 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm start        # 启动生产服务器
```

无测试框架，无 lint 脚本。

---

## 架构说明

### 数据源

Agent 数据来自文件系统，非数据库：

- `workspace/agents/<slug>/meta.json` — Agent 元数据（名称、描述、颜色、分类、标签等）
- `workspace/agents/<slug>/*.md` — 9 个官方工作区文件（AGENTS.md / IDENTITY.md / USER.md / SOUL.md / TOOLS.md / MEMORY.md / HEARTBEAT.md / BOOT.md / BOOTSTRAP.md）
- 若 Agent 目录中缺少某文件，`lib/agents.ts` 会回退到根目录下的同名文件

数据层入口：`src/lib/agents.ts`（纯 Node.js fs 读取，Server-side only）。

### 路由结构

| 路由 | 说明 |
|------|------|
| `/` | 首页 Agent 卡片画廊 |
| `/agents/[slug]` | Agent 详情页（文档列表 + 预览 + 下载） |
| `/api/agents/[slug]/download` | 返回全部文件打包 ZIP |
| `/api/agents/[slug]/files/[fileName]` | 返回单个文件内容供下载 |

### Server / Client 组件划分

- 页面默认为 Server Component（`page.tsx`）负责数据获取
- `src/components/agent/agent-detail-client.tsx` 是唯一的 Client Component，处理文件选择与内容预览交互

### ZIP 生成

使用 `jszip` 库，在 API Route `api/agents/[slug]/download/route.ts` 中服务端动态生成 ZIP，不预存打包文件。

---

## 新增 Agent 的方式

1. 在 `workspace/agents/` 下创建新目录，目录名即为 `slug`
2. 新建 `meta.json`，字段参考 `workspace/agents/lilithara/meta.json`
3. 按需放入最多 9 个 `.md` 文档文件
4. 重启开发服务器，首页自动读取并展示新 Agent

---

## 变更记录规范

每次修改文件后，须按照全局 CLAUDE.md 规范追加更新本项目的 `change.md`（Append，不覆盖）。
