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

export type AgentMeta = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  audience: string[];
  tags: string[];
  accent: string;
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
};

export type AgentDetail = AgentMeta & {
  documents: AgentDocument[];
};
