"use client";

import { useMemo, useState } from "react";
import type { AgentDetail } from "@/types/agent";
import styles from "./agent-detail.module.css";

type Props = {
  agent: AgentDetail;
};

export function AgentDetailClient({ agent }: Props) {
  const availableDocuments = useMemo(() => agent.documents.filter((d) => d.exists), [agent.documents]);
  const [selectedFile, setSelectedFile] = useState(availableDocuments[0]?.fileName ?? agent.documents[0]?.fileName ?? "");
  const currentDocument = agent.documents.find((d) => d.fileName === selectedFile) ?? agent.documents[0];

  return (
    <div className={styles.layout}>

      {/* ── Agent Header ── */}
      <header
        className={styles.agentHeader}
        style={{ ["--agent-accent" as string]: agent.accent }}
      >
        <div className={styles.agentHeaderGlow} />
        <div className={styles.agentHeaderLeft}>
          <span className={styles.categoryBadge}>{agent.category}</span>
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
            <span className={styles.completenessLabel}>files</span>
          </div>
          <a
            href={`/api/agents/${agent.slug}/download`}
            className={styles.downloadBtn}
          >
            下载完整 Agent 包
          </a>
        </div>
      </header>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* File nav */}
        <nav className={styles.fileNav}>
          <p className={styles.fileNavLabel}>Workspace Files</p>
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
                <span>{currentDocument?.isOfficial ? "Official file" : "Extra file"}</span>
                <span className={styles.metaSep}>·</span>
                <span>{currentDocument?.sourceType === "agent" ? "Agent 目录" : currentDocument?.sourceType === "root" ? "仓库根目录映射" : "未找到"}</span>
              </div>
            </div>
            {currentDocument?.exists && (
              <a
                href={`/api/agents/${agent.slug}/files/${encodeURIComponent(currentDocument.fileName)}`}
                className={styles.fileDownloadBtn}
              >
                下载此文件
              </a>
            )}
          </div>

          {currentDocument?.exists ? (
            <pre className={styles.code}>{currentDocument.content}</pre>
          ) : (
            <div className={styles.emptyState}>
              <p>该文件尚未创建</p>
              <span>当前 Agent 还没有这个官方文档。</span>
            </div>
          )}
        </article>

      </div>
    </div>
  );
}
