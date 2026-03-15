import { getAgentsWithDocuments } from "@/lib/agents";
import HomeTabs from "@/components/home/home-tabs";
import styles from "./page.module.css";

export default async function HomePage() {
  const agents = await getAgentsWithDocuments();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.wordmark}>
          i&apos;m good openclaw
          <span className={styles.wordmarkSub}>agent library</span>
        </p>
        <p className={styles.slogan}>把想要的 Agent，直接带走。</p>
        <p className={styles.sub}>浏览、预览并下载完整的 OpenClaw workspace 配置包。</p>
      </section>

      <div className={styles.divider} />
      <HomeTabs agents={agents} />
    </main>
  );
}
