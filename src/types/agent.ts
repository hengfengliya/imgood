export const OFFICIAL_WORKSPACE_FILES = [
  "AGENTS.md",
  "IDENTITY.md",
  "USER.md",
  "SOUL.md",
  "TOOLS.md",
  "MEMORY.md",
  "HEARTBEAT.md",
  "BOOT.md",
  "BOOTSTRAP.md",
] as const;

export type OfficialWorkspaceFile = (typeof OFFICIAL_WORKSPACE_FILES)[number];

export const SUPPORTED_LANGUAGES = ["zh", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "zh";

export type NsfwLevel = "sfw" | "soft" | "explicit";

export type AgentMeta = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  audience: string[];
  tags: string[];
  accent: string;
  updatedAt?: string; // YYYY-MM-DD，用于排序，缺失时排到最后
  primary_language?: Language; // 角色的原生语言；缺省为 zh
  nsfw_level?: NsfwLevel; // 内容分级；缺省按 explicit 处理（保守）
};

export type AgentDocument = {
  fileName: string;
  title: string;
  summary: string;
  isOfficial: boolean;
  exists: boolean;
  sourcePath: string | null;
  sourceType: "agent" | "root" | "missing";
  content: string | null;
  language: Language; // 实际加载的语言（fallback 可能与请求不同）
};

export type AgentDetail = AgentMeta & {
  documents: AgentDocument[];
};
