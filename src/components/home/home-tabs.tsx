"use client";

import { useMemo, useState } from "react";
import { OFFICIAL_WORKSPACE_FILES, type Language, type NsfwLevel } from "@/types/agent";
import { LanguageToggle } from "@/components/common/language-toggle";
import { AgeGate } from "@/components/common/age-gate";
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
  nsfw_level?: NsfwLevel;
};

type Props = {
  agents: Agent[];
  lang: Language;
};

const T = {
  zh: {
    all: "全部",
    enterDetail: "进入详情 →",
    viewFull: "查看完整内容 →",
    showNsfw: "显示 NSFW",
    hideNsfw: "隐藏 NSFW",
    docDesc: {
      "AGENTS.md": "运行规则、工作方式与上下文调用约定。",
      "IDENTITY.md": "身份设定、命名方式与外显角色气质。",
      "USER.md": "目标用户、服务对象与称呼方式。",
      "SOUL.md": "核心人格、语气风格和长期行为边界。",
      "TOOLS.md": "工具清单、技能约定与工作流描述。",
      "MEMORY.md": "长期稳定记忆与关键偏好存储。",
      "HEARTBEAT.md": "定时巡检或周期性心跳检查清单。",
      "BOOT.md": "每次启动时执行的初始化检查步骤。",
      "BOOTSTRAP.md": "首次初始化的一次性引导内容。",
    } as Record<string, string>,
  },
  en: {
    all: "All",
    enterDetail: "Open detail →",
    viewFull: "View full content →",
    showNsfw: "Show NSFW",
    hideNsfw: "Hide NSFW",
    docDesc: {
      "AGENTS.md": "Runtime rules, working style, and context usage.",
      "IDENTITY.md": "Identity, naming, and outward persona traits.",
      "USER.md": "Target user, audience, and addressing style.",
      "SOUL.md": "Core personality, tone, and long-term behavior boundaries.",
      "TOOLS.md": "Tool inventory, skill conventions, workflow notes.",
      "MEMORY.md": "Long-term memory and key preferences.",
      "HEARTBEAT.md": "Periodic check-in / heartbeat checklist.",
      "BOOT.md": "Initialization checks run at every boot.",
      "BOOTSTRAP.md": "One-time first-time setup guide.",
    } as Record<string, string>,
  },
} as const;

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

function detailHref(slug: string, lang: Language) {
  return lang === "en" ? `/agents/${slug}?lang=en` : `/agents/${slug}`;
}

export default function HomeTabs({ agents, lang }: Props) {
  const t = T[lang];
  const [activeTab, setActiveTab] = useState("agents");
  const [hideNsfw, setHideNsfw] = useState(false);

  // 隐藏 NSFW 时只保留显式标记为 sfw 的角色（未标记一律按非 sfw 处理）
  const filteredAgents = useMemo(
    () => (hideNsfw ? agents.filter((a) => a.nsfw_level === "sfw") : agents),
    [agents, hideNsfw],
  );

  const docTabs = OFFICIAL_WORKSPACE_FILES.map((fileName) => {
    const key = "doc_" + fileName.replace(/\.md$/i, "").toLowerCase();
    const label = fileName.replace(/\.md$/i, "");
    const present = filteredAgents.filter((a) =>
      a.documents.some((d) => d.fileName === fileName && d.exists)
    );
    return { key, label, fileName, agents: present };
  }).filter((tab) => tab.agents.length > 0);

  const tabs = [
    { key: "agents", label: t.all, count: filteredAgents.length },
    ...docTabs.map((tab) => ({ key: tab.key, label: tab.label, count: tab.agents.length })),
  ];

  return (
    <div className={styles.root}>
      <AgeGate lang={lang} />

      {/* Tab bar + controls */}
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

        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.nsfwToggle} ${hideNsfw ? styles.nsfwToggleOff : ""}`}
            onClick={() => setHideNsfw((v) => !v)}
            aria-pressed={!hideNsfw}
          >
            {hideNsfw ? t.showNsfw : t.hideNsfw}
          </button>
          <LanguageToggle current={lang} />
        </div>
      </nav>

      {/* Agent tab */}
      {activeTab === "agents" && (
        <div className={styles.grid}>
          {filteredAgents.map((agent) => (
            <a
              key={agent.slug}
              href={detailHref(agent.slug, lang)}
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
                  <span className={styles.cta}>{t.enterDetail}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Document tabs */}
      {docTabs.map(
        (tab) =>
          activeTab === tab.key && (
            <div key={tab.key}>
              <p className={styles.docTabDesc}>{t.docDesc[tab.fileName]}</p>
              <div className={styles.docGrid}>
                {tab.agents.map((agent) => {
                  const doc = agent.documents.find(
                    (d) => d.fileName === tab.fileName
                  );
                  const raw = doc?.content ?? "";
                  const preview = stripMarkdown(raw).slice(0, 240);

                  return (
                    <a
                      key={agent.slug}
                      href={detailHref(agent.slug, lang)}
                      className={styles.docCard}
                      style={{ "--agent-accent": agent.accent } as React.CSSProperties}
                    >
                      <div className={styles.docCardAccent} />
                      <div className={styles.docCardHeader}>
                        <span className={styles.docAgentName}>{agent.title}</span>
                        <span className={styles.docBadge}>{tab.label}</span>
                      </div>
                      <p className={styles.docPreview}>{preview}</p>
                      <span className={styles.docCta}>{t.viewFull}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )
      )}
    </div>
  );
}
