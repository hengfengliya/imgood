import Link from "next/link";
import { getAgents } from "@/lib/agents";
import styles from "./page.module.css";

export default async function HomePage() {
  const agents = await getAgents();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>把想要的 Agent，直接带走。</h1>
      </section>

      <section className={styles.library}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Agent Library</p>
            <h2>不同内容，直接往下选。</h2>
          </div>
          <p className={styles.sectionText}>
            每个 Agent 都对应一套可预览、可下载的 workspace 配置包。你先看定位，再进详情页看官方文档结构。
          </p>
        </div>

        <section className={styles.grid}>
          {agents.map((agent) => (
            <Link key={agent.slug} href={`/agents/${agent.slug}`} className={styles.card}>
              <div className={styles.cardGlow} style={{ background: `radial-gradient(circle at top, ${agent.accent}55, transparent 65%)` }} />
              <div className={styles.cardTop}>
                <span className={styles.category}>{agent.category}</span>
                <span className={styles.count}>{agent.completedCount}/{agent.totalCount}</span>
              </div>
              <div className={styles.cardBody}>
                <h3>{agent.title}</h3>
                <p>{agent.subtitle}</p>
                <p className={styles.cardDescription}>{agent.description}</p>
              </div>
              <div className={styles.tags}>
                {agent.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className={styles.footer}>
                <span>查看官方文件结构</span>
                <strong>进入详情</strong>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
