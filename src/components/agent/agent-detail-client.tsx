"use client";

import { useMemo, useState } from "react";
import type { AgentDetail, Language } from "@/types/agent";
import { LanguageToggle } from "@/components/common/language-toggle";
import { TryItChat } from "@/components/agent/try-it-chat";
import styles from "./agent-detail.module.css";

type Props = {
  agent: AgentDetail;
  lang: Language;
};

const T = {
  zh: {
    files: "files",
    download: "下载完整 Agent 包",
    workspaceFiles: "Workspace Files",
    official: "Official file",
    extra: "Extra file",
    agentDir: "Agent 目录",
    rootDir: "仓库根目录映射",
    notFound: "未找到",
    downloadFile: "下载此文件",
    emptyTitle: "该文件尚未创建",
    emptyHint: "当前 Agent 还没有这个官方文档。",
    tryIt: "试看效果",
    fallbackNotice: "（该文件无英文版，已 fallback 到中文）",
  },
  en: {
    files: "files",
    download: "Download full agent pack",
    workspaceFiles: "Workspace Files",
    official: "Official file",
    extra: "Extra file",
    agentDir: "Agent directory",
    rootDir: "Repo root mapping",
    notFound: "Not found",
    downloadFile: "Download this file",
    emptyTitle: "Not created yet",
    emptyHint: "This official document hasn't been written for this agent.",
    tryIt: "Try it now",
    fallbackNotice: "(No English version, falling back to Chinese)",
  },
} as const;

export function AgentDetailClient({ agent, lang }: Props) {
  const t = T[lang];
  const availableDocuments = useMemo(() => agent.documents.filter((d) => d.exists), [agent.documents]);
  const [selectedFile, setSelectedFile] = useState(availableDocuments[0]?.fileName ?? agent.documents[0]?.fileName ?? "");
  const [showChat, setShowChat] = useState(false);
  const currentDocument = agent.documents.find((d) => d.fileName === selectedFile) ?? agent.documents[0];

  const downloadHref = `/api/agents/${agent.slug}/download${lang === "en" ? "?lang=en" : ""}`;
  const fileDownloadHref = currentDocument?.exists
    ? `/api/agents/${agent.slug}/files/${encodeURIComponent(currentDocument.fileName)}${lang === "en" ? "?lang=en" : ""}`
    : "#";

  // 在 en 模式下，若当前文档实际语言不是 en（fallback 到 zh），显示提示
  const showFallbackNotice = lang === "en" && currentDocument?.exists && currentDocument.language !== "en";

  return (
    <div className={styles.layout}>

      {/* ── Agent Header ── */}
      <header
        className={styles.agentHeader}
        style={{ ["--agent-accent" as string]: agent.accent }}
      >
        <div className={styles.agentHeaderGlow} />
        <div className={styles.agentHeaderLeft}>
          <div className={styles.headerTopRow}>
            <span className={styles.categoryBadge}>{agent.category}</span>
            <LanguageToggle current={lang} />
          </div>
          <h1 className={styles.agentName}>{agent.title}</h1>
          <p className={styles.agentSubtitle}>{agent.subtitle}</p>
          <p className={styles.agentDesc}>{agent.description}</p>
          <div className={styles.tagRow}>
            {agent.tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div className={styles.agentHeaderRight}>
          <div className={styles.completeness}>
            <span className={styles.completenessNum}>{availableDocuments.length}</span>
            <span className={styles.completenessTotal}>/{agent.documents.length}</span>
            <span className={styles.completenessLabel}>{t.files}</span>
          </div>
          <button
            type="button"
            className={styles.tryItBtn}
            onClick={() => setShowChat(true)}
          >
            {t.tryIt}
          </button>
          <a href={downloadHref} className={styles.downloadBtn}>
            {t.download}
          </a>
        </div>
      </header>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* File nav */}
        <nav className={styles.fileNav}>
          <p className={styles.fileNavLabel}>{t.workspaceFiles}</p>
          {agent.documents.map((doc) => (
            <button
              key={doc.fileName}
              type="button"
              className={`${styles.fileItem} ${doc.fileName === selectedFile ? styles.fileItemActive : ""} ${!doc.exists ? styles.fileItemMissing : ""}`}
              onClick={() => setSelectedFile(doc.fileName)}
            >
              <span className={styles.fileItemName}>{doc.title}</span>
              <span className={doc.exists ? styles.dotAvailable : styles.dotMissing} />
            </button>
          ))}
        </nav>

        {/* Preview panel */}
        <article className={styles.preview}>
          <div className={styles.previewHeader}>
            <div>
              <h2 className={styles.previewTitle}>{currentDocument?.fileName ?? "—"}</h2>
              <div className={styles.previewMeta}>
                <span>{currentDocument?.isOfficial ? t.official : t.extra}</span>
                <span className={styles.metaSep}>·</span>
                <span>
                  {currentDocument?.sourceType === "agent"
                    ? t.agentDir
                    : currentDocument?.sourceType === "root"
                      ? t.rootDir
                      : t.notFound}
                </span>
                {showFallbackNotice && (
                  <>
                    <span className={styles.metaSep}>·</span>
                    <span className={styles.fallbackNotice}>{t.fallbackNotice}</span>
                  </>
                )}
              </div>
            </div>
            {currentDocument?.exists && (
              <a href={fileDownloadHref} className={styles.fileDownloadBtn}>
                {t.downloadFile}
              </a>
            )}
          </div>

          {currentDocument?.exists ? (
            <pre className={styles.code}>{currentDocument.content}</pre>
          ) : (
            <div className={styles.emptyState}>
              <p>{t.emptyTitle}</p>
              <span>{t.emptyHint}</span>
            </div>
          )}
        </article>

      </div>

      {showChat && (
        <TryItChat agent={agent} lang={lang} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}
