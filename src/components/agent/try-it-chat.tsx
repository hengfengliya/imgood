"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentDetail, Language } from "@/types/agent";
import styles from "./try-it-chat.module.css";

type Props = {
  agent: AgentDetail;
  lang: Language;
  onClose: () => void;
};

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;
};

const T = {
  zh: {
    title: "试看效果",
    subtitle: "在站内直接和角色聊几句",
    placeholder: "输入消息后回车发送…",
    send: "发送",
    close: "关闭",
    thinking: "她正在打字…",
    intro: (name: string) => `你正在与 ${name} 试聊。第一条消息发送后会进入她的人设场景。`,
    errorBusy: "服务暂未上线。功能即将开放，先把这套 md 下载到本地接入 OpenClaw 体验完整版吧。",
    nsfwBanner: "⚠️ 角色为 NSFW 内容，建议成年人在私密环境使用。",
  },
  en: {
    title: "Try it now",
    subtitle: "Chat with the persona in-browser",
    placeholder: "Type a message and press Enter…",
    send: "Send",
    close: "Close",
    thinking: "She's typing…",
    intro: (name: string) => `You're test-chatting with ${name}. The persona kicks in after the first message.`,
    errorBusy: "Service not yet live. Coming soon — for now download the pack and run it locally with OpenClaw for the full experience.",
    nsfwBanner: "⚠️ NSFW persona. Adults only, please use in private.",
  },
} as const;

export function TryItChat({ agent, lang, onClose }: Props) {
  const t = T[lang];
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: t.intro(agent.title), ts: Date.now() },
  ]);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSend() {
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: Message = { role: "user", content: text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch(`/api/agents/${agent.slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], lang }),
      });
      const data = await res.json();
      const reply: Message = {
        role: "assistant",
        content: data?.reply ?? t.errorBusy,
        ts: Date.now(),
      };
      setMessages((m) => [...m, reply]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: t.errorBusy, ts: Date.now() },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        style={{ ["--agent-accent" as string]: agent.accent }}
      >
        <header className={styles.header}>
          <div>
            <h3 className={styles.title}>
              {t.title} <span className={styles.agentName}>· {agent.title}</span>
            </h3>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t.close}>
            ✕
          </button>
        </header>

        {(agent.nsfw_level === "explicit" || agent.nsfw_level === "soft") && (
          <div className={styles.nsfwBanner}>{t.nsfwBanner}</div>
        )}

        <div className={styles.messages} ref={listRef}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.msg} ${styles[`msg_${m.role}`]}`}>
              {m.content}
            </div>
          ))}
          {busy && <div className={`${styles.msg} ${styles.msg_assistant} ${styles.thinking}`}>{t.thinking}</div>}
        </div>

        <form
          className={styles.inputRow}
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className={styles.input}
            placeholder={t.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            autoFocus
          />
          <button type="submit" className={styles.sendBtn} disabled={!input.trim() || busy}>
            {t.send}
          </button>
        </form>
      </div>
    </div>
  );
}
