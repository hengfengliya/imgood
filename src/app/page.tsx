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
        </p>
        <p className={styles.slogan}>把想要的 Agent，直接带走。</p>
      </section>

      <div className={styles.divider} />
      <HomeTabs agents={agents} />
    </main>
  );
}
