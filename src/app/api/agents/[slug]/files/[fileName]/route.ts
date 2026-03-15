import { NextResponse } from "next/server";
import { getAgentBySlug } from "@/lib/agents";

type Props = {
  params: Promise<{ slug: string; fileName: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { slug, fileName } = await params;
  const agent = await getAgentBySlug(slug);

  if (!agent) {
    return NextResponse.json({ message: "Agent not found" }, { status: 404 });
  }

  const document = agent.documents.find((item) => item.fileName === decodeURIComponent(fileName));
  if (!document || !document.exists || document.content === null) {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }

  return new NextResponse(document.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${document.fileName}"`,
    },
  });
}
