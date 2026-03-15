"use client";

import Link from "next/link";
import { useState } from "react";
import { OFFICIAL_WORKSPACE_FILES } from "@/types/agent";
import styles from "./home-tabs.module.css";

type AgentDocument = {
  fileName: string;
  exists: boolean;
  content: string | null;
};

type Agent = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  tags: string[];
  accent: string;
  completedCount: number;
  totalCount: number;
  documents: AgentDocument[];
};

type Props = {
  agents: Agent[];
};

const DOC_DESCRIPTIONS: Record<string, string> = {
  "AGENTS.md": "运行规则、工作方式与上下文调用约定。",
  "IDENTITY.md": "身份设定、命名方式与外显角色气质。",
  "USER.md": "目标用户、服务对象与称呼方式。",
  "SOUL.md": "核心人格、语气风格和长期行为边界。",
  "TOOLS.md": "工具清单、技能约定与工作流描述。",
  "MEMORY.md": "长期稳定记忆与关键偏好存储。",
  "HEARTBEAT.md": "定时巡检或周期性心跳检查清单。",
  "BOOT.md": "每次启动时执行的初始化检查步骤。",
  "BOOTSTRAP.md": "首次初始化的一次性引导内容。",
};

function stripMarkdown(text: string): string {
  return text
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\n{2,}/g, " · ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function HomeTabs({ agents }: Props) {
  const [activeTab, setActiveTab] = useState("agents");

  const docTabs = OFFICIAL_WORKSPACE_FILES.map((fileName) => {
    const key = "doc_" + fileName.replace(/\.md$/i, "").toLowerCase();
    const label = fileName.replace(/\.md$/i, "");
    const present = agents.filter((a) =>
      a.documents.some((d) => d.fileName === fileName && d.exists)
    );
    return { key, label, fileName, agents: present };
  }).filter((t) => t.agents.length > 0);

  const tabs = [
    { key: "agents", label: "All", count: agents.length },
    ...docTabs.map((t) => ({ key: t.key, label: t.label, count: t.agents.length })),
  ];

  return (
    <div className={styles.root}>
      {/* Tab bar */}
      <nav className={styles.tabBar}>
        <div className={styles.tabList}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className={styles.tabCount}>{tab.count}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Agent tab */}
      {activeTab === "agents" && (
        <div className={styles.grid}>
          {agents.map((agent) => (
            <Link
              key={agent.slug}
              href={`/agents/${agent.slug}`}
              className={styles.agentCard}
            >
              <div
                className={styles.cardGlow}
                style={{
                  background: `radial-gradient(ellipse at 50% -20%, ${agent.accent}50, transparent 70%)`,
                }}
              />
              <div className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <span className={styles.category}>{agent.category}</span>
                  <span className={styles.progress}>
                    <span
                      className={styles.progressFill}
                      style={{
                        width: `${(agent.completedCount / agent.totalCount) * 100}%`,
                        background: agent.accent,
                      }}
                    />
                  </span>
                  <span className={styles.count}>
                    {agent.completedCount}/{agent.totalCount}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.agentTitle}>{agent.title}</h3>
                  <p className={styles.agentSubtitle}>{agent.subtitle}</p>
                  <p className={styles.agentDesc}>{agent.description}</p>
                </div>

                <div className={styles.cardBottom}>
                  <div className={styles.tags}>
                    {agent.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className={styles.cta}>进入详情 →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Document tabs */}
      {docTabs.map(
        (tab) =>
          activeTab === tab.key && (
            <div key={tab.key}>
              <p className={styles.docTabDesc}>{DOC_DESCRIPTIONS[tab.fileName]}</p>
              <div className={styles.docGrid}>
                {tab.agents.map((agent) => {
                  const doc = agent.documents.find(
                    (d) => d.fileName === tab.fileName
                  );
                  const raw = doc?.content ?? "";
                  const preview = stripMarkdown(raw).slice(0, 240);

                  return (
                    <Link
                      key={agent.slug}
                      href={`/agents/${agent.slug}`}
                      className={styles.docCard}
                      style={{ "--agent-accent": agent.accent } as React.CSSProperties}
                    >
                      <div className={styles.docCardAccent} />
                      <div className={styles.docCardHeader}>
                        <span className={styles.docAgentName}>{agent.title}</span>
                        <span className={styles.docBadge}>{tab.label}</span>
                      </div>
                      <p className={styles.docPreview}>{preview}</p>
                      <span className={styles.docCta}>查看完整内容 →</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )
      )}
    </div>
  );
}
