import { getAgentsWithDocuments } from "@/lib/agents";
import HomeTabs from "@/components/home/home-tabs";
import { DEFAULT_LANGUAGE, type Language } from "@/types/agent";
import styles from "./page.module.css";

type Props = {
  searchParams: Promise<{ lang?: string }>;
};

function parseLang(raw?: string): Language {
  return raw === "en" ? "en" : DEFAULT_LANGUAGE;
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  const agents = await getAgentsWithDocuments(lang);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.wordmark}>
          i&apos;m good openclaw
        </p>
        <p className={styles.slogan}>
          {lang === "en" ? "Take the agent you want, ready to go." : "把想要的 Agent，直接带走。"}
        </p>
      </section>

      <div className={styles.divider} />
      <HomeTabs agents={agents} lang={lang} />
    </main>
  );
}
