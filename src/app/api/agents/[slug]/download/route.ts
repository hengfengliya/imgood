import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getDownloadableFiles } from "@/lib/agents";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { slug } = await params;
  const files = await getDownloadableFiles(slug);

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

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}.zip"`,
    },
  });
}
