"use client";

import { usePathname } from "next/navigation";
import type { Language } from "@/types/agent";
import styles from "./language-toggle.module.css";

type Props = {
  current: Language;
};

// 直接用 <a>：next typed routes 对动态拼接 query 的支持不友好。
// 这是页面级语言切换，整页刷新可接受。
export function LanguageToggle({ current }: Props) {
  const pathname = usePathname();
  const zhHref = pathname;
  const enHref = `${pathname}?lang=en`;

  return (
    <div className={styles.root} role="group" aria-label="Language">
      <a
        href={zhHref}
        className={`${styles.btn} ${current === "zh" ? styles.active : ""}`}
        aria-pressed={current === "zh"}
      >
        中文
      </a>
      <a
        href={enHref}
        className={`${styles.btn} ${current === "en" ? styles.active : ""}`}
        aria-pressed={current === "en"}
      >
        EN
      </a>
    </div>
  );
}
