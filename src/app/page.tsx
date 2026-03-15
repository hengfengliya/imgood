import Link from "next/link";
import { getAgents } from "@/lib/agents";
import styles from "./page.module.css";

export default async function HomePage() {
  const agents = await getAgents();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>OpenClaw Workspace Library</p>
          <h1>把官方 Agent 配置包，做成可浏览、可预览、可下载的产品页面。</h1>
          <p className={styles.description}>
            每个 Agent 都按 OpenClaw 官方 workspace 文档结构组织。用户先看定位与气质，再查看 AGENTS、IDENTITY、USER、SOUL 等官方文件，最后按需下载整包或单个文档。
          </p>
        </div>
        <div className={styles.heroPanel}>
          <div>
            <span>官方文档结构</span>
            <strong>9 个核心文件</strong>
          </div>
          <div>
            <span>当前 Agent 数量</span>
            <strong>{agents.length}</strong>
          </div>
          <div>
            <span>适用方式</span>
            <strong>浏览 · 预览 · 下载</strong>
          </div>
        </div>
      </section>

      <section className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionLabel}>Agents</p>
          <h2>按 Agent 类型浏览</h2>
        </div>
        <p className={styles.sectionText}>不是零散文件列表，而是面向最终使用场景的 Agent 卡片目录。</p>
      </section>

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
    </main>
  );
}
