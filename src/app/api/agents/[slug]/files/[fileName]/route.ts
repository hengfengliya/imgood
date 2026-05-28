import { NextResponse } from "next/server";
import { getAgentBySlug } from "@/lib/agents";
import { DEFAULT_LANGUAGE, type Language } from "@/types/agent";

type Props = {
  params: Promise<{ slug: string; fileName: string }>;
};

function parseLang(raw: string | null): Language {
  return raw === "en" ? "en" : DEFAULT_LANGUAGE;
}

export async function GET(req: Request, { params }: Props) {
  const { slug, fileName } = await params;
  const url = new URL(req.url);
  const lang = parseLang(url.searchParams.get("lang"));

  const agent = await getAgentBySlug(slug, lang);

  if (!agent) {
    return NextResponse.json({ message: "Agent not found" }, { status: 404 });
  }

  const document = agent.documents.find((item) => item.fileName === decodeURIComponent(fileName));
  if (!document || !document.exists || document.content === null) {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }

  // EN 模式下，下载名加 .en 后缀以避免覆盖中文版
  const downloadName =
    lang === "en" && document.language === "en"
      ? document.fileName.replace(/\.md$/i, ".en.md")
      : document.fileName;

  return new NextResponse(document.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
    },
  });
}
