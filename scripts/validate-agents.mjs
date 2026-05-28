#!/usr/bin/env node
/**
 * imgood / validate-agents
 *
 * 在 CI 推送前确保 workspace/agents 满足质量门槛:
 *   1. 每个角色目录必须有 meta.json
 *   2. meta.json 必须有 title / subtitle / description / category / accent
 *   3. SOUL.md / IDENTITY.md / USER.md 三件套必须存在（中文原版）
 *   4. nsfw_level 若存在必须是 sfw / soft / explicit 之一
 *   5. primary_language 若存在必须是 zh / en 之一
 *
 * 任何角色 fail → exit(1)，CI 报错。
 */

import fs from "node:fs/promises";
import path from "node:path";

const AGENTS_DIR = path.join(process.cwd(), "workspace", "agents");
const REQUIRED_FILES = ["SOUL.md", "IDENTITY.md", "USER.md"];
const REQUIRED_META_FIELDS = ["title", "subtitle", "description", "category", "accent"];
const VALID_NSFW = new Set(["sfw", "soft", "explicit"]);
const VALID_LANG = new Set(["zh", "en"]);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(AGENTS_DIR))) {
    console.error(`✖ AGENTS_DIR not found: ${AGENTS_DIR}`);
    process.exit(1);
  }

  const dirs = (await fs.readdir(AGENTS_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let failed = 0;
  const summary = [];

  for (const slug of dirs) {
    const dir = path.join(AGENTS_DIR, slug);
    const errors = [];

    const metaPath = path.join(dir, "meta.json");
    if (!(await exists(metaPath))) {
      errors.push("missing meta.json");
    } else {
      try {
        const meta = JSON.parse(await fs.readFile(metaPath, "utf8"));
        for (const field of REQUIRED_META_FIELDS) {
          if (!meta[field]) errors.push(`meta.json missing field: ${field}`);
        }
        if (meta.nsfw_level && !VALID_NSFW.has(meta.nsfw_level)) {
          errors.push(`meta.json invalid nsfw_level: ${meta.nsfw_level}`);
        }
        if (meta.primary_language && !VALID_LANG.has(meta.primary_language)) {
          errors.push(`meta.json invalid primary_language: ${meta.primary_language}`);
        }
      } catch (e) {
        errors.push(`meta.json invalid JSON: ${e.message}`);
      }
    }

    for (const f of REQUIRED_FILES) {
      if (!(await exists(path.join(dir, f)))) {
        errors.push(`missing ${f}`);
      }
    }

    if (errors.length > 0) {
      failed++;
      summary.push(`✖ ${slug}: ${errors.join(", ")}`);
    } else {
      summary.push(`✓ ${slug}`);
    }
  }

  console.log(summary.join("\n"));
  console.log("");
  console.log(`Total: ${dirs.length} agents, ${failed} failed`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
