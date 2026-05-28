import { notFound } from "next/navigation";
import { AgentDetailClient } from "@/components/agent/agent-detail-client";
import { getAgentBySlug } from "@/lib/agents";
import { DEFAULT_LANGUAGE, type Language } from "@/types/agent";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

function parseLang(raw?: string): Language {
  return raw === "en" ? "en" : DEFAULT_LANGUAGE;
}

export default async function AgentPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  const agent = await getAgentBySlug(slug, lang);

  if (!agent) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <a href={lang === "en" ? "/?lang=en" : "/"} className={styles.backLink}>
        {lang === "en" ? "← Back to agents" : "返回 Agent 列表"}
      </a>
      <AgentDetailClient agent={agent} lang={lang} />
    </main>
  );
}
