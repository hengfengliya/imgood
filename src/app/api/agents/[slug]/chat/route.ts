import { NextResponse } from "next/server";
import { getAgentBySlug } from "@/lib/agents";
import { DEFAULT_LANGUAGE, type Language } from "@/types/agent";

type Props = {
  params: Promise<{ slug: string }>;
};

function parseLang(raw: unknown): Language {
  return raw === "en" ? "en" : DEFAULT_LANGUAGE;
}

const RESPONSES = {
  zh: "试看功能即将上线。完整体验请下载该角色的 md 包接入 OpenClaw / Claude Code 本地运行。",
  en: "Live try-it preview coming soon. For the full experience, download the pack and run it locally with OpenClaw / Claude Code.",
} as const;

export async function POST(req: Request, { params }: Props) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const lang = parseLang(body?.lang);

  const agent = await getAgentBySlug(slug, lang);
  if (!agent) {
    return NextResponse.json({ message: "Agent not found" }, { status: 404 });
  }

  // B 阶段：占位响应，503 表示功能尚未启用。
  // 后续接入 grok2api 时只需替换此函数体。
  return NextResponse.json(
    {
      reply: RESPONSES[lang],
      placeholder: true,
      agent: agent.slug,
    },
    { status: 503 },
  );
}
