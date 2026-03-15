"use client";

import { useMemo, useState } from "react";
import type { AgentDetail } from "@/types/agent";
import styles from "./agent-detail.module.css";

type Props = {
  agent: AgentDetail;
};

export function AgentDetailClient({ agent }: Props) {
  const availableDocuments = useMemo(() => agent.documents.filter((item) => item.exists), [agent.documents]);
  const [selectedFile, setSelectedFile] = useState(availableDocuments[0]?.fileName ?? agent.documents[0]?.fileName ?? "");

  const currentDocument = agent.documents.find((item) => item.fileName === selectedFile) ?? agent.documents[0];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.introCard} style={{ ["--agent-accent" as string]: agent.accent }}>
          <p className={styles.eyebrow}>{agent.category}</p>
          <h1>{agent.title}</h1>
          <p className={styles.subtitle}>{agent.subtitle}</p>
          <p className={styles.description}>{agent.description}</p>
          <div className={styles.tags}>
            {agent.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className={styles.downloadCard}>
          <p className={styles.cardLabel}>下载</p>
          <h2>直接导出官方 workspace 包</h2>
          <p>整包下载会把当前 Agent 下已存在的官方文档全部打成 zip，方便用户直接放入 OpenClaw workspace。</p>
          <a href={`/api/agents/${agent.slug}/download`} className={styles.primaryButton}>
            下载完整 Agent 包
          </a>
        </div>
      </aside>

      <section className={styles.content}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Official Workspace Files</p>
            <h2>浏览官方文档结构</h2>
          </div>
          <p className={styles.sectionHint}>优先展示官方文件是否齐全，再进入单文件预览与下载。</p>
        </div>

        <div className={styles.documentGrid}>
          <div className={styles.documentList}>
            {agent.documents.map((document) => (
              <button
                type="button"
                key={document.fileName}
                className={`${styles.documentButton} ${document.fileName === selectedFile ? styles.documentButtonActive : ""}`}
                onClick={() => setSelectedFile(document.fileName)}
              >
                <div>
                  <strong>{document.title}</strong>
                  <p>{document.summary}</p>
                </div>
                <span className={document.exists ? styles.stateAvailable : styles.stateMissing}>
                  {document.exists ? "Available" : "Missing"}
                </span>
              </button>
            ))}
          </div>

          <article className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <div>
                <p className={styles.cardLabel}>预览文件</p>
                <h3>{currentDocument?.fileName ?? "未选择文件"}</h3>
              </div>
              {currentDocument?.exists ? (
                <a href={`/api/agents/${agent.slug}/files/${encodeURIComponent(currentDocument.fileName)}`} className={styles.secondaryButton}>
                  下载当前文件
                </a>
              ) : null}
            </div>

            {currentDocument?.exists ? (
              <>
                <div className={styles.previewMeta}>
                  <span>{currentDocument.isOfficial ? "Official file" : "Extra file"}</span>
                  <span>来源：{currentDocument.sourceType === "agent" ? "Agent 目录" : "仓库根目录映射"}</span>
                </div>
                <pre className={styles.code}>{currentDocument.content}</pre>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>当前 Agent 还没有这个官方文件。</p>
                <span>这意味着页面会保留结构占位，但不会提供下载。</span>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
