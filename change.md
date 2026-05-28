# 2026-05-28

## 🚀 Phase A 工程化补齐 + Phase B 试看 UI 占位 + 双语 i18n + NSFW 年龄门 + CI

> 11:30 | Context: office-hours 战略路线 A→C→B；本次完成 A 全部 + B 的 UI 占位。约束：所有文档双语（zh + en），但 21 个 NSFW SOUL/IDENTITY/USER 的英文翻译保留给人工。

### A1 - 6 角色 × 6 文件框架补齐（42 zh-md）
- 按 Lilithara 模板批量为 Aeloria / Seraphine / velmoria / Elowen / zelphira / malvyra 生成：
  - `AGENTS.md` / `BOOT.md` / `BOOTSTRAP.md` / `HEARTBEAT.md` / `TOOLS.md`（5 个框架 stub × 6 角色 = 30）
  - `MEMORY.md`（6 角色，按各 SOUL kink 风格定制 2-3 条 seed memory + 渐进追踪规则）
- 详情页 "Missing" 标签全部消失。

### A3 - EN 双语版本（45 en-md，18 待人工）
- ✅ 全部 7 角色 × 6 框架文件 = 42 个 `*.en.md`（AGENTS / BOOT / BOOTSTRAP / HEARTBEAT / MEMORY / TOOLS）
- ✅ lilithara SOUL/IDENTITY/USER `.en.md`（原本就是英文，等同复制；`primary_language: en`）
- ⏸️ 6 角色 × SOUL/IDENTITY/USER = 18 个 `.en.md` 暂未生成 — 这些是 explicit NSFW 角色脚本，请人工翻译或在独立 session 处理
- 缺失行为：前端按 i18n fallback 契约自动加载 zh 原版并在文件 meta 处提示「(该文件无英文版，已 fallback 到中文)」

### A4 - 前端 i18n + 语言 toggle
- `src/types/agent.ts`：新增 `Language`/`NsfwLevel`/`SUPPORTED_LANGUAGES`/`DEFAULT_LANGUAGE` 导出；`AgentMeta` 加 `primary_language?` + `nsfw_level?`；`AgentDocument` 加 `language` 字段表实际加载语言
- `src/lib/agents.ts`：所有读函数加 `lang: Language = "zh"` 参数；`readDocument` 在 en 模式优先 `<FILE>.en.md`，缺则回落 zh 原文件并标记 `language: "zh"`
- `src/app/page.tsx` / `src/app/agents/[slug]/page.tsx`：accept `searchParams.lang`，传给数据层；返回链接根据 lang 自动加 `?lang=en`
- `src/components/common/language-toggle.tsx`：新增「中文 / EN」圆角胶囊切换器（用原生 `<a>` 走整页刷新，规避 Next 16 typed-routes 对 query 拼接不友好）
- `src/components/agent/agent-detail-client.tsx`：完整双语化；header 加 LanguageToggle；fallback 提示样式
- `src/components/home/home-tabs.tsx`：完整双语化；列表卡片 / 文档卡片改用 `<a>` 携带 lang query

### A5 - meta.json nsfw_level + primary_language + 站内年龄门 + NSFW 过滤
- 7 个 meta.json 全部新增 `nsfw_level`（lilithara/Aeloria/velmoria/zelphira/malvyra=`explicit`；Seraphine/Elowen=`soft`）+ `primary_language`（lilithara=`en`，其余=`zh`）
- `src/components/common/age-gate.tsx`：首次访问 modal 年龄确认（localStorage `imgood-age-confirmed-v1` 持久化），未满 18 跳转 google
- HomeTabs 新增「显示/隐藏 NSFW」toggle（隐藏时只保留 `nsfw_level === "sfw"` 角色，目前 0 个）

### B - 站内"试看效果"聊天 UI 占位（不接真 API）
- `src/components/agent/try-it-chat.tsx`：详情页 header 按钮 → 全屏 overlay 模态聊天（消息流 / 系统消息 / 用户消息 / assistant 消息 / 输入框 / 加载态 / NSFW banner）；按 ESC 关闭
- `src/app/api/agents/[slug]/chat/route.ts`：POST 占位 — 返回 503 + 「试看功能即将上线，请下载 md 接入 OpenClaw」提示；接 grok2api 时只换函数体即可
- nsfw_level 为 explicit/soft 时聊天面板顶部显示成人内容警告

### A6 - 校验脚本 + GitHub Actions
- `scripts/validate-agents.mjs`：node 原生（无新依赖）；校验每个角色有 meta.json + SOUL/IDENTITY/USER + meta 必填字段 + nsfw_level/primary_language 取值合法；任何 fail 退出 1
- `package.json` 加 `"validate": "node scripts/validate-agents.mjs"` script
- `.github/workflows/validate.yml`：push/PR 到 main 时跑 validate + `tsc --noEmit`

### API 改造
- `/api/agents/[slug]/download?lang=en`：按语言打 zip，zip 文件名 `<slug>-en.zip`
- `/api/agents/[slug]/files/[fileName]?lang=en`：按语言提供单文件下载，EN 文件下载名加 `.en` 后缀
- `/api/agents/[slug]/chat`：新增（POST），占位

### 验证
- 本地 `node scripts/validate-agents.mjs`：7/7 ✓
- 本地 `npm run build`：✓ Compiled successfully + TypeScript check 通过
- 路由 prerender：3 个静态 + 5 个动态

### 待办（设计文档已记载，下次启动）
- 18 个 explicit NSFW SOUL/IDENTITY/USER 英文翻译（6 角色 × 3）
- The Assignment：找 5 个 linux.do OP 帖回应用户私信问「接 OpenClaw 跑通了吗？卡在哪？」
- C 阶段（一键安装 npx imgood install）：等 The Assignment 反馈 + OpenClaw 稳定 1 个月再启
- B 阶段接真 grok2api：用户决定专用 key 时再上

---

# 2026-03-15

## ✨ 搭建 OpenClaw Agent 展示与下载前端
> 18:22 | Context: 从空仓库起步，将本地 Agent 配置文件按 OpenClaw 官方 workspace 文档结构组织，并落地可浏览、可预览、可下载的 Next.js 前端页面。

- **变更文件**:
  - `A` package.json
  - `A` tsconfig.json
  - `A` next-env.d.ts
  - `A` next.config.mjs
  - `A` src/app/layout.tsx
  - `A` src/app/globals.css
  - `A` src/app/page.tsx
  - `A` src/app/page.module.css
  - `A` src/app/agents/[slug]/page.tsx
  - `A` src/app/agents/[slug]/page.module.css
  - `A` src/app/api/agents/[slug]/download/route.ts
  - `A` src/app/api/agents/[slug]/files/[fileName]/route.ts
  - `A` src/components/agent/agent-detail-client.tsx
  - `A` src/components/agent/agent-detail.module.css
  - `A` src/lib/agents.ts
  - `A` src/types/agent.ts
  - `A` workspace/agents/lilithara/meta.json
  - `A` workspace/agents/lilithara/AGENTS.md
  - `A` workspace/agents/lilithara/IDENTITY.md
  - `A` workspace/agents/lilithara/USER.md
  - `A` workspace/agents/lilithara/SOUL.md
  - `A` workspace/agents/lilithara/TOOLS.md
  - `A` workspace/agents/lilithara/MEMORY.md
  - `A` workspace/agents/lilithara/HEARTBEAT.md
  - `A` workspace/agents/lilithara/BOOT.md
  - `A` workspace/agents/lilithara/BOOTSTRAP.md
  - `A` change.md
- **细节**:
  - 建立首页 Agent 卡片浏览页与详情页，按官方 workspace 文件结构展示文档完整度与单文件预览。
  - 接入本地 `workspace/agents/*` 目录作为数据源，并补齐 zip 整包下载与单文件下载接口。
  - 以仓库现有 `IDENTITY.md`、`SOUL.md`、`USER.md` 为基础沉淀首个示例 Agent 包，便于后续继续扩展更多 Agent。
  - 完成 `npm run build` 构建验证，确认当前实现可正常生产构建。

# 2026-03-15

## 🐛 补齐前端仓库忽略规则
> 18:40 | Context: 构建验证后补齐 Next.js 产物与依赖目录忽略规则，避免仓库状态被本地产物污染。

- **变更文件**:
  - `A` .gitignore
- **细节**:
  - 忽略 `node_modules/` 与 `.next/`，保持仓库提交面聚焦源码与配置。
  - 为后续继续扩展 Agent 内容与前端页面提供更干净的版本管理基础。

# 2026-03-15

## ♻️ 收敛首页首屏为单句宣传语
> 19:02 | Context: 用户要求首页首屏弱化说明信息与统计面板，只保留一句宣传语，并让内容区更快进入 Agent 展示。

- **变更文件**:
  - `M` src/app/page.tsx
  - `M` src/app/page.module.css
  - `M` change.md
- **细节**:
  - 移除首页首屏右侧信息面板与冗余说明，改为更聚焦的单句大标题结构。
  - 将内容展示区前置，首屏之后直接进入 Agent 卡片浏览，页面节奏更直接。
  - 完成 `npm run build` 验证，确认本次首页调整可正常构建。

# 2026-03-15

## 📝 同步首页改版已推送线上
> 19:10 | Context: 用户要求将本次首页首屏收敛改版记录到当前项目目录下的 change.md，补充线上推送状态。

- **变更文件**:
  - `M` change.md
- **细节**:
  - 记录首页首屏改单句宣传语并已推送到 GitHub 与 Vercel 自动部署链路。
  - 当前线上地址为 `https://imgood-weld.vercel.app/`，刷新后可查看最新首页版本。

# 2026-03-15

## 📝 初始化 CLAUDE.md 项目治理文档
> 19:30 | Context: 通过 /init 命令分析仓库结构，生成项目级 CLAUDE.md，为后续 Claude Code 实例提供架构说明与开发规范。

- **变更文件**:
  - `A` CLAUDE.md
  - `M` change.md
- **细节**:
  - 记录开发命令（dev / build / start）与项目技术栈。
  - 说明数据源为文件系统（workspace/agents/*），非数据库。
  - 梳理路由结构、Server/Client 组件划分、ZIP 生成机制。
  - 提供新增 Agent 的操作步骤（4 步）。

# 2026-03-15

## ✨ 首页 UI 重构：Tab 导航 + 视觉全面提升
> 20:00 | Context: 原首页 hero 过高（72vh）、巨型混排字体换行混乱、缺乏内容层次。用户要求重新设计布局：压缩 hero、增加 Tab 切换（Agent 总览 + 各文档类型独立 Tab）。

- **变更文件**:
  - `M` src/app/page.tsx
  - `M` src/app/page.module.css
  - `M` src/lib/agents.ts
  - `A` src/components/home/home-tabs.tsx
  - `A` src/components/home/home-tabs.module.css
  - `M` change.md
- **细节**:
  - Hero 从 72vh 压缩至 38vh，字号从 168px 降至 88px，解决中英文混排换行混乱问题。
  - 新增 `getAgentsWithDocuments()` 在 server 端一次性取全量 Agent 数据（含文档内容）。
  - 新增 `HomeTabs` Client Component：Tab 1 展示 Agent 卡片，后续 Tab 按文档类型（SOUL/IDENTITY/TOOLS 等）聚合展示各 Agent 对应文件的预览卡片。
  - Tab bar sticky 吸顶，带毛玻璃背景；文档 Tab 卡片有左侧 accent 色条。
  - 修复 AGENTS.md Tab key 与 Agent 总览 key 碰撞导致双重渲染的 bug（前缀 `doc_`）。
  - `npm run build` 构建验证通过。

# 2026-03-15

## ✨ 设计主题重构：墨绿×玉色 + 产品名 Wordmark
> 21:00 | Context: 用户要求抛弃通用紫色调，升级为高端「深林墨绿×玉色」主题，并重构 hero 区展示产品名，去除残留紫色，Tab 一统一命名。

- **变更文件**:
  - `M` src/app/layout.tsx
  - `M` src/app/globals.css
  - `M` src/app/page.tsx
  - `M` src/app/page.module.css
  - `M` src/components/home/home-tabs.tsx
  - `M` src/components/home/home-tabs.module.css
  - `M` workspace/agents/lilithara/meta.json
  - `M` change.md
- **细节**:
  - 全局色彩体系从紫色重构为深林墨绿（`#060c09`）× 玉色（`#5dba8c`），附 Grain 噪点纹理提升质感。
  - 字体从 Cormorant Garamond + Manrope 升级为 Fraunces（斜体衬线，高端 editorial）+ Syne（几何无衬线）。
  - Hero 从单句宣传语重构为产品名 Wordmark：`i'm good`（大号 Fraunces 斜体）+ `OPENCLAW`（小号 Syne 追踪）+ slogan + 副标题，去除 eyebrow label。
  - Lilithara 的 `accent` 从 `#d27aff`（紫）改为 `#c9a96e`（暖金），消除全站残留紫色。
  - 第一个 Tab 由 "Agent" 重命名为 "All"，语义更准确。
  - 左右页面 padding 收窄至 24px，max-width 扩至 1480px，宽屏更充分利用空间。

# 2026-03-15

## ✨ 首页细节修复 + 详情页布局全面重构
> 21:30 | Context: 修复 wordmark 换行、文档 Tab 内容区拥挤、详情页仍使用旧紫色主题三个问题。

- **变更文件**:
  - `M` src/app/page.tsx
  - `M` src/app/page.module.css
  - `M` src/components/home/home-tabs.module.css
  - `M` src/components/agent/agent-detail-client.tsx
  - `M` src/components/agent/agent-detail.module.css
  - `M` src/app/agents/[slug]/page.module.css
  - `M` change.md
- **细节**:
  - Wordmark 改为单行显示：`i'm good openclaw` 全部在一行 Fraunces 斜体，`AGENT LIBRARY` 作为小号追踪字幕居中于其下。
  - 文档 Tab 内容区顶部增加 36px padding，消除紧贴 tab bar 的拥挤感；Agent 卡片 grid 同步增加 28px 顶部间距。
  - 详情页从三栏（sidebar + 文件列表 + 预览）重构为：全宽 Agent header（含暖金光晕、斜体大标题、9/9 files 计数、下载按钮）+ 双栏（200px sticky 文件导航 + 宽预览面板）。
  - 详情页全面应用新主题：forest panel 背景、玉色 active 状态、Fraunces 斜体标题、jade 下载按钮。
  - 构建通过，无 TypeScript 错误。
