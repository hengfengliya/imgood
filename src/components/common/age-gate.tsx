"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/types/agent";
import styles from "./age-gate.module.css";

const STORAGE_KEY = "imgood-age-confirmed-v1";

type Props = {
  lang: Language;
};

const T = {
  zh: {
    title: "成年内容确认",
    body: "本站包含成人 (NSFW) 角色扮演 prompt 与配置。请确认你已年满 18 周岁、所在地区允许访问此类内容、且在私密环境使用。",
    accept: "我已年满 18 岁，进入",
    leave: "未满 18 岁，离开",
    leaveTo: "https://www.google.com/",
  },
  en: {
    title: "Adult content confirmation",
    body: "This site hosts adult (NSFW) roleplay prompts and configurations. Please confirm you are 18+ and that local laws allow you to view such content, and use it in private.",
    accept: "I'm 18+, enter",
    leave: "Under 18, leave",
    leaveTo: "https://www.google.com/",
  },
} as const;

export function AgeGate({ lang }: Props) {
  const t = T[lang];
  const [mounted, setMounted] = useState(false);
  const [confirmed, setConfirmed] = useState(true); // 默认 true 防止 SSR 闪烁

  useEffect(() => {
    setMounted(true);
    try {
      setConfirmed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setConfirmed(false);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode 等场景静默失败 */
    }
    setConfirmed(true);
  }

  if (!mounted || confirmed) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className={styles.panel}>
        <h2 id="age-gate-title" className={styles.title}>{t.title}</h2>
        <p className={styles.body}>{t.body}</p>
        <div className={styles.actions}>
          <a className={styles.leave} href={t.leaveTo} rel="noopener noreferrer">
            {t.leave}
          </a>
          <button type="button" className={styles.accept} onClick={accept}>
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
