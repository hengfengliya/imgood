import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getDownloadableFiles } from "@/lib/agents";
import { DEFAULT_LANGUAGE, type Language } from "@/types/agent";

type Props = {
  params: Promise<{ slug: string }>;
};

function parseLang(raw: string | null): Language {
  return raw === "en" ? "en" : DEFAULT_LANGUAGE;
}

export async function GET(req: Request, { params }: Props) {
  const { slug } = await params;
  const url = new URL(req.url);
  const lang = parseLang(url.searchParams.get("lang"));

  const files = await getDownloadableFiles(slug, lang);

  if (!files) {
    return NextResponse.json({ message: "Agent not found" }, { status: 404 });
  }

  const zip = new JSZip();
  files.forEach((file) => {
    if (file.content !== null) {
      zip.file(`${slug}/${file.fileName}`, file.content);
    }
  });

  const arrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
  const zipName = lang === "en" ? `${slug}-en.zip` : `${slug}.zip`;

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
    },
  });
}
