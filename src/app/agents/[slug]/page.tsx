import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentDetailClient } from "@/components/agent/agent-detail-client";
import { getAgentBySlug } from "@/lib/agents";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function AgentPage({ params }: Props) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.backLink}>
        返回 Agent 列表
      </Link>
      <AgentDetailClient agent={agent} />
    </main>
  );
}
