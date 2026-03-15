import fs from "node:fs/promises";
import path from "node:path";
import { OFFICIAL_WORKSPACE_FILES, type AgentDetail, type AgentDocument, type AgentMeta } from "@/types/agent";

const ROOT_DIR = process.cwd();
const AGENTS_DIR = path.join(ROOT_DIR, "workspace", "agents");

const FALLBACK_FILE_SUMMARIES: Record<string, string> = {
  "AGENTS.md": "定义该 Agent 的运行规则、工作方式与上下文使用方式。",
  "IDENTITY.md": "定义 Agent 的身份设定、命名方式与外显角色气质。",
  "USER.md": "定义目标用户、服务对象与称呼方式。",
  "SOUL.md": "定义 Agent 的核心人格、语气和长期行为边界。",
  "TOOLS.md": "描述工具、技能与工作流约定。",
  "MEMORY.md": "保存长期稳定记忆和关键偏好。",
  "HEARTBEAT.md": "定义定时巡检或心跳检查清单。",
  "BOOT.md": "定义启动时需要执行的检查步骤。",
  "BOOTSTRAP.md": "定义首次初始化时的一次性引导内容。",
};

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listDirectories(dir: string) {
  if (!(await fileExists(dir))) {
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

function inferSummary(fileName: string) {
  return FALLBACK_FILE_SUMMARIES[fileName] ?? "该文件属于 OpenClaw workspace 的配置组成部分。";
}

function inferTitle(fileName: string) {
  return fileName.replace(/\.md$/i, "");
}

async function readMeta(agentDir: string) {
  const metaPath = path.join(agentDir, "meta.json");
  const raw = await fs.readFile(metaPath, "utf8");
  return JSON.parse(raw) as AgentMeta;
}

async function readDocument(agentDir: string, fileName: string): Promise<AgentDocument> {
  const agentPath = path.join(agentDir, fileName);
  const rootPath = path.join(ROOT_DIR, fileName);

  if (await fileExists(agentPath)) {
    return {
      fileName,
      title: inferTitle(fileName),
      summary: inferSummary(fileName),
      isOfficial: OFFICIAL_WORKSPACE_FILES.includes(fileName as never),
      exists: true,
      sourcePath: agentPath,
      sourceType: "agent",
      content: await fs.readFile(agentPath, "utf8"),
    };
  }

  if (await fileExists(rootPath)) {
    return {
      fileName,
      title: inferTitle(fileName),
      summary: inferSummary(fileName),
      isOfficial: OFFICIAL_WORKSPACE_FILES.includes(fileName as never),
      exists: true,
      sourcePath: rootPath,
      sourceType: "root",
      content: await fs.readFile(rootPath, "utf8"),
    };
  }

  return {
    fileName,
    title: inferTitle(fileName),
    summary: inferSummary(fileName),
    isOfficial: OFFICIAL_WORKSPACE_FILES.includes(fileName as never),
    exists: false,
    sourcePath: null,
    sourceType: "missing",
    content: null,
  };
}

export async function getAgentsWithDocuments() {
  const dirs = await listDirectories(AGENTS_DIR);

  const agents = await Promise.all(
    dirs.map(async (dir) => {
      const agentDir = path.join(AGENTS_DIR, dir);
      const meta = await readMeta(agentDir);
      const documents = await Promise.all(OFFICIAL_WORKSPACE_FILES.map((file) => readDocument(agentDir, file)));
      const completedCount = documents.filter((d) => d.exists).length;

      return {
        ...meta,
        slug: dir.toLowerCase(),
        documents,
        completedCount,
        totalCount: OFFICIAL_WORKSPACE_FILES.length,
      };
    }),
  );

  return agents.sort((a, b) => {
    const da = a.updatedAt ?? "";
    const db = b.updatedAt ?? "";
    if (db !== da) return db.localeCompare(da); // 最新在前
    return a.title.localeCompare(b.title);       // 同日期按标题字母序
  });
}

export async function getAgents() {
  const dirs = await listDirectories(AGENTS_DIR);

  const agents = await Promise.all(
    dirs.map(async (dir) => {
      const agentDir = path.join(AGENTS_DIR, dir);
      const meta = await readMeta(agentDir);
      const documents = await Promise.all(OFFICIAL_WORKSPACE_FILES.map((file) => readDocument(agentDir, file)));
      const completedCount = documents.filter((item) => item.exists).length;

      return {
        ...meta,
        slug: dir.toLowerCase(),
        completedCount,
        totalCount: OFFICIAL_WORKSPACE_FILES.length,
      };
    }),
  );

  return agents.sort((a, b) => {
    const da = a.updatedAt ?? "";
    const db = b.updatedAt ?? "";
    if (db !== da) return db.localeCompare(da); // 最新在前
    return a.title.localeCompare(b.title);       // 同日期按标题字母序
  });
}

export async function getAgentBySlug(slug: string): Promise<AgentDetail | null> {
  // Case-insensitive directory lookup so "Elowen" folder works for /agents/elowen
  const dirs = await listDirectories(AGENTS_DIR);
  const matchedDir = dirs.find((d) => d.toLowerCase() === slug.toLowerCase());
  if (!matchedDir) return null;

  const agentDir = path.join(AGENTS_DIR, matchedDir);
  const meta = await readMeta(agentDir);
  const documents = await Promise.all(OFFICIAL_WORKSPACE_FILES.map((file) => readDocument(agentDir, file)));

  return {
    ...meta,
    slug: matchedDir.toLowerCase(),
    documents,
  };
}

export async function getDownloadableFiles(slug: string) {
  const agent = await getAgentBySlug(slug);
  if (!agent) {
    return null;
  }

  return agent.documents.filter((item) => item.exists && item.content !== null);
}
