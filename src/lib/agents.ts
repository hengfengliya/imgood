import fs from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_LANGUAGE,
  OFFICIAL_WORKSPACE_FILES,
  type AgentDetail,
  type AgentDocument,
  type AgentMeta,
  type Language,
} from "@/types/agent";

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

/** zh 用原文件名，en 用 SOUL.en.md 等 */
function localizedFileName(fileName: string, lang: Language): string {
  if (lang === "zh") return fileName;
  return fileName.replace(/\.md$/i, ".en.md");
}

async function readMeta(agentDir: string) {
  const metaPath = path.join(agentDir, "meta.json");
  const raw = await fs.readFile(metaPath, "utf8");
  return JSON.parse(raw) as AgentMeta;
}

/**
 * 按语言读取文档。
 * en 优先 .en.md，缺则 fallback 到原 zh 文件（语言标 zh，UI 可提示）。
 */
async function readDocument(
  agentDir: string,
  fileName: string,
  lang: Language,
): Promise<AgentDocument> {
  const baseDoc = {
    fileName,
    title: inferTitle(fileName),
    summary: inferSummary(fileName),
    isOfficial: OFFICIAL_WORKSPACE_FILES.includes(fileName as never),
  };

  if (lang === "en") {
    const enPath = path.join(agentDir, localizedFileName(fileName, "en"));
    if (await fileExists(enPath)) {
      return {
        ...baseDoc,
        exists: true,
        sourcePath: enPath,
        sourceType: "agent",
        content: await fs.readFile(enPath, "utf8"),
        language: "en",
      };
    }
  }

  const agentPath = path.join(agentDir, fileName);
  if (await fileExists(agentPath)) {
    return {
      ...baseDoc,
      exists: true,
      sourcePath: agentPath,
      sourceType: "agent",
      content: await fs.readFile(agentPath, "utf8"),
      language: "zh",
    };
  }

  const rootPath = path.join(ROOT_DIR, fileName);
  if (await fileExists(rootPath)) {
    return {
      ...baseDoc,
      exists: true,
      sourcePath: rootPath,
      sourceType: "root",
      content: await fs.readFile(rootPath, "utf8"),
      language: "zh",
    };
  }

  return {
    ...baseDoc,
    exists: false,
    sourcePath: null,
    sourceType: "missing",
    content: null,
    language: lang,
  };
}

export async function getAgentsWithDocuments(lang: Language = DEFAULT_LANGUAGE) {
  const dirs = await listDirectories(AGENTS_DIR);

  const agents = await Promise.all(
    dirs.map(async (dir) => {
      const agentDir = path.join(AGENTS_DIR, dir);
      const meta = await readMeta(agentDir);
      const documents = await Promise.all(
        OFFICIAL_WORKSPACE_FILES.map((file) => readDocument(agentDir, file, lang)),
      );
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
    if (db !== da) return db.localeCompare(da);
    return a.title.localeCompare(b.title);
  });
}

export async function getAgents(lang: Language = DEFAULT_LANGUAGE) {
  const dirs = await listDirectories(AGENTS_DIR);

  const agents = await Promise.all(
    dirs.map(async (dir) => {
      const agentDir = path.join(AGENTS_DIR, dir);
      const meta = await readMeta(agentDir);
      const documents = await Promise.all(
        OFFICIAL_WORKSPACE_FILES.map((file) => readDocument(agentDir, file, lang)),
      );
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
    if (db !== da) return db.localeCompare(da);
    return a.title.localeCompare(b.title);
  });
}

export async function getAgentBySlug(
  slug: string,
  lang: Language = DEFAULT_LANGUAGE,
): Promise<AgentDetail | null> {
  const dirs = await listDirectories(AGENTS_DIR);
  const matchedDir = dirs.find((d) => d.toLowerCase() === slug.toLowerCase());
  if (!matchedDir) return null;

  const agentDir = path.join(AGENTS_DIR, matchedDir);
  const meta = await readMeta(agentDir);
  const documents = await Promise.all(
    OFFICIAL_WORKSPACE_FILES.map((file) => readDocument(agentDir, file, lang)),
  );

  return {
    ...meta,
    slug: matchedDir.toLowerCase(),
    documents,
  };
}

export async function getDownloadableFiles(slug: string, lang: Language = DEFAULT_LANGUAGE) {
  const agent = await getAgentBySlug(slug, lang);
  if (!agent) {
    return null;
  }

  return agent.documents.filter((item) => item.exists && item.content !== null);
}
